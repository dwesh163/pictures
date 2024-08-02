import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';
import { v4 as uuidv4 } from 'uuid';
import { AccredUser } from '@/types/user';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export async function getGalleries(email: string): Promise<any> {
	let connection;
	try {
		const userId = await getId(email);
		connection = await connectMySQL();
		await connection.execute('SET SESSION group_concat_max_len = 100000000;');

		const [galleries]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
            SELECT
                g.galleryId,
                g.userId,
                g.name AS galleryName,
                g.description,
                g.createdAt,
                g.updatedAt,
				g.coverImage,
                g.publicId,
                g.public,
                g.published,
                (
                    SELECT GROUP_CONCAT(
								JSON_OBJECT(
										'imageId', i.imageId, 'userId', i.userId, 'imageUrl', i.imageUrl
								)
								ORDER BY i.createdAt DESC SEPARATOR ','
						)
					FROM images i
							JOIN image_gallery ig ON i.imageId = ig.imageId
					WHERE ig.galleryId = g.galleryId
                ) AS images,
                (
                    SELECT GROUP_CONCAT(
                                JSON_OBJECT(
                                        'name', u.name,
                                        'image', u.image
                                ) ORDER BY gua2.accreditationId DESC SEPARATOR ','
                        )
                    FROM users u
                            JOIN gallery_user_accreditations gua2 ON u.userId = gua2.userId
                    WHERE gua2.galleryId = g.galleryId
                    LIMIT 4
                ) AS accredited_users
            FROM gallery g
                    LEFT JOIN gallery_user_accreditations gua ON g.galleryId = gua.galleryId
            WHERE g.userId = ?
            OR gua.userId = ?
            GROUP BY g.galleryId;
        `,
			[userId, userId]
		);

		if (!galleries.length) {
			return null;
		}

		return galleries;
	} catch (error) {
		console.error('Error getting gallery:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function getGallery(publicId: string, email: string): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();
		await connection.execute('SET SESSION group_concat_max_len = 100000000;');
		const [galleries]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
			SELECT
				g.galleryId,
				CASE
					WHEN u.nameDisplay = 1 THEN u.name
					ELSE u.username
				END AS userName,
				g.name AS galleryName,
				g.description,
				g.createdAt,
				g.updatedAt,
				g.publicId,
				g.public,
				g.published,
				g.coverImage,
				g.coverFont,
				g.coverText,
				(
					SELECT GROUP_CONCAT(
								JSON_OBJECT(
										'imageId', i.imageId, 'userId', i.userId, 'imageUrl', i.imageUrl
								)
								ORDER BY i.createdAt DESC SEPARATOR ','
						)
					FROM images i
							JOIN image_gallery ig ON i.imageId = ig.imageId
					WHERE ig.galleryId = g.galleryId
				) AS images,
				(
					SELECT GROUP_CONCAT(
								JSON_OBJECT(
										'name', CASE
													WHEN accredited_users_sub.nameDisplay = 1 THEN accredited_users_sub.name
													ELSE accredited_users_sub.username
									END, 'image', accredited_users_sub.image, 'email', accredited_users_sub.email, 'accreditationId', accredited_users_sub.accreditationId
								)
								ORDER BY accredited_users_sub.accreditationId DESC SEPARATOR ','
						)
					FROM (
							SELECT u.userId, u.nameDisplay, u.username, u.image, u.email, u.name, gua.accreditationId
							FROM users u
									JOIN gallery_user_accreditations gua ON u.userId = gua.userId
							WHERE gua.galleryId = g.galleryId

							UNION ALL
							SELECT u.userId, u.nameDisplay, u.username, u.image, u.email,  u.name,0 AS accreditationId
							FROM users u
							WHERE u.userId = g.userId

						) AS accredited_users_sub
				) AS accredited_users
			FROM gallery g
					LEFT JOIN users u ON g.userId = u.userId
			WHERE
				g.publicId = ?
			AND (EXISTS (
				SELECT 1
				FROM gallery_user_accreditations gua
				WHERE gua.galleryId = g.galleryId
				AND gua.userId = (SELECT userId FROM users WHERE email = ?)
			) OR g.userId = (SELECT userId FROM users WHERE email = ?));
        `,
			[publicId, email, email]
		);

		if (!galleries.length) {
			return null;
		}

		const gallery = galleries.map((gallery) => {
			return {
				...gallery,
				images: JSON.parse(`[ ${gallery.images} ]`),
				accredited_users: JSON.parse(`[ ${gallery.accredited_users} ]`),
			};
		})[0];

		return gallery;
	} catch (error) {
		console.error('Error getting gallery:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function createGallery(name: string, description: string, email: string): Promise<any> {
	let connection;
	try {
		const id = uuidv4();
		connection = await connectMySQL();
		await connection.execute('INSERT INTO gallery (name, description, publicId, userId) VALUES (?, ?, ?, (SELECT userId FROM users WHERE email = ?))', [name, description, id, email]);
		return id;
	} catch (error) {
		console.error('Error creating gallery:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function canEditGallery(publicId: string, email: string): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();
		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
			SELECT * FROM gallery g
			WHERE
				g.publicId = ?
			AND (EXISTS (
				SELECT 1
				FROM gallery_user_accreditations gua
				WHERE gua.galleryId = g.galleryId
				AND gua.userId = (SELECT userId FROM users WHERE email = ?)
			) OR g.userId = (SELECT userId FROM users WHERE email = ?));
		`,
			[publicId, email, email]
		);

		if (!rows.length) {
			return false;
		} else {
			return true;
		}
	} catch (error) {
		console.error('Error checking if user can edit gallery:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function saveImage(imageUrl: string, email: string, galleryId: string, fileInfo: any): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();

		const [[totalSize]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT SUM(fileSize) AS totalSize FROM images WHERE userId = (SELECT userId FROM users WHERE email = ?)', [email]);

		if (parseInt(totalSize.totalSize) > parseInt(String(process.env.TOTAL_IMAGE_SIZE) || '100000')) {
			console.log(totalSize.totalSize, process.env.TOTAL_IMAGE_SIZE);

			throw new Error('Total image size exceeded');
		}

		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM images WHERE fileInfo = ? AND userId = (SELECT userId FROM users WHERE email = ?)', [fileInfo, email]);

		if (rows.length) {
			throw new Error('Image already exists');
		}

		await connection.execute('INSERT INTO images (imageUrl, userId, fileSize, fileInfo) VALUES (?, (SELECT userId FROM users WHERE email = ?), ?, ?)', [imageUrl, email, fileInfo.size, fileInfo]);

		const [[image]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT imageId FROM images WHERE imageUrl = ?', [imageUrl]);

		await connection.execute('INSERT INTO image_gallery (imageId, galleryId) VALUES (?, ?)', [image.imageId, galleryId]);
	} catch (error) {
		console.error('Error saving image:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function getAccreditedUsers(galleryId: string): Promise<AccredUser[]> {
	let connection;
	try {
		connection = await connectMySQL();
		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
			SELECT
				u.userId,
				CASE
					WHEN u.nameDisplay = 1 THEN u.name
					ELSE u.username
				END AS name,
				u.image,
				u.email,
				gua.accreditationId
			FROM users u
				JOIN gallery_user_accreditations gua ON u.userId = gua.userId
				LEFT JOIN gallery g ON gua.galleryId = g.galleryId
			WHERE g.publicId = ? 
			UNION ALL
				SELECT  u.userId,
						CASE
							WHEN u.nameDisplay = 1 THEN u.name
							ELSE u.username
							END AS name,
						u.image,
						''  AS email,
						0 AS accreditationId
				FROM users u
				LEFT JOIN gallery g on u.userId = g.userId
				WHERE g.publicId = ?;
		`,
			[galleryId, galleryId]
		);

		return rows as AccredUser[];
	} catch (error) {
		console.error('Error getting accredited users:', error);
		throw new Error(`Failed to retrieve accredited users`);
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function updateAccreditation(galleryId: string, userId: number, accreditationId: number): Promise<void> {
	let connection;
	try {
		connection = await connectMySQL();

		const [[user]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM gallery_user_accreditations WHERE userId = ? AND galleryId = (SELECT galleryId FROM gallery WHERE publicId = ?)', [userId, galleryId]);

		if (accreditationId === 0) {
			return;
		}

		if (!user) {
			throw new Error(`User not found`);
		} else if (user.accreditationId === accreditationId) {
			return;
		} else {
			await connection.execute(`UPDATE gallery_user_accreditations SET accreditationId = ? WHERE userId = ? AND galleryId = (SELECT galleryId FROM gallery WHERE publicId = ?)`, [accreditationId, userId, galleryId]);
		}
	} catch (error) {
		console.error('Error updating accreditation:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function getId(email: string): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();
		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

		if (rows.length === 0) {
			throw new Error('User not found');
		}

		return rows[0].userId;
	} catch (error) {
		console.error('Error getting user ID:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';
import { v4 as uuidv4 } from 'uuid';
import { AccredUser } from '@/types/user';
import { Gallery, Image, Tag } from '@/types/gallery';
import { sendEmail } from './mail';
import path from 'path';
import fs from 'fs';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export async function getPublicGalleries(): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();

		const [galleries]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
			SELECT
				g.galleryId,
				COALESCE(
					(
						SELECT JSON_ARRAYAGG(i.imageUrl) AS imageUrls
						FROM images i
						WHERE i.imageId IN (
							SELECT JSON_UNQUOTE(JSON_EXTRACT(g.coverImages, CONCAT('$[', idx, ']')))
							FROM (
								SELECT 0 AS idx
								UNION ALL SELECT 1
								UNION ALL SELECT 2
								UNION ALL SELECT 3
							) AS indices
							WHERE JSON_UNQUOTE(JSON_EXTRACT(g.coverImages, CONCAT('$[', idx, ']'))) IS NOT NULL
						)
						ORDER BY i.createdAt DESC
						LIMIT 4
					),
					(
						SELECT JSON_ARRAYAGG(imageUrl)
						FROM (
							SELECT i.imageUrl
							FROM images i
							LEFT JOIN image_gallery ig ON i.imageId = ig.imageId
							WHERE ig.galleryId = g.galleryId
							ORDER BY i.createdAt DESC
							LIMIT 4
						) AS limited_images
					)
				) AS coverImages,
				g.coverFont,
				g.coverText,
				g.publicId,
				g.public,
				g.published
			FROM gallery g
			LEFT JOIN gallery_user_accreditations gua ON g.galleryId = gua.galleryId
			WHERE g.published = 1 AND g.public = 1;
        `
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
				COALESCE(
					(
						SELECT JSON_ARRAYAGG(i.imageUrl) AS imageUrls
						FROM images i
						WHERE i.imageId IN (
							SELECT JSON_UNQUOTE(JSON_EXTRACT(g.coverImages, CONCAT('$[', idx, ']')))
							FROM (
								SELECT 0 AS idx
								UNION ALL SELECT 1
								UNION ALL SELECT 2
								UNION ALL SELECT 3
							) AS indices
							WHERE JSON_UNQUOTE(JSON_EXTRACT(g.coverImages, CONCAT('$[', idx, ']'))) IS NOT NULL
						)
						ORDER BY i.createdAt DESC
						LIMIT 4
					),
					(
						SELECT JSON_ARRAYAGG(i.imageUrl)
						FROM images i
						JOIN image_gallery ig ON i.imageId = ig.imageId
						WHERE ig.galleryId = g.galleryId
						ORDER BY i.createdAt DESC
						LIMIT 4
					)
				) AS coverImages,
				g.publicId,
				g.public,
				g.published,
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
				) AS accredited_users,
				CASE
					WHEN g.userId = ? 
						OR (
							SELECT MAX(gua2.accreditationId)
							FROM gallery_user_accreditations gua2
							WHERE gua2.galleryId = g.galleryId
							AND gua2.userId = ?
						) >= 3 
					THEN 1
					ELSE 0
				END AS edit
			FROM gallery g
			LEFT JOIN gallery_user_accreditations gua ON g.galleryId = gua.galleryId
			WHERE g.userId = ?
			OR gua.userId = ?
			GROUP BY g.galleryId;

        `,
			[userId, userId, userId, userId]
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
export async function getGallery(publicId: string, email: string): Promise<Gallery | null> {
	let connection;

	try {
		connection = await connectMySQL();
		await connection.execute('SET SESSION group_concat_max_len = 100000000;');

		const galleryQuery = `
            SELECT
                g.galleryId,
                COALESCE(
                    CASE
                        WHEN u.nameDisplay = 1 THEN u.name
                        WHEN u.username IS NOT NULL THEN u.username
                        ELSE u.name
                    END,
                    'Unknown'
                ) AS userName,
                g.name AS galleryName,
                g.description,
                g.createdAt,
                g.updatedAt,
                g.publicId,
                g.public,
                g.published,
                g.coverImages,
                g.coverFont,
                g.coverText
            FROM gallery g
            LEFT JOIN users u ON g.userId = u.userId
            WHERE
                g.publicId = ?
                AND (
                    EXISTS (
                        SELECT 1
                        FROM gallery_user_accreditations gua
                        WHERE gua.galleryId = g.galleryId
                        AND gua.userId = (SELECT userId FROM users WHERE email = ?)
                    )
                    OR g.userId = (SELECT userId FROM users WHERE email = ?)
					OR (g.public = 1 AND g.published = 1)
                );
        `;

		const [galleryResults]: [RowDataPacket[], FieldPacket[]] = await connection.execute(galleryQuery, [publicId, email, email]);

		if (!galleryResults.length) {
			return null;
		}

		const gallery = galleryResults[0] as Gallery;

		const imagesQuery = `
            SELECT
                i.imageId,
                i.userId,
                i.imageUrl
            FROM images i
            JOIN image_gallery ig ON i.imageId = ig.imageId
            WHERE ig.galleryId = (
                SELECT g.galleryId
                FROM gallery g
                WHERE g.publicId = ?
            )
            ORDER BY i.createdAt DESC;
        `;

		const [imageResults]: [RowDataPacket[], FieldPacket[]] = await connection.execute(imagesQuery, [publicId]);

		const tagsQuery = `
           SELECT
				CASE
					WHEN t.name = 'user' THEN
						CASE
							WHEN u.nameDisplay = 1 THEN u.name
							WHEN u.username IS NOT NULL THEN u.username
							ELSE u.name
						END
					ELSE t.name
				END AS name,
				t.tagId AS id,
				COALESCE(
					i.imageUrl,
					(
						SELECT i2.imageUrl
						FROM images i2
						JOIN image_tags it2 ON i2.imageId = it2.imageId
						WHERE it2.tagId = t.tagId
						ORDER BY i2.createdAt DESC
						LIMIT 1
					)
				) AS cover
			FROM tags t
			LEFT JOIN users u ON t.userId = u.userId
			LEFT JOIN images i ON t.coverId = i.imageId
			WHERE t.galleryId = (
				SELECT g.galleryId
				FROM gallery g
				WHERE g.publicId = ?
			);
			`;

		const [tags]: [RowDataPacket[], FieldPacket[]] = await connection.execute(tagsQuery, [publicId]);

		gallery.tags = tags as Tag[];

		const imageIds: number[] = imageResults.map((image: RowDataPacket) => image.imageId as number);
		if (imageIds.length != 0) {
			const imageTagsQuery = `
				SELECT
					it.imageId,
					it.tagId,
					CASE
						WHEN t.name = 'user' THEN
							CASE
								WHEN u.nameDisplay = 1 THEN u.name
								WHEN u.username IS NOT NULL THEN u.username
								ELSE u.name
							END
						ELSE t.name
					END AS name
				FROM image_tags it
				JOIN tags t ON it.tagId = t.tagId
				LEFT JOIN users u ON t.userId = u.userId
				WHERE it.imageId IN (${imageIds.join(', ')});
			`;

			const [imageTagsResults]: [RowDataPacket[], FieldPacket[]] = await connection.execute(imageTagsQuery);

			const imageTagsMap: { [key: number]: Tag[] } = {};
			for (const imageTag of imageTagsResults) {
				const tag: Tag = {
					id: imageTag.tagId,
					name: imageTag.name,
					cover: imageTag.cover,
				};
				if (!imageTagsMap[imageTag.imageId]) {
					imageTagsMap[imageTag.imageId] = [];
				}
				imageTagsMap[imageTag.imageId].push(tag);
			}

			for (const image of imageResults) {
				image.tags = imageTagsMap[image.imageId] || [];
			}
		}

		gallery.images = imageResults as Image[];

		const accreditedUsersQuery = `
            SELECT
                COALESCE(
                    CASE
                        WHEN u.nameDisplay = 1 OR u.username IS NULL THEN u.name
                        ELSE u.username
                    END,
                    'Unknown'
                ) AS name,
                u.image,
                u.email,
                gua.accreditationId
            FROM gallery_user_accreditations gua
            JOIN users u ON gua.userId = u.userId
            WHERE gua.galleryId = (
                SELECT g.galleryId
                FROM gallery g
                WHERE g.publicId = ?
            )
            UNION ALL
            SELECT
                COALESCE(
                    CASE
                        WHEN u.nameDisplay = 1 OR u.username IS NULL THEN u.name
                        ELSE u.username
                    END,
                    'Unknown'
                ) AS name,
                u.image,
                u.email,
                0 AS accreditationId
            FROM users u
            WHERE u.userId = (
                SELECT g.userId
                FROM gallery g
                WHERE g.publicId = ?
            );
        `;

		const [accreditedUserResults]: [RowDataPacket[], FieldPacket[]] = await connection.execute(accreditedUsersQuery, [publicId, publicId]);
		gallery.accredited_users = accreditedUserResults as AccredUser[];

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
		await connection.execute('INSERT INTO tags (name, userId, galleryId) VALUES (?, (SELECT userId FROM users WHERE email = ?), (SELECT galleryId FROM gallery WHERE publicId = ?))', ['user', email, id]);
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
				AND gua.accreditationId >= 4
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

export async function saveImage(imageUrl: string, email: string, galleryId: string, tags: string[], fileInfo: any): Promise<void> {
	let connection;

	try {
		connection = await connectMySQL();

		const [[{ totalSize }]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT SUM(fileSize) AS totalSize FROM images WHERE userId = (SELECT userId FROM users WHERE email = ?)', [email]);

		if (parseInt(totalSize as string, 10) > parseInt(process.env.TOTAL_IMAGE_SIZE || '100000', 10)) {
			throw new Error('Total image size exceeded');
		}

		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM images WHERE fileInfo = ? AND userId = (SELECT userId FROM users WHERE email = ?)', [JSON.stringify(fileInfo), email]);

		if (rows.length) {
			throw new Error('Image already exists');
		}

		await connection.execute('INSERT INTO images (imageUrl, userId, fileSize, fileInfo) VALUES (?, (SELECT userId FROM users WHERE email = ?), ?, ?)', [imageUrl, email, fileInfo.size, JSON.stringify(fileInfo)]);

		await connection.execute(
			`INSERT INTO image_tags (imageId, tagId) 
			VALUES (
				(SELECT imageId FROM images WHERE imageUrl = ?),
				(SELECT tagId FROM tags WHERE name = 'user' AND galleryId = ? AND userId = (SELECT userId FROM users WHERE email = ?))
			)`,
			[imageUrl, galleryId, email]
		);

		if (tags.length != 0) {
			for (const tag of tags) {
				await connection.execute(
					`INSERT INTO image_tags (imageId, tagId)
					VALUES (
						(SELECT imageId FROM images WHERE imageUrl = ?),
						(SELECT tagId FROM tags WHERE name = ? AND galleryId = ? AND userId = (SELECT userId FROM users WHERE email = ?))
					);
`,
					[imageUrl, tag, galleryId, email]
				);
			}
		}

		const [[{ imageId }]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT imageId FROM images WHERE imageUrl = ?', [imageUrl]);

		await connection.execute('INSERT INTO image_gallery (imageId, galleryId) VALUES (?, ?)', [imageId, galleryId]);
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
					WHEN u.nameDisplay = 1 OR u.username IS NULL THEN u.name
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
							WHEN u.nameDisplay = 1 OR u.username IS NULL THEN u.name
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
		} else if (user.accreditationId === accreditationId || user.accreditationId === 1) {
			return;
		} else {
			if (user.accreditationId === 2 && accreditationId >= 3) {
				let htmlContent = '';
				try {
					const filePath = path.join(process.cwd(), 'mail/welcome.html');
					htmlContent = fs.readFileSync(filePath, 'utf-8');
					htmlContent = htmlContent.replaceAll('XXXXXXLINKXXXXXX', process.env.NEXTAUTH_URL + '/' + galleryId);
				} catch (error) {
					console.error('Error reading HTML file:', error);
				}

				await sendEmail(user.email, 'Welcome to your new gallery <contact@kooked.ch>', 'Welcome to your new gallery', htmlContent);
			}
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

export async function getJoinInfo(token: string): Promise<any> {
	let connection;
	try {
		connection = await connectMySQL();

		const [[request]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM join_gallery_requests WHERE token = ?', [token]);

		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`SELECT 
				g.name as galleryName, 
				CASE 
					WHEN u.nameDisplay = 1 OR u.username IS NULL THEN u.name 
					ELSE u.username 
				END AS name,
				u.phoneNumber
			FROM gallery g 
			LEFT JOIN users u ON g.userId = u.userId 
			WHERE g.galleryId = ?`,
			[request.galleryId]
		);

		if (rows.length === 0) {
			throw new Error('Gallery not found');
		}
		return rows[0];
	} catch (error) {
		console.error('Error getting join info:', error);
		throw error;
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

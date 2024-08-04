import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export async function getInfoSession(session: any): Promise<any> {
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [session.user.email]);

	connection.end();

	return rows[0];
}

export async function getAccreditationId(email: string, galleryId: string): Promise<any> {
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT accreditationId FROM gallery_user_accreditations WHERE userId = (SELECT userId FROM users WHERE email = ?) AND galleryId = (SELECT galleryId FROM gallery WHERE publicId = ?)', [email, galleryId]);

	const [rows2]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM gallery WHERE userId = (SELECT userId FROM users WHERE email = ?) AND galleryId = (SELECT galleryId FROM gallery WHERE publicId = ?)', [email, galleryId]);

	connection.end();

	if (rows.length === 0 && rows2.length === 0) {
		return 0;
	}

	if (rows.length === 0 && rows2.length === 1) {
		return 5;
	}

	if (rows.length === 1) {
		return rows[0].accreditationId;
	}
}

export async function checkIfUserIsAuthorized(galleryId: string, email: string): Promise<any> {
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
		`
		SELECT * FROM gallery g
		WHERE g.galleryId = ?
		AND (EXISTS (
			SELECT * FROM gallery_user_accreditations gua
			WHERE gua.galleryId = g.galleryId
			AND gua.userId = (SELECT userId FROM users WHERE email = ?) AND gua.accreditationId >= 2
		) OR g.userId = (SELECT userId FROM users WHERE email = ?));
	`,
		[galleryId, email, email]
	);

	connection.end();

	if (!rows.length) {
		return false;
	} else {
		return true;
	}
}

export async function checkImageAccess(imageId: string, email: string): Promise<boolean> {
	let connection;

	try {
		connection = await connectMySQL();

		const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
			`
			SELECT *
				FROM images i
			LEFT JOIN image_gallery ig on i.imageId = ig.imageId
			LEFT JOIN gallery_user_accreditations gua
				ON gua.galleryId = ig.galleryId
				AND gua.userId = (SELECT userId FROM users WHERE email = ?)
			LEFT JOIN users u
				ON i.userId = u.userId
			WHERE i.imageUrl = ?
			AND (gua.userId IS NOT NULL OR i.userId = (SELECT userId FROM users WHERE email = ?));
            `,
			[email, imageId, email]
		);

		return rows.length > 0;
	} catch (error) {
		console.error('Error checking image access:', error);
		throw new Error('Error checking image access');
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

export async function checkAccredAccess(galleryId: string, email: string): Promise<boolean> {
	const connection = await connectMySQL();

	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
		`
		SELECT
			CASE
				WHEN g.userId = (SELECT userId FROM users WHERE email = ?) THEN true
				WHEN a.accreditationId IS NOT NULL AND a.accreditationId = 5 THEN true
				ELSE false
				END AS accessStatus
		FROM gallery g
				LEFT JOIN gallery_user_accreditations a
						ON g.galleryId = a.galleryId AND a.userId = (SELECT userId FROM users WHERE email = ?)
		WHERE g.galleryId = (SELECT galleryId FROM gallery WHERE publicId = ?);
	`,
		[email, email, galleryId]
	);

	connection.end();

	return rows.length > 0;
}

export async function getId(email: string): Promise<any> {
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

	connection.end();

	return rows[0].userId;
}

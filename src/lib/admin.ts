import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';
import { UsersData } from '@/types/user';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export async function checkIfUserIsAdmin(email: string | null | undefined): Promise<boolean> {
	if (!email) {
		return false;
	}
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM admin LEFT JOIN users u on admin.userId = u.userId WHERE email = ?', [email]);
	connection.end();

	return rows.length > 0;
}

export async function getAdminData(email: string): Promise<any> {
	const connection = await connectMySQL();

	if (!(await checkIfUserIsAdmin(email))) {
		return null;
	}

	let [users]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users');

	for (const user of users) {
		const [accredRows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM admin WHERE userId = ?', [user.userId]);
		if (accredRows.length > 0) {
			user.verified = 0;
		}
	}

	connection.end();

	return { users };
}

export async function CheckIfUserIsVerified(email: string): Promise<boolean> {
	const connection = await connectMySQL();
	const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
	connection.end();

	return rows[0].verified === 3;
}

export async function updateVerifiedId(userId: number, verifiedId: number): Promise<void> {
	const connection = await connectMySQL();
	await connection.execute('UPDATE users SET verified = ? WHERE userId = ?', [verifiedId, userId]);
	connection.end();
}

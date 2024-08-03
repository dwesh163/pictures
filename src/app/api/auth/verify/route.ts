import { v4 as uuidv4 } from 'uuid';
import { dbConfig } from '@/lib/db/config';
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server'; // Adjust according to your setup

async function connectMySQL(): Promise<mysql.Connection> {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { email, otpUser, otpId }: { email?: string; otpUser: string; otpId?: string } = await req.json();

	if (!email || !otpUser || !otpId) {
		return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
	}

	let connection;

	try {
		connection = await connectMySQL();
		await connection.beginTransaction();

		const [otpRows] = await connection.execute('SELECT * FROM otp WHERE otpId = ?', [otpId]);
		const otp = (otpRows as any[])[0];

		if (!otp) {
			await connection.rollback();
			return NextResponse.json({ message: 'Verification code not found' }, { status: 400 });
		}

		const [userRows] = await connection.execute('SELECT * FROM users WHERE userId = ?', [otp.userId]);
		const user = (userRows as any[])[0];

		if (!user) {
			await connection.rollback();
			return NextResponse.json({ message: 'User not found' }, { status: 400 });
		}

		if (parseInt(otp.otp, 10) !== parseInt(otpUser, 10) || user.email !== email) {
			await connection.rollback();
			return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
		}

		await connection.execute('UPDATE users SET verified = 2 WHERE userId = ?', [user.userId]);
		await connection.execute('DELETE FROM otp WHERE otpId = ?', [otpId]);

		await connection.commit();

		return NextResponse.json({ success: 'Verification successful' }, { status: 200 });
	} catch (error) {
		console.error('Error during verification process:', error);
		if (connection) await connection.rollback();
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (connection) await connection.end();
	}
}

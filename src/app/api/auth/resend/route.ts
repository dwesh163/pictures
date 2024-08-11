import { v4 as uuidv4 } from 'uuid';
import { dbConfig } from '@/lib/db/config';
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';
import fs from 'fs';
import path from 'path';

async function connectMySQL(): Promise<mysql.Connection> {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

const generateRandomOTP = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { email, otpId }: { email?: string; otpId?: string } = await req.json();

	if (!otpId || !email) {
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

		if (new Date(otp.sendAt).getTime() + 1000 * 60 * 4 > Date.now() && otp.sendCount !== 1) {
			await connection.rollback();
			return NextResponse.json({ message: 'Wait for resend' }, { status: 400 });
		}

		if (otp.sendCount >= 3) {
			await connection.rollback();
			return NextResponse.json({ message: 'Verification code expired' }, { status: 400 });
		}

		const [userRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
		const user = (userRows as any[])[0];

		if (!user) {
			await connection.rollback();
			return NextResponse.json({ message: 'User not found' }, { status: 400 });
		}

		if (otp.userId !== user.userId) {
			await connection.rollback();
			return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
		}

		const newOtp = generateRandomOTP();

		let htmlContent: string;
		try {
			const filePath = path.join(process.cwd(), 'mail/otp.html');
			htmlContent = fs.readFileSync(filePath, 'utf-8');
			htmlContent = htmlContent.replaceAll('XXXXXXOTPXXXXXX', newOtp);
		} catch (error) {
			console.error('Error reading HTML file:', error);
			await connection.rollback();
			return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
		}

		await sendEmail(email, `Your Verification Code: ${newOtp} <contact@kooked.ch>`, `Your verification code: ${newOtp}`, htmlContent);

		await connection.execute('UPDATE otp SET otp = ?, sendCount = ?, sendAt = NOW() WHERE otpId = ?', [newOtp, otp.sendCount + 1, otpId]);

		await connection.commit();

		return NextResponse.json({ success: 'resend OK' }, { status: 200 });
	} catch (error) {
		console.error('Error during verification process:', error);
		if (connection) await connection.rollback();
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (connection) await connection.end();
	}
}

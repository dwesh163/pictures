import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { dbConfig } from '@/lib/db/config';
import { sendEmail } from '@/lib/mail';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

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
	const { name, lastname, username, phoneNumber, email, password } = await req.json();

	if (!email || !password || !name) {
		return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
	}

	let connection: mysql.Connection | null = null;

	try {
		connection = await connectMySQL();
		await connection.beginTransaction();

		const [existingUserRows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
		const existingUser = (existingUserRows as any[])[0];

		if (existingUser) {
			await connection.rollback();
			return NextResponse.json({ message: 'User already exists' }, { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const id = uuidv4();
		const otp = generateRandomOTP();

		let htmlContent: string;
		try {
			const filePath = path.join(process.cwd(), 'mail/otp.html');
			htmlContent = fs.readFileSync(filePath, 'utf-8');
			htmlContent = htmlContent.replaceAll('XXXXXXOTPXXXXXX', otp);
		} catch (error) {
			console.error('Error reading HTML file:', error);
			await connection.rollback();
			return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
		}

		await sendEmail(email, `Your Verification Code: ${otp} <contact@kooked.ch>`, `Your verification code: ${otp}`, htmlContent);

		await connection.execute('INSERT INTO users (email, password, name, username, phoneNumber, verified, provider) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, hashedPassword, name + ' ' + lastname, username, phoneNumber, 1, 'credentials']);
		await connection.execute('INSERT INTO otp (userId, otp, otpId) VALUES ((SELECT userId FROM users WHERE email = ?), ?, ?)', [email, otp, id]);

		await connection.commit();

		return NextResponse.json({ message: 'User created', otpId: id }, { status: 201 });
	} catch (error) {
		console.error('Error during user sign-up:', error);
		if (connection) await connection.rollback();
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (connection) await connection.end();
	}
}

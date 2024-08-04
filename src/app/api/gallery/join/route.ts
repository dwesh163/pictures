import { checkAccredAccess } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { dbConfig } from '@/lib/db/config';
import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
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

function isValidPhoneNumber(phoneNumber: string) {
	return /^\+\d{11}$/.test(phoneNumber);
}

export async function POST(req: NextRequest) {
	let connection: mysql.Connection | undefined;

	const session = await getServerSession();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { phoneNumber, userCode, token } = requestBody as { phoneNumber: string; userCode: string; token: string };

		if (!userCode || !token) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		if (typeof userCode !== 'string' || typeof token !== 'string') {
			return NextResponse.json({ error: 'Invalid userCode' }, { status: 400 });
		}

		connection = await connectMySQL();

		await connection.beginTransaction();

		const [userRows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [session.user.email]);

		if (!userRows.length) {
			await connection.rollback();
			return NextResponse.json({ error: 'User not found' }, { status: 400 });
		}

		if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
			await connection.execute('UPDATE users SET phoneNumber = ? WHERE email = ?', [phoneNumber.replace('+', ''), session.user.email]);
		}

		const [[request]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM join_gallery_requests WHERE token = ?', [token]);

		if (!request) {
			await connection.rollback();
			return NextResponse.json({ error: 'Request not found' }, { status: 400 });
		}

		if (request.token != token || request.code != userCode || request.email != session.user.email) {
			await connection.rollback();
			await connection.execute('UPDATE join_gallery_requests SET codeTryCount = ? WHERE token = ?', [request.codeTryCount + 1, token]);
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		await connection.execute('INSERT INTO gallery_user_accreditations (galleryId, userId, accreditationId) VALUES (?, ?, ?)', [request.galleryId, userRows[0].userId, 2]);

		await connection.commit();

		return NextResponse.json({ success: 'ok' }, { status: 200 });
	} catch (error) {
		console.error('Error during verification process:', error);
		if (connection) await connection.rollback();
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (connection) await connection.end();
	}
}

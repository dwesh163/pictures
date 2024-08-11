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

function makeid(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

interface PageProps {
	params: {
		galleryId: string;
	};
}

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(phoneNumber: string) {
	return /^\+\d{11}$/.test(phoneNumber);
}

export async function POST(req: NextRequest, { params }: PageProps) {
	let connection: mysql.Connection | undefined;

	const session = await getServerSession();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await checkAccredAccess(params.galleryId, session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { email, phoneNumber } = requestBody as { email: string; phoneNumber: string };

		if (!email || !phoneNumber) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		if (!isValidEmail(email) || !isValidPhoneNumber(phoneNumber)) {
			return NextResponse.json({ error: 'Invalid email or phone number' }, { status: 400 });
		}

		if (typeof email !== 'string' || typeof phoneNumber !== 'string') {
			return NextResponse.json({ error: 'Invalid userId or accreditationId' }, { status: 400 });
		}

		connection = await connectMySQL();

		const [shareCountRows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT COUNT(*) as count FROM join_gallery_requests WHERE galleryId = (SELECT galleryId FROM gallery WHERE public = ?) AND email = ?', [params.galleryId, email]);

		if ((shareCountRows as any[])[0].count > 0) {
			return NextResponse.json({ message: 'Already shared' }, { status: 400 });
		}

		const [access]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM gallery_user_accreditations WHERE galleryId = (SELECT galleryId FROM gallery WHERE public = ?) AND userId = (SELECT userId FROM users WHERE email = ?)', [params.galleryId, email]);

		if (access.length != 0) {
			return NextResponse.json({ message: 'Already shared' }, { status: 400 });
		}

		const [[gallery]]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM gallery WHERE publicId = ?', [params.galleryId]);

		await connection.beginTransaction();

		let uniqueToken: string = '';
		let isUnique = false;

		const code = makeid(6);

		while (!isUnique) {
			uniqueToken = makeid(128);
			const [existingTokenRows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT COUNT(*) as count FROM join_gallery_requests WHERE token = ?', [uniqueToken]);
			isUnique = (existingTokenRows as any[])[0].count === 0;
		}

		await connection.execute('INSERT INTO join_gallery_requests (galleryId, email, userId, phoneNumber, code, token) VALUES ((SELECT galleryId FROM gallery WHERE publicId = ?), ?, (SELECT userId FROM users WHERE email = ?), ?, ?, ?)', [params.galleryId, email, session.user.email, phoneNumber.replace('+', ''), code, uniqueToken]);

		let htmlContent: string;
		try {
			const filePath = path.join(process.cwd(), 'mail/join.html');
			htmlContent = fs.readFileSync(filePath, 'utf-8');
			const joinLink = `${process.env.NEXTAUTH_URL}/join?token=${uniqueToken}`;
			htmlContent = htmlContent.replaceAll('XXXXXXLINKXXXXXX', joinLink);
		} catch (error) {
			console.error('Error reading HTML file:', error);
			await connection.rollback();
			return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
		}

		await sendEmail(email, `Join ${gallery.name} <contact@kooked.ch>`, `Join ${gallery.name}`, htmlContent);

		await connection.commit();

		return NextResponse.json({ success: 'ok', code }, { status: 200 });
	} catch (error) {
		console.error('Error during verification process:', error);
		if (connection) await connection.rollback();
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	} finally {
		if (connection) await connection.end();
	}
}

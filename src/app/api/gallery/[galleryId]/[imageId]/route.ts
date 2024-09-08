import { checkAccredAccess } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { dbConfig } from '@/lib/db/config';
import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';

async function connectMySQL(): Promise<mysql.Connection> {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

interface PageProps {
	params: {
		galleryId: string;
		imageId: number;
	};
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
		connection = await connectMySQL();

		await connection.beginTransaction();

		await connection.query('DELETE FROM image_tags WHERE imageId = ?', [params.imageId]);
		await connection.query('DELETE FROM image_gallery WHERE imageId = ?', [params.imageId]);
		await connection.query('DELETE FROM images WHERE imageId = ?', [params.imageId]);

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

import { checkAccredAccess } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { dbConfig } from '@/lib/db/config';
import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { Tag } from '@/types/gallery';

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
	};
}

export async function POST(req: NextRequest, { params }: PageProps) {
	let connection: mysql.Connection | undefined;
	let newTags: Tag[] = [];

	const session = await getServerSession();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await checkAccredAccess(params.galleryId, session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { imageId, tags } = requestBody as { imageId: number; tags: Tag[] };

		if (!imageId || !tags) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		connection = await connectMySQL();

		await connection.beginTransaction();

		newTags = tags.filter((tag) => tag.id);

		if (newTags.length > 0) {
			const deleteQuery = `DELETE FROM image_tags WHERE imageId = ? AND tagId NOT IN (${newTags.map(() => '?').join(',')})`;
			const deleteParams = [imageId, ...newTags.map((tag) => tag.id)];

			await connection.query(deleteQuery, deleteParams);

			const currentTags = await connection.query('SELECT tagId FROM image_tags WHERE imageId = ?', [imageId]);

			for (const tag of newTags) {
				const tagExists = (currentTags[0] as RowDataPacket[]).find((currentTag: RowDataPacket) => currentTag.tagId === tag.id);
				if (!tagExists) {
					await connection.query('INSERT IGNORE INTO image_tags (imageId, tagId) VALUES (?, ?)', [imageId, tag.id]);
				}
			}
		} else {
			await connection.query('DELETE FROM image_tags WHERE imageId = ?', [imageId]);
		}

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

import { checkImageAccess } from '@/lib/next-auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
	const session = await getServerSession();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const url = new URL(req.url);
	const imageUrl = url.searchParams.get('imageUrl');

	if (!imageUrl) {
		return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
	}

	if (!(await checkImageAccess(imageUrl, session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const imagePath = path.join(process.cwd(), '/uploads', imageUrl);

		const imageBuffer = await readFile(imagePath);

		return new NextResponse(imageBuffer, {
			headers: {
				'Content-Type': 'image/jpeg',
				'Content-Length': imageBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error('Failed to retrieve image:', error);
		return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
	}
}

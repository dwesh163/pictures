import { checkImageAccess } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
	const session = await getServerSession();

	const url = new URL(req.url);
	const imageUrl = url.searchParams.get('imageUrl');
	let email = '';

	if (!imageUrl) {
		return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
	}

	if (session != null) {
		email = session?.user?.email as string;
	}

	if (!(await checkImageAccess(imageUrl, email))) {
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

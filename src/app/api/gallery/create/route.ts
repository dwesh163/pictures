// /app/api/gallery/route.ts (ou le chemin approprié)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createGallery } from '@/lib/galleries';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: NextRequest, res: NextResponse) {
	const session = await getServerSession({ req, res, ...authOptions });

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userEmail = session?.user?.email ?? '';

		const { name, description } = await req.json();

		console.log('Creating gallery', { name, description });

		if (!name || !description || typeof name !== 'string' || typeof description !== 'string' || !name.trim() || !description.trim()) {
			return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
		}

		if (name.length > 255) {
			return NextResponse.json({ error: 'Title must not be longer than 255 characters' }, { status: 400 });
		}

		if (description.length > 500) {
			return NextResponse.json({ error: 'Description must not be longer than 500 characters' }, { status: 400 });
		}

		const newGalleryId = await createGallery(name, description, userEmail);

		console.log('newGallery', newGalleryId);

		if (!newGalleryId) {
			return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
		}

		const url = new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000');
		url.pathname = `/gallery/${newGalleryId}/edit`;

		return NextResponse.json({ redirect: url.toString() });
	} catch (error) {
		console.error('Error creating gallery:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

'use server';
import { getServerSession, Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getGallery } from '@/lib/galleries';

async function fetchGallery(session: Session, galleryId: string) {
	try {
		const gallery = await getGallery(galleryId, session.user.email ?? '');
		return gallery;
	} catch (error) {
		console.error('Failed to fetch gallery:', error);
		throw error;
	}
}

interface PageProps {
	params: {
		galleryId: string;
	};
}

export async function GET(req: NextRequest, { params }: PageProps) {
	const session = await getServerSession();
	const galleryId = params.galleryId;

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!galleryId) {
		return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
	}

	try {
		const gallery = await fetchGallery(session, galleryId);
		return NextResponse.json(gallery);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
	}
}

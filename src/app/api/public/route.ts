import { NextRequest, NextResponse } from 'next/server';
import { getPublicGalleries } from '@/lib/galleries';

export async function GET(request: NextRequest) {
	try {
		const publicGallery = await getPublicGalleries();
		return NextResponse.json(publicGallery);
	} catch (error) {
		console.error('Failed to retrieve notifications:', error);
		return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
	}
}

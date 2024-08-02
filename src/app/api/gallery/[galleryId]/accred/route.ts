import { getAccreditedUsers, updateAccreditation } from '@/lib/galleries';
import { checkAccredAccess } from '@/lib/users';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface PageProps {
	params: {
		galleryId: string;
	};
}

export async function GET(req: NextRequest, { params }: PageProps) {
	const session = await getServerSession();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await checkAccredAccess(params.galleryId, session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const users = await getAccreditedUsers(params.galleryId);
		return NextResponse.json(users);
	} catch (error) {
		console.error('Failed to retrieve accred:', error);
		return NextResponse.json({ error: 'Failed to retrieve accred' }, { status: 500 });
	}
}

export async function POST(req: NextRequest, { params }: { params: { galleryId: string } }) {
	const session = await getServerSession();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!(await checkAccredAccess(params.galleryId, session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { userId, accreditationId } = requestBody as { userId: number; accreditationId: number };

		if (typeof userId !== 'number' || typeof accreditationId !== 'number') {
			return NextResponse.json({ error: 'Invalid userId or accreditationId' }, { status: 400 });
		}

		await updateAccreditation(params.galleryId, userId, accreditationId);
		return NextResponse.json({ success: 'Accreditation updated' });
	} catch (error) {
		console.error('Failed to update accreditation:', error);
		return NextResponse.json({ error: 'Failed to update accreditation' }, { status: 500 });
	}
}

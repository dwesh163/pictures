import { checkIfUserIsAdmin, getAdminData, updateVerifiedId } from '@/lib/admin';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	const session = await getServerSession();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const adminData = await getAdminData(session.user.email as string);
		if (adminData === null) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json(adminData);
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

	if (!(await checkIfUserIsAdmin(session.user.email as string))) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { userId, verifiedId } = requestBody as { userId: number; verifiedId: number };

		console.log('userId:', userId, 'verifiedId:', verifiedId);

		if (typeof userId !== 'number' || typeof verifiedId !== 'number') {
			return NextResponse.json({ error: 'Invalid userId or verifiedId' }, { status: 400 });
		}

		await updateVerifiedId(userId, verifiedId);
		return NextResponse.json({ success: 'verified status updated' });
	} catch (error) {
		console.error('Failed to update verified status:', error);
		return NextResponse.json({ error: 'Failed to update verified status' }, { status: 500 });
	}
}

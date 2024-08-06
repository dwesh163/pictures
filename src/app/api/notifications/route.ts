import { getNotifications, updateNotification } from '@/lib/users';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const isRead = url.searchParams.get('isRead') === 'true';

	const session = await getServerSession();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const notifications = await getNotifications(session.user.email as string, isRead);
		return NextResponse.json(notifications);
	} catch (error) {
		console.error('Failed to retrieve notifications:', error);
		return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const session = await getServerSession();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const requestBody = await req.json();
		const { notificationId } = requestBody as { notificationId: number };

		if (typeof notificationId !== 'number' || notificationId < 1) {
			return NextResponse.json({ error: 'Invalid notificationId' }, { status: 400 });
		}

		await updateNotification(notificationId, session.user.email as string);
		return NextResponse.json({ success: 'Notification updated' });
	} catch (error) {
		console.error('Failed to update notification:', error);
		return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
	}
}

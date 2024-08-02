'use server';
import { getServerSession, Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/next-auth';
import { UserData } from '@/types/user';
import { getGallery } from '@/lib/galleries';
import { NextPageContext } from 'next';
import EditPage from './edit';

interface EditPageProps {
	params: {
		galleryId: string;
	};
}

async function fetchGallery(session: Session, galleryId: string) {
	try {
		const gallery = await getGallery(galleryId, session.user.email ?? '');
		return gallery;
	} catch (error) {
		console.error('Failed to fetch gallery:', error);
		throw error;
	}
}

async function fetchUserData(session: any): Promise<UserData> {
	const infoSession = await getInfoSession(session);

	return {
		name: infoSession.nameDisplay ? infoSession.name : infoSession.username,
		email: infoSession.email,
		bio: infoSession.bio,
	};
}

export default async function GalleryEditPage({ params }: EditPageProps) {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
		return;
	}

	if (!params.galleryId) {
		redirect('/me');
		return;
	}

	const gallery = await fetchGallery(session, params.galleryId);
	const userData = await fetchUserData(session);

	if (!gallery) {
		redirect('/me');
		return;
	}

	return (
		<div>
			<EditPage galleryData={gallery} userData={userData} />
		</div>
	);
}

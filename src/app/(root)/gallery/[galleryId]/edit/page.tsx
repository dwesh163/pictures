'use server';
import { getServerSession, Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession, getAccreditationId } from '@/lib/users';
import { UserData } from '@/types/user';
import { getGallery } from '@/lib/galleries';
import { NextPageContext } from 'next';
import { EditPage } from './edit';
import { CheckIfUserIsVerified } from '@/lib/admin';

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

async function fetchUserData(session: any, galleryId: string): Promise<UserData> {
	const infoSession = await getInfoSession(session);

	return {
		name: infoSession.nameDisplay ? infoSession.name : infoSession.username,
		email: infoSession.email,
		bio: infoSession.bio,
		accreditationId: await getAccreditationId(infoSession.email, galleryId),
	};
}

export default async function GalleryEditPage({ params }: EditPageProps) {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	if (!params.galleryId) {
		redirect('/me');
	}

	if (!(await CheckIfUserIsVerified(session.user.email as string))) {
		redirect('/verified');
	}

	const gallery = await fetchGallery(session, params.galleryId);
	const userData = await fetchUserData(session, params.galleryId);

	if (userData.accreditationId != 5) {
		redirect('/me');
	}

	if (!gallery) {
		redirect('/me');
	}

	return (
		<div>
			<EditPage galleryData={gallery} userData={userData} />
		</div>
	);
}

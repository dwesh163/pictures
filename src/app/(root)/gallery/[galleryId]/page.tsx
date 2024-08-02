'use server';
import { getServerSession, Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/users';
import { UserData } from '@/types/user';
import { canEditGallery, getGallery } from '@/lib/galleries';
import { NextPageContext } from 'next';
import { ViewPage } from './viewpage';
import { CheckIfUserIsVerified } from '@/lib/admin';

interface ViewPageProps {
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

export default async function GalleryEditPage({ params }: ViewPageProps) {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	if (!(await CheckIfUserIsVerified(session.user.email))) {
		redirect('/verified');
	}

	if (!params.galleryId) {
		redirect('/me');
	}

	const gallery = await fetchGallery(session, params.galleryId);

	if (!gallery) {
		redirect('/me');
	}

	const canEdit = await canEditGallery(params.galleryId, session.user.email as string);

	return (
		<div>
			<ViewPage gallery={gallery} canEdit={canEdit} />
		</div>
	);
}

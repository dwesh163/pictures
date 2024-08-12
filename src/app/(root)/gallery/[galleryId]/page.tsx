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

async function fetchGallery(email: string, galleryId: string) {
	try {
		const gallery = await getGallery(galleryId, email);
		return gallery;
	} catch (error) {
		console.error('Failed to fetch gallery:', error);
		throw error;
	}
}

export default async function GalleryEditPage({ params }: ViewPageProps) {
	const session = await getServerSession();

	if (!params.galleryId) {
		redirect('/me');
	}

	let email = '';
	if (session != null) {
		email = session?.user?.email as string;
	}

	const gallery = await fetchGallery(email, params.galleryId);

	if (!gallery) {
		redirect('/me');
	}

	const canEdit = await canEditGallery(params.galleryId, email);

	return (
		<div>
			<ViewPage gallery={gallery} canEdit={canEdit} />
		</div>
	);
}

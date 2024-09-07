import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/users';
import { UserData } from '@/types/user';
import { getGalleries } from '@/lib/galleries';
import { GalleriesList } from '@/components/galleries-list';
import { CheckIfUserIsVerified } from '@/lib/admin';

interface Gallery {
	accredited_users: string;
	images: string;
	galleryName: string;
	description: string;
	updatedAt: string;
	publicId: string;
}

async function fetchUserData(session: any): Promise<UserData> {
	const infoSession = await getInfoSession(session);

	return {
		name: infoSession.nameDisplay ? infoSession.name : infoSession.username,
		email: infoSession.email,
		bio: infoSession.bio,
	};
}

async function fetchGalleries(session: any) {
	const galleries = await getGalleries(session.user.email);
	return galleries;
}

export default async function SettingsProfilePage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	if (!(await CheckIfUserIsVerified(session.user.email as string))) {
		redirect('/verified');
	}

	const userData = await fetchUserData(session);
	let galleries = await fetchGalleries(session);

	if (galleries == null) {
		galleries = [];
	}

	console.log(galleries);

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<GalleriesList userData={userData} galleries={galleries} />
		</div>
	);
}

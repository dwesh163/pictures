import { getServerSession } from 'next-auth';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './profile-form';
import { UserProfileData } from '@/types/settings';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/next-auth';

async function fetchUserData(session: any): Promise<UserProfileData> {
	const infoSession = await getInfoSession(session);

	return {
		username: infoSession.username,
		email: infoSession.email,
		bio: infoSession.bio,
	};
}

export default async function SettingsProfilePage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	const userData = await fetchUserData(session);

	console.log(userData);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Profile</h3>
				<p className="text-sm text-muted-foreground">This is how others will see you on the site.</p>
			</div>
			<Separator />
			<ProfileForm userData={userData} />
		</div>
	);
}
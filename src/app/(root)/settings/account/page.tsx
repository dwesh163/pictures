import { getServerSession } from 'next-auth';
import { Separator } from '@/components/ui/separator';
import { AccountForm } from './account-form';
import { UserAccountData } from '@/types/settings';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/next-auth';

async function fetchUserData(session: any): Promise<UserAccountData> {
	const info = await getInfoSession(session);

	console.log({
		name: info.name,
		birthday: info.birthday,
		nameDisplay: info.nameDisplay,
	});

	return {
		name: info.name,
		birthday: info.birthday,
		nameDisplay: info.nameDisplay,
	};
}

export default async function SettingsAccountPage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	const userData = await fetchUserData(session);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="md:text-lg text-base font-medium">Account</h3>
				<p className="md:text-sm text-xs text-muted-foreground">Update your account settings. Set your preferred language and timezone.</p>
			</div>
			<Separator />
			<AccountForm userData={userData} />
		</div>
	);
}
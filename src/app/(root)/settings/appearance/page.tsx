import { Separator } from '@/components/ui/separator';
import { AppearanceForm } from './appearance-form';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { CheckIfUserIsVerified } from '@/lib/admin';

export default async function SettingsAppearancePage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	if (!(await CheckIfUserIsVerified(session.user.email))) {
		redirect('/verified');
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="md:text-lg text-base font-medium">Appearance</h3>
				<p className="md:text-sm text-xs text-muted-foreground">Customize the appearance of the app. Automatically switch between day and night themes.</p>
			</div>
			<Separator />
			<AppearanceForm />
		</div>
	);
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from './admin-panel';
import { getAdminData } from '@/lib/admin';
import NotFound from '@/app/not-found';

export default async function SettingsProfilePage() {
	const session = await getServerSession();

	if (!session) {
		return redirect('/auth/signin');
	}

	const adminData = await getAdminData(session.user.email);

	if (adminData === null) {
		return <NotFound />;
	}

	return (
		<div>
			<AdminPanel adminData={adminData} />
		</div>
	);
}

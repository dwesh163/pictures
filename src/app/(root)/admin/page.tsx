import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminPanel } from './admin-panel';
import { getAdminData } from '@/lib/admin';
import NotFound from '@/app/not-found';

export default async function SettingsProfilePage() {
	const session = await getServerSession();

	if (!session) {
		return (
			<div className="absolute top-0 left-0 z-[200] bg-background h-screen w-screen  ">
				<NotFound />
			</div>
		);
	}

	const adminData = await getAdminData(session.user.email as string);

	if (adminData === null) {
		return (
			<div className="absolute top-0 left-0 z-[200] bg-background h-screen w-screen  ">
				<NotFound />
			</div>
		);
	}

	return (
		<div>
			<AdminPanel adminData={adminData} />
		</div>
	);
}

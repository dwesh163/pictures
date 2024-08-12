import { getPublicGalleries } from '@/lib/galleries';
import { MainList } from '@/components/main';

export default async function SettingsProfilePage() {
	const publicGalleries = await getPublicGalleries();

	console.log(publicGalleries);

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<MainList galleries={publicGalleries} />
		</div>
	);
}

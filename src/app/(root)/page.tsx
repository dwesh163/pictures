import { getPublicGalleries } from '@/lib/galleries';
import { MainGalleriesList } from '@/components/main-galleries-list';
import { PublicGallery } from '@/types/gallery';

async function fetchPublicGalleries(): Promise<PublicGallery[]> {
	try {
		const publicGalleries = await getPublicGalleries();
		console.log(publicGalleries);

		return publicGalleries || [];
	} catch (error) {
		console.error('Failed to fetch public galleries:', error);
		return [];
	}
}

export default async function MainPage() {
	const publicGalleries = await fetchPublicGalleries();

	console.log(publicGalleries);

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<MainGalleriesList galleries={publicGalleries} />
		</div>
	);
}

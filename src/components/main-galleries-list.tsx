'use client';
import Link from 'next/link';
import { PublicGallery } from '@/types/gallery';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { CameraOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MainGalleriesList({ galleries }: { galleries: PublicGallery[] }) {
	const router = useRouter();
	return (
		<section>
			<div className="space-y-0.5 mb-4">
				<h2 className="md:text-2xl text-xl font-bold tracking-tight">Welcome to galleries</h2>
				<p className="text-muted-foreground md:text-base text-xs">See all public galleries from here</p>
			</div>

			{galleries.length !== 0 ? (
				<div className="-ml-2 w-[calc(100%+1rem)]">
					<ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 3, 900: 5 }}>
						<Masonry>
							{galleries.map((gallery: PublicGallery, index: number) => {
								const coverImages = gallery.coverImages || [];
								const fontFamily = gallery.coverFont || 'Inter';

								return (
									<div
										key={'cover-' + index}
										className="relative m-2 cursor-pointer"
										onClick={() => {
											router.push(`/gallery/${gallery.publicId}`);
										}}>
										<div className="absolute bottom-0 w-full h-full bg-black opacity-30"></div>
										<div className="absolute bottom-0 w-full h-full flex justify-content items-center transform text-center text-white p-1">
											<h3 className="text-xl lg:text-xl text-center w-full font-black" style={{ fontFamily }}>
												{gallery.coverText}
											</h3>
										</div>
										{coverImages.length !== 0 ? (
											<div className="grid grid-cols-2 gap-0 overflow-hidden">
												{coverImages.map((imageUrl: string, imgIndex: number) => (
													<img src={`/api/image?imageUrl=${imageUrl}`} alt={`Image ${imgIndex + 1}`} key={imgIndex} className={`object-cover ${coverImages.length === 1 ? 'col-span-2' : 'w-full h-full'}`} />
												))}
											</div>
										) : (
											<div className="h-full flex items-center justify-center dark:bg-zinc-900 bg-zinc-200">
												<CameraOff className="w-6 h-6 text-gray-500" />
											</div>
										)}
									</div>
								);
							})}
						</Masonry>
					</ResponsiveMasonry>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center w-full h-[75vh]">
					<p className="text-muted-foreground">No galleries found.</p>
				</div>
			)}
		</section>
	);
}

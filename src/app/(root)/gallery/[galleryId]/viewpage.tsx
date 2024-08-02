'use client';
import { Button } from '@/components/ui/button';
import { Gallery } from '@/types/gallery';
import { Pencil } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import Link from 'next/link';

export function ViewPage({ gallery, canEdit }: { gallery: Gallery; canEdit: boolean }) {
	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5 w-full">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">{gallery.galleryName}</h2>
					<p className="text-muted-foreground md:text-base text-xs w-1/2">{gallery.description}</p>
				</div>
				{canEdit && (
					<Button asChild>
						<Link href={`/gallery/${gallery.publicId}/edit`} className="flex items-center gap-1">
							<Pencil className="mr-1 h-4 w-4" /> Edit <span className="hidden sm:flex">gallery</span>
						</Link>
					</Button>
				)}
			</div>

			<div className="-ml-2 w-[calc(100%+1rem)]">
				<ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 4, 900: 5 }}>
					<Masonry>
						{gallery?.images?.map((image, key) => (
							<div key={'image' + key} className="m-2">
								<img src={'/api/image/?imageUrl=' + image.imageUrl} alt={'image'} />
							</div>
						))}
					</Masonry>
				</ResponsiveMasonry>
			</div>
			<div className="flex items-center justify-center flex-col mt-12">
				<span className="text-muted-foreground text-xs">Created by {gallery.userName}</span>
				<span className="text-muted-foreground text-xs">All rights reserved</span>
			</div>
		</div>
	);
}

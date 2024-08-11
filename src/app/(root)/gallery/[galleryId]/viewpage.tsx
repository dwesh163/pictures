'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gallery, Tag, Image } from '@/types/gallery';
import { Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import Link from 'next/link';

export function ViewPage({ gallery, canEdit }: { gallery: Gallery; canEdit: boolean }) {
	const [tags, setTags] = useState<Tag[]>(gallery.tags ?? []);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [showAllImages, setShowAllImages] = useState<boolean>(false);

	const handleTagSelection = (tag: Tag) => {
		setShowAllImages(true);
		if (selectedTags.some((t) => t.name === tag.name)) {
			setSelectedTags(selectedTags.filter((t) => t.name !== tag.name));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const handleSelectAllTags = () => {
		setSelectedTags(tags);
		setShowAllImages(true);
	};

	const handleDeselectAllTags = () => {
		setSelectedTags([]);
	};

	useEffect(() => {
		if (selectedTags.length == 0) {
			setShowAllImages(false);
		}
	}, [selectedTags]);

	const filteredImages = gallery.images?.filter((image) => {
		if (selectedTags.length === 0) {
			return true;
		}

		const selectedTagNames = new Set(selectedTags.map((tag) => tag.name));

		return image.tags.some((imgTag: { name: string }) => selectedTagNames.has(imgTag.name));
	});

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

			<div className="flex items-center gap-4">
				{/* <div className="flex items-center gap-2">
					<Checkbox
						checked={!showAllImages && selectedTags.length === 0}
						onCheckedChange={(checked) => {
							if (checked) {
								handleDeselectAllTags();
								setShowAllImages(false);
							}
						}}
					/>
					<span>Tag</span>
				</div> */}
				<div className="flex items-center gap-2">
					<Checkbox
						checked={tags.length === selectedTags.length}
						onCheckedChange={(checked) => {
							if (checked) {
								handleSelectAllTags();
							} else {
								handleDeselectAllTags();
							}
						}}
					/>
					<span>All</span>
				</div>
				{tags.map((tag, index) => (
					<div className="flex items-center gap-2" key={index}>
						<Checkbox checked={selectedTags.some((t) => t.name === tag.name)} onCheckedChange={(checked) => handleTagSelection(tag)} />
						<span>{tag.name}</span>
					</div>
				))}
			</div>

			<div className="-ml-2 w-[calc(100%+1rem)]">
				<ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 3, 900: 5 }}>
					<Masonry>
						{showAllImages
							? filteredImages?.map((image, key) => (
									<div key={'image-' + key} className="relative m-2">
										<img src={`/api/image/?imageUrl=${image.imageUrl}`} alt="Image" className="w-full h-auto" />
									</div>
							  ))
							: tags.map(
									(tag, index) =>
										tag.cover && (
											<div
												key={'cover-' + index}
												className="relative m-2 cursor-pointer"
												onClick={() => {
													setSelectedTags([tag]);
													setShowAllImages(true);
												}}>
												<img src={`/api/image/?imageUrl=${tag.cover}`} alt={tag.name} className="w-full h-auto cursor-pointer bg-black opacity-30" />
												<div className="absolute bottom-0 w-full h-full flex justify-content items-center transform text-center text-white p-1">
													<h3 className="text-xl lg:text-xl text-center w-full font-black">{tag.name}</h3>
												</div>
											</div>
										)
							  )}
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

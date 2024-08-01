'use client';
import { Button } from '@/components/ui/button';
import { Gallery } from '@/types/gallery';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Dot, Plus } from 'lucide-react';
import UploadForm from '@/components/upload-form';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

export default function EditPage({ galleryData }: { galleryData: Gallery }) {
	const [filesSaved, setFilesSaved] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [gallery, setGallery] = useState<Gallery>(galleryData);

	const handleFilesChange = (files: File[]) => {
		setFilesSaved((prevFiles) => [...prevFiles, ...files]);
		setPreviewUrls((prevUrls) => [...prevUrls, ...files.map((file) => URL.createObjectURL(file))]);
	};

	const getTotalFileSize = (files: File[]): string => {
		const totalSizeInBytes = files.reduce((acc, file) => acc + file.size, 0);
		const totalSizeInMB = totalSizeInBytes / (1024 * 1024);
		return totalSizeInMB.toFixed(2) + ' MB';
	};

	const onGalleryUpdate = async () => {
		const response = await fetch('/api/gallery/' + gallery.galleryId);
		const data = await response.json();
		if (!response.ok) {
			console.error('Failed to fetch gallery:', data);
		}
		setGallery(data);
	};

	const handleUpload = async () => {
		if (!filesSaved.length) {
			alert('No files to upload');
			return;
		}

		try {
			const formData = new FormData();
			filesSaved.forEach((file) => formData.append('media', file));
			formData.append('galleryId', gallery.galleryId.toString());

			const res = await fetch('/api/gallery/upload', {
				method: 'POST',
				body: formData,
			});

			const { success, error }: { success: string | null; error: string | null } = await res.json();

			if (error) {
				alert(error || 'Sorry! something went wrong.');
				return;
			}

			setFilesSaved([]);
			setPreviewUrls([]);
			setIsDialogOpen(false);
			onGalleryUpdate();
		} catch (error) {
			console.error(error);
			alert('Sorry! something went wrong.');
		}
	};

	const clearFiles = () => {
		setFilesSaved([]);
		setPreviewUrls([]);
	};

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">{gallery.galleryName}</h2>
					<p className="text-muted-foreground md:text-base text-xs">{gallery.description}</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setIsDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" /> Import pictures
						</Button>
					</DialogTrigger>
					<DialogContent className="w-[95%] sm:w-1/2 ">
						<DialogHeader>
							<DialogTitle>Import pictures</DialogTitle>
							<DialogDescription className="flex sm:justify-between justify-center">
								<span className="hidden sm:flex">Select or drag and drop</span>
								<span className="flex ">
									{getTotalFileSize(filesSaved)}
									<Dot className="-mx-1" />
									{filesSaved.length} Picture{filesSaved.length > 1 && 's'}
								</span>
							</DialogDescription>
							<UploadForm clearFiles={clearFiles} onFilesChange={handleFilesChange} previewUrls={previewUrls} setPreviewUrls={setPreviewUrls} />
						</DialogHeader>
						<DialogFooter className="mt-3">
							<Button onClick={handleUpload} className="w-full" disabled={filesSaved.length === 0} type="submit">
								Import pictures
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div>
				<ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 4, 900: 5 }}>
					<Masonry>
						{gallery?.images?.map((image, key) => (
							<div key={'image' + key} className="p-2">
								<img src={'/api/image/?imageUrl=' + image.imageUrl} alt={'image'} />
							</div>
						))}
					</Masonry>
				</ResponsiveMasonry>
			</div>
		</div>
	);
}

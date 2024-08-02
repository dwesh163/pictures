'use client';
import { useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UploadForm from '@/components/upload-form';
import { Dot, Plus, UserRound, Ellipsis } from 'lucide-react';
import { Gallery } from '@/types/gallery';
import { cn } from '@/lib/utils';
import { UserData } from '@/types/user';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ShareGallery } from '@/components/share-gallery';
import { UserAccred } from '@/components/user-accred';

export default function EditPage({ galleryData, userData }: { galleryData: Gallery; userData: UserData }) {
	const [filesSaved, setFilesSaved] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [gallery, setGallery] = useState<Gallery>(galleryData);

	const [errors, setErrors] = useState<string[]>([]);
	const [name, setName] = useState<string>(galleryData.galleryName ?? '');
	const [description, setDescription] = useState<string>(galleryData.description ?? '');

	async function updateGallery(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const newErrors: string[] = [];

		if (name.length < 2) {
			newErrors.push('Name must be at least 2 characters');
		}

		if (description.length > 500) {
			newErrors.push('Description must not be longer than 500 characters.');
		}

		if (newErrors.length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			console.log('Creating gallery', { name, description });

			const response = await fetch('/api/gallery/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, description }),
			});
		} catch (error) {
			console.error('Error:', error);
			setErrors(['Error creating gallery']);
		}
	}

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
		const response = await fetch('/api/gallery/' + gallery.publicId);
		const data = await response.json();
		console.log('Gallery data:', data);
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
			setIsImportDialogOpen(false);
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

	const users = gallery.accredited_users?.filter((user) => user.email !== userData.email) ?? [];

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">{gallery.galleryName}</h2>
					<p className="text-muted-foreground md:text-base text-xs">{gallery.description}</p>
				</div>
				<div className="flex items-center justify-end">
					<Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => setIsImportDialogOpen(true)} className="mr-3">
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
					<Dialog>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" /> Share gallery
							</Button>
						</DialogTrigger>
						<DialogContent className="w-[95%] sm:w-1/2 ">
							<DialogHeader>
								<DialogTitle>Share this gallery</DialogTitle>
								<DialogDescription>Anyone with the join the gallery as a viewer.</DialogDescription>
							</DialogHeader>
							<ShareGallery />
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<div className="flex justify-between w-full">
				<div className="w-full sm:w-1/3">
					<form onSubmit={updateGallery}>
						<div className="grid gap-4 py-4 mb-2">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Title
								</Label>
								<Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="description" className="text-right">
									Description
								</Label>
								<Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
							</div>
						</div>
						{errors.length > 0 && (
							<div className="error-messages">
								{errors.map((error, index) => (
									<p key={index} className="col-span-4 text-red-500 text-sm flex">
										<Dot className="m-[-0.05rem]" />
										{error}
									</p>
								))}
							</div>
						)}
					</form>
					<div className={cn('flex items-center', users.length !== 0 && 'px-6 -ml-2')}>
						{users.length !== 0 ? (
							<>
								{users.slice(0, 4).map((user: { name: string; image: string }, userIndex: number) => {
									const { name, image } = user;
									return (
										<div className="flex items-center justify-center bg-background rounded-full w-12 h-12 -ml-6 z-40" key={userIndex}>
											<Avatar className="border shadow-sm w-10 h-10">
												<AvatarImage src={image} alt={name} />
												<AvatarFallback>
													{name
														?.split(' ')
														.map((word) => word.charAt(0).toUpperCase())
														.join('')}
												</AvatarFallback>
											</Avatar>
										</div>
									);
								})}
								{users.length > 4 && (
									<div className="flex items-center justify-center bg-background rounded-full w-12 h-12 -ml-6 z-40">
										<span className="rounded-full border shadow-sm flex items-center justify-center w-10 h-10 bg-muted">
											<Ellipsis className="w-5 h-5" />
										</span>
									</div>
								)}
							</>
						) : (
							<span className="rounded-full border shadow-sm w-10 h-10 flex items-center justify-center -ml-1">
								<UserRound className="w-5 h-5" />
							</span>
						)}
						<div className="text-sm flex gap-4 items-center ">
							<span className="-mr-1">
								{users.length === 0 ? (
									<div className="ml-3 font-medium">Gallery not shared</div>
								) : (
									<div className="ml-3 font-medium">
										Gallery shared with {users.length} user{users.length > 1 && 's'}
									</div>
								)}
							</span>
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="outline">Manage</Button>
								</DialogTrigger>
								<DialogContent className="w-[95%] sm:w-1/2 sm:p-6 px-3 py-6">
									<DialogHeader>
										<DialogTitle>People with access </DialogTitle>
										<DialogDescription>Invite user to collaborate.</DialogDescription>
									</DialogHeader>
									<UserAccred galleryId={gallery?.publicId?.toString()} />
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</div>

			<Separator />

			<div className="-ml-2 w-[calc(100%+1rem)]">
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

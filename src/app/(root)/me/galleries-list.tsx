'use client';
import { getGalleries } from '@/lib/galleries';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CameraOff, Dot, Eye, Lock, Plus, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserData } from '@/types/user';
import { useState } from 'react';

interface Gallery {
	accredited_users: string;
	images: string;
	galleryName: string;
	description: string;
	updatedAt: string;
	publicId: string;
}

export default function GalleriesList({ userData, galleries }: { userData: UserData; galleries: Gallery[] }) {
	const userName = userData?.name ?? 'User';

	const [errors, setErrors] = useState({ name: '', description: '' });

	async function createGallery(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const target = event.target as HTMLFormElement;
		const name = target.name.value;
		const description = target.description.value;

		if (name.length < 2) {
			setErrors({ ...errors, name: 'Name must be at least 2 characters.' });
			return;
		}

		if (description.length > 500) {
			setErrors({ ...errors, description: 'Description must not be longer than 500 characters.' });
			return;
		}

		if (errors.name || errors.description) {
			return;
		}

		console.log('Creating gallery', { name, description });
	}

	return (
		<section>
			<div className="space-y-6 flex items-center justify-between">
				<div className="space-y-0.5">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">
						{userName.charAt(0).toUpperCase() + userName.slice(1)}'s {galleries.length === 1 ? 'gallery' : 'galleries'}
					</h2>
					<p className="text-muted-foreground md:text-base text-xs">Manage your galleries from here</p>
				</div>
				<Dialog>
					<DialogTrigger asChild onClick={() => setErrors({ name: '', description: '' })}>
						<Button>
							<Plus className="mr-2 h-4 w-4" /> Create new gallery
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<form onSubmit={createGallery}>
							<DialogHeader>
								<DialogTitle>Create new gallery</DialogTitle>
								<DialogDescription>Enter title and description</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4 mb-2">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="name" className="text-right">
										Title
									</Label>
									<Input id="name" defaultValue="My gallery" className="col-span-3" />
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="description" className="text-right">
										Description
									</Label>
									<Input id="description" defaultValue="This gallery is about..." className="col-span-3" />
								</div>
							</div>
							{errors.description && (
								<p className="col-span-4 text-red-500 text-sm flex">
									<Dot className="-mt-0.5" />
									{errors.description}
								</p>
							)}
							{errors.name && (
								<p className="col-span-4 text-red-500 text-sm flex">
									<Dot className="-mt-0.5" />
									{errors.name}
								</p>
							)}
							<DialogFooter className="mt-3">
								<Button type="submit">Create gallery</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<div className="mt-5 flex flex-wrap justify-center gap-2">
				{galleries.map((gallery: Gallery, index: number) => {
					const images = gallery.images ? gallery.images.split(',') : [];
					const usernames = gallery.accredited_users ? gallery.accredited_users.split('|') : [];

					return (
						<Link href={`/gallery/${gallery.publicId}/edit`} key={index + 'gallery'}>
							<Card className="w-96 lg:h-[27rem] h-[23rem] cursor-pointer">
								{images.length !== 0 ? (
									<div className="grid grid-cols-2 gap-2 h-[256px]">
										{images.slice(0, 4).map((imageUrl, imgIndex) => (
											<img src={imageUrl} alt={`Image ${imgIndex + 1}`} width={300} height={200} className="rounded-t-lg object-cover aspect-[3/2]" key={imgIndex} />
										))}
									</div>
								) : (
									<div className="h-[256px] rounded-t-lg flex items-center justify-center dark:bg-zinc-900 bg-zinc-200">
										<CameraOff />
									</div>
								)}

								<CardContent className="p-4">
									<div className="ml-1 flex justify-between">
										<div className={cn('flex items-center', usernames.length != 0 && 'px-6 -ml-2')}>
											{usernames.length !== 0 ? (
												usernames.slice(0, 6).map((user: string, userIndex: number) => {
													let userObject: { name: string; image: string };
													try {
														userObject = JSON.parse(user);
													} catch (e) {
														console.error('Invalid JSON', e);
														return null;
													}

													const { name, image } = userObject;

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
												})
											) : (
												<span className="rounded-full border shadow-sm w-10 h-10 flex items-center justify-center -ml-1">
													<UserRound className="w-5 h-5" />
												</span>
											)}
											<div className="text-sm">{usernames.length == 0 && <div className="ml-3 font-medium">Not shared</div>}</div>
										</div>
										<div className="text-end flex justify-end items-center">
											<p className="text-muted-foreground flex gap-1 justify-end items-center">
												{/* {new Date(gallery.updatedAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
												})} */}
												<Lock className="w-4 h-4" />
												<Eye className="w-4 h-4" />
											</p>
										</div>
									</div>
									<h3 className="text-lg font-semibold truncate mt-1 -mb-1">{gallery.galleryName}</h3>
									<p className="text-muted-foreground line-clamp-2">{gallery.description || 'No description available.'}</p>
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</section>
	);
}

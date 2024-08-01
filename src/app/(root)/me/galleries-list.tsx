'use client';
import { AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Gallery } from '@/types/gallery';

export default function GalleriesList({ userData, galleries }: { userData: UserData; galleries: Gallery[] }) {
	const userName = userData?.name ?? 'User';
	const [errors, setErrors] = useState<string[]>([]);
	const [name, setName] = useState<string>('My gallery');
	const [description, setDescription] = useState<string>('This gallery is about...');
	const router = useRouter();

	async function createGallery(event: React.FormEvent<HTMLFormElement>) {
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

			if (response.ok) {
				const data = await response.json();
				router.push(data.redirect);
			} else {
				const error = await response.json();
				setErrors([error.error]);
			}
		} catch (error) {
			console.error('Error:', error);
			setErrors(['Error creating gallery']);
		}
	}

	return (
		<section>
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">
						{userName.charAt(0).toUpperCase() + userName.slice(1)}'s {galleries.length === 1 ? 'gallery' : 'galleries'}
					</h2>
					<p className="text-muted-foreground md:text-base text-xs">Manage your galleries from here</p>
				</div>
				<Dialog>
					<DialogTrigger asChild onClick={() => setErrors([])}>
						<Button className="sm:px-4 sm:py-2 px-2 py-1">
							<Plus className="mr-2 h-4 w-4" />
							<span className="flex gap-1">
								<span className="hidden sm:block">Create </span> new <span className="hidden sm:block"> gallery</span>
							</span>
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px] w-[95%]">
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
									<Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="description" className="text-right">
										Description
									</Label>
									<Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
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
							<DialogFooter className="mt-3">
								<Button type="submit">Create gallery</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<div className="mt-5 flex flex-wrap justify-center gap-4">
				{galleries.map((gallery: Gallery, index: number) => {
					let usernames = [];
					let coverImage = [];
					let images = [];

					if (gallery.accredited_users) {
						try {
							usernames = JSON.parse('[ ' + gallery.accredited_users + ' ]');
						} catch (e) {
							console.error('Error parsing gallery.accredited_users:', e);
						}
					}

					if (gallery.coverImage) {
						coverImage = gallery.coverImage;
					}

					if (gallery.images) {
						try {
							images = JSON.parse('[ ' + gallery.images + ' ]');
						} catch (e) {
							console.error('Error parsing gallery.images:', e);
						}
					}

					return (
						<Link href={`/gallery/${gallery.publicId}/edit`} key={index}>
							<Card className="w-full sm:w-96 lg:h-[27rem] h-[25rem] cursor-pointer">
								{coverImage.length !== 0 && images.length !== 0 ? (
									<div className="grid grid-cols-2 h-[256px] rounded-t-lg overflow-hidden">
										{coverImage.map((imageId: number, imageIndex: number) => {
											const image = images.find((img: { imageId: number }) => img.imageId === imageId);

											if (!image) return null;

											return <img src={`/api/image?imageUrl=${image.imageUrl}`} alt={`Loading`} width={300} height={200} className="object-cover aspect-[3/2]" key={imageIndex} />;
										})}
									</div>
								) : (
									<div className="h-[256px] rounded-t-lg flex items-center justify-center dark:bg-zinc-900 bg-zinc-200">
										<CameraOff />
									</div>
								)}

								<CardContent className="p-4">
									<div className="ml-1 flex justify-between">
										<div className={cn('flex items-center', usernames.length !== 0 && 'px-6 -ml-2')}>
											{usernames.length !== 0 ? (
												usernames.slice(0, 6).map((user: { name: string; image: string }, userIndex: number) => {
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
												})
											) : (
												<span className="rounded-full border shadow-sm w-10 h-10 flex items-center justify-center -ml-1">
													<UserRound className="w-5 h-5" />
												</span>
											)}
											<div className="text-sm">{usernames.length === 0 && <div className="ml-3 font-medium">Not shared</div>}</div>
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

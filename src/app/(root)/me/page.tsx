import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/next-auth';
import { Userdata } from '@/types/user';
import { getGalleries } from '@/lib/galleries';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from 'react';
import { CameraOff, Lock } from 'lucide-react';

async function fetchUserData(session: any): Promise<Userdata> {
	const infoSession = await getInfoSession(session);

	return {
		name: infoSession.nameDisplay ? infoSession.name : infoSession.username,
		email: infoSession.email,
		bio: infoSession.bio,
	};
}

async function fetchGalleries(session: any) {
	const galleries = await getGalleries(session.user.email);
	return galleries;
}

export default async function SettingsProfilePage() {
	const session = await getServerSession();

	if (!session) {
		redirect('/auth/signin');
	}

	const userData = await fetchUserData(session);
	const galleries = await fetchGalleries(session);

	const userName = userData?.name ?? 'User';

	return (
		<section>
			<div className="space-y-6">
				<div className="space-y-0.5">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">
						{userName.charAt(0).toUpperCase() + userName.slice(1)}'s {galleries.length === 1 ? 'gallery' : 'galleries'}
					</h2>
					<p className="text-muted-foreground md:text-base text-xs">Manage your galleries from here</p>
				</div>
			</div>
			<div className="mt-5 flex flex-wrap justify-center gap-2">
				{JSON.stringify(galleries)}
				{galleries.map((gallery: { accredited_users: string; images: string; name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; description: any; updatedAt: any }, index: Key | null | undefined) => {
					const images = gallery.images ? gallery.images.split(',') : [];
					const usernames = gallery.accredited_users ? gallery.accredited_users.split('|') : [];

					return (
						<Card className="w-96 lg:h-[27rem] h-[23rem]" key={index}>
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

							<CardContent className="p-4 space-y-2">
								<div className="flex items-center gap-2">
									{usernames.length !== 0 ? (
										usernames.slice(0, 6).map((user: string, userIndex: number) => {
											let userObject: { name: string; image: string };
											try {
												userObject = JSON.parse(JSON.stringify(user));
											} catch (e) {
												console.error('Invalid JSON', e);
												return null;
											}

											console.log(userObject);

											const { name, image } = userObject;

											return (
												<Avatar className="border shadow-sm w-8 h-8 lg:w-10 lg:h-10" key={userIndex}>
													<AvatarImage src={image} alt={name} />
													<AvatarFallback>
														{name
															?.split(' ')
															.map((word) => word.charAt(0).toUpperCase())
															.join('')}
													</AvatarFallback>
												</Avatar>
											);
										})
									) : (
										<span className="rounded-full border shadow-sm w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
											<Lock className="w-5 h-5" />
										</span>
									)}
									<div className="text-sm text-muted-foreground">
										<div className="font-medium">{userName}</div>
										<div>
											{new Date(gallery.updatedAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
											})}
										</div>
									</div>
								</div>
								<h3 className="text-lg font-semibold truncate">{gallery.name}</h3>
								<p className="text-muted-foreground line-clamp-2">{gallery.description || 'No description available.'}</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</section>
	);
}

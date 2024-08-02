import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession } from '@/lib/users';
import { UserData } from '@/types/user';
import { getGalleries } from '@/lib/galleries';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CameraOff, Eye, Lock, Plus, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GalleriesList from './galleries-list';
interface Gallery {
	accredited_users: string;
	images: string;
	galleryName: string;
	description: string;
	updatedAt: string;
	publicId: string;
}

async function fetchUserData(session: any): Promise<UserData> {
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

	return (
		<div>
			<GalleriesList userData={userData} galleries={galleries} />
		</div>
	);
}

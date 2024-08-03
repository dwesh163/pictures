'use server';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Input from './input';
import { getInfoSession } from '@/lib/users';
import { getJoinInfo } from '@/lib/galleries';
import NotFound from '@/app/not-found';

export default async function JoinPage({ searchParams }: { searchParams: { token?: string } }) {
	const session = await getServerSession();

	if (!session) {
		redirect(`/auth/signup?callbackUrl=${process.env.NEXTAUTH_URL}/join?token=${searchParams.token}`);
	}

	if (!searchParams.token) {
		return (
			<div className="absolute top-0 left-0 z-[200] bg-background h-screen w-screen  ">
				<NotFound />
			</div>
		);
	}

	const joinInfo = await getJoinInfo(searchParams.token);

	return <Input hasPhoneNum={joinInfo.phoneNum != null} creator={joinInfo.name} name={joinInfo.galleryName} />;
}

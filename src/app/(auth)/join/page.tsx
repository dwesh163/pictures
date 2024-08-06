'use server';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getInfoSession, userJoin } from '@/lib/users';
import NotFound from '@/app/not-found';

export default async function JoinPage({ searchParams }: { searchParams: { token?: string } }) {
	const session = await getServerSession();

	if (!session) {
		redirect(`/auth/signin?callbackUrl=${process.env.NEXTAUTH_URL}/join?token=${searchParams.token}`);
	}

	const infoSession = await getInfoSession(session.user.email as string);

	if (!searchParams.token) {
		return (
			<div className="absolute top-0 left-0 z-[200] bg-background h-screen w-screen  ">
				<NotFound />
			</div>
		);
	}

	const join = await userJoin(searchParams.token, infoSession.phoneNumber as string);

	if (!join) {
		redirect(`/auth/signin?callbackUrl=${process.env.NEXTAUTH_URL}/join?token=${searchParams.token}`);
	} else {
		redirect(`/`);
	}
}

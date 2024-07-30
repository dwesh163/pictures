'use client';
import { useSession } from 'next-auth/react';

export default function Page() {
	const { data: session, status } = useSession();

	return <h1 className="text-white">{JSON.stringify(session)}</h1>;
}

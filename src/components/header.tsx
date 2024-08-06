import React from 'react';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { Camera } from 'lucide-react';
import { UserDropdown } from './user-dropdown';
import { UserNotifications } from './user-notifications';

export function Header() {
	const { data: session, status } = useSession();

	return (
		<header className="w-full flex justify-between p-5 border-b lg:relative fixed bg-background z-50">
			<div className="flex justify-start items-center">
				<Link href="/" className="flex gap-2 justify-center items-center">
					<Camera className="w-8 h-8" />
					<h1 className="text-2xl font-black">Pictures</h1>
				</Link>
			</div>
			{status === 'unauthenticated' ? (
				<Button asChild>
					<Link href="/auth/signin">Login</Link>
				</Button>
			) : (
				<div className="flex items-center gap-4 j">
					<UserNotifications />
					<UserDropdown />
				</div>
			)}
		</header>
	);
}

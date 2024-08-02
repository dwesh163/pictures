'use client';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import React from 'react';

import { MobileNav } from '@/components/mobile/navbar';
import { Header } from '@/components/header';

export default function RootLayout({ children, session }: { children: ReactNode; session?: Session }) {
	return (
		<SessionProvider session={session}>
			<Header />
			{/* <MobileNav /> */}
			<main className="lg:pt-0 pt-16">{children}</main>
		</SessionProvider>
	);
}

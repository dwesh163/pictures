'use client';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CircleCheckBig } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function Success() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl');

	return (
		<div className="flex items-center justify-center w-full sm:h-screen flex-col sm:p-5 p-2 py-5 mt-12 sm:mt-0">
			<Link href="/" className="flex gap-2 justify-center items-center mb-8 mt-8">
				<Camera className="w-8 h-8" />
				<h1 className="text-3xl font-black">Pictures</h1>
			</Link>
			<Card className="w-full sm:w-1/2 xl:w-1/4 sm:mx-5 border-0 sm:border">
				<CardContent className="flex space-y-2 items-center justify-center flex-col pt-0 sm:p-6 px-3">
					<CircleCheckBig className="w-12 h-12 mt-4" />
					<h2 className="sm:text-2xl text-xl font-bold mt-4 text-center">Signup Successful!</h2>
					<p className="mt-2 sm:text-xl text-sm text-muted-foreground text-center">You have successfully signed up. You can now</p>
					<Button asChild className="mt-4 w-1/2">
						<Link href={`/auth/signin?callbackUrl=${callbackUrl}`}>Sign in</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default function SuccessPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Success />
		</Suspense>
	);
}

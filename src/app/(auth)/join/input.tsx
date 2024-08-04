'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CircleCheckBig } from 'lucide-react';
import Link from 'next/link';
import { PhoneInput } from '@/components/phone-input';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function InputPage({ hasPhoneNum, creator, name }: { hasPhoneNum: boolean; creator: string; name: string }) {
	const searchParams = useSearchParams();

	const [code, setCode] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');

	const router = useRouter();

	async function joinGallery() {
		const response = await fetch(`/api/gallery/join`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phoneNumber, userCode: code, token: searchParams.get('token') }),
		});
		const data = await response.json();
		if (data.success) {
			router.push(`/join/success?creator=${creator}&name=${name}`);
		} else if (data.error) {
			setError(data.error);
		}
	}

	return (
		<div className="flex items-center justify-center w-full flex-col sm:p-5 p-2 py-5 mt-12 sm:mt-28">
			<Link href="/" className="flex gap-2 justify-center items-center mb-8 mt-8">
				<Camera className="w-8 h-8" />
				<h1 className="text-3xl font-black">Pictures</h1>
			</Link>
			<Card className="w-full sm:w-1/2 xl:w-1/4 sm:mx-5 border-0 sm:border">
				<CardHeader className="sm:px-6 px-3 pb-2">
					<CardTitle className="font-semibold tracking-tight text-2xl">Join {name}</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">For security reasons, you must enter the security code.</CardDescription>
				</CardHeader>
				<CardContent className="flex space-y-4 items-center justify-center flex-col sm:px-6 px-3">
					<Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXXXX" className="mt-1" />
					{!hasPhoneNum && <PhoneInput className="w-full" value={phoneNumber} onChange={setPhoneNumber} international={false} defaultCountry="CH" placeholder="Enter a phone number" />}
					{error && <p className="text-red-500">{error}</p>}
					<Button className="mt-8 w-full" onClick={() => joinGallery()}>
						Join
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

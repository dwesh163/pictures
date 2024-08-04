'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { PhoneInput } from './phone-input';

export function ShareGallery({ galleryId, setIsSharetDialogOpen }: { galleryId: string; setIsSharetDialogOpen: (value: boolean) => void }) {
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');
	const [code, setCode] = useState('');

	async function sendInvitation() {
		console.log(phoneNumber, email);

		const response = await fetch(`/api/gallery/${galleryId}/share`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, phoneNumber }),
		});
		const data = await response.json();
		if (data.success) {
			setCode(data.code);
		} else if (data.error) {
			setError(data.error);
		}
	}

	return (
		<>
			{!code ? (
				<>
					<Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@exmaple.com" className="mt-1" />
					<PhoneInput value={phoneNumber} onChange={setPhoneNumber} international={false} defaultCountry="CH" placeholder="Enter a phone number" />
					{error && <p className="text-red-500">{error}</p>}
					<Button className="mt-1 w-full" onClick={() => sendInvitation()}>
						Send invitation
					</Button>
				</>
			) : (
				<>
					<p className="">His security code is : </p>
					<p className="text-2xl font-bold text-center w-full">{code}</p>
					<p className="text-muted-foreground"> Don't forget to share the code, you can only see it once</p>
				</>
			)}
		</>
	);
}

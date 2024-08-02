'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export function ShareGallery() {
	const [email, setEmail] = useState('');

	function sendInvitation() {
		email;
	}

	return (
		<>
			<div className="flex space-x-2">
				<Input value="http://example.com/link/to/document" readOnly />
				<Button variant="secondary" className="shrink-0">
					Copy Link
				</Button>
			</div>
			<Separator className="my-4" />

			<form onSubmit={sendInvitation} className="space-y-2">
				<div class="flex flex-col space-y-1.5 text-center sm:text-left">
					<h2 class="text-lg font-semibold leading-none tracking-tight">Invite by email</h2>
					<p id="radix-:r7:" class="text-sm text-muted-foreground">
						Invite people to collaborate on this gallery by entering their email addresses.
					</p>
				</div>

				<Input value={email} onChange={() => setEmail(e.target.value)} />
				<Button type="summit" className="shrink-0 mt-4 w-full">
					Send invitation
				</Button>
			</form>
		</>
	);
}

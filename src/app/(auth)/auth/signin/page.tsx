'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const handleTogglePassword = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await signIn('credentials', {
			email,
			password,
			callbackUrl: searchParams.get('callbackUrl') || '/',
		});
	};

	const error = searchParams.get('error');

	return (
		<div className="flex items-center justify-center w-full sm:h-screen flex-col p-5">
			<Link href="/" className="flex gap-2 justify-center items-center mb-8 mt-8">
				<Camera className="w-8 h-8" />
				<h1 className="text-3xl font-black">Pictures</h1>
			</Link>
			<Card className="w-full sm:w-1/2 xl:w-1/4 mx-5">
				<CardHeader>
					<CardTitle className="font-semibold tracking-tight text-2xl">Signin</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">Enter your email below to signin</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="pt-0 grid gap-4">
						<div className="grid grid-cols-2 gap-6">
							<Button variant="outline" onClick={() => signIn('github', { callbackUrl: searchParams.get('callbackUrl') || '/' })}>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 h-4 w-4 text-black dark:text-white" viewBox="0 0 16 16">
									<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
								</svg>
								Github
							</Button>
							<Button variant="outline" onClick={() => signIn('google', { callbackUrl: searchParams.get('callbackUrl') || '/' })}>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2 h-4 w-4 text-black dark:text-white" viewBox="0 0 16 16">
									<path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
								</svg>
								Google
							</Button>
						</div>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t"></span>
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
							</div>
						</div>
						<form onSubmit={handleSubmit}>
							<div className="grid gap-2">
								<Label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									Email
								</Label>
								<Input id="email" type="email" placeholder="name@example.com" required value={email} className={error === 'CredentialsSignin' ? 'border border-red-300 ring-red-300 ring-offset-1' : ''} onChange={(e) => setEmail(e.target.value)} />
								{error === 'CredentialsSignin' && <p className="mt-1 text-red-500">Invalid Credentials</p>}
							</div>
							<div className="grid gap-2">
								<div className="sm:mb-4 mb-3 relative">
									<Label htmlFor="password">Password</Label>
									<Input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={error === 'CredentialsSignin' ? 'border border-red-300 ring-red-300 ring-offset-1' : ''} placeholder="••••••••" required />
									<button type="button" onClick={handleTogglePassword} className="absolute inset-y-0 h-10 mt-[1.53rem] right-0 pr-3 flex items-center text-gray-500">
										{showPassword ? <EyeOff /> : <Eye />}
									</button>
									{error === 'CredentialsSignin' && <p className="mt-1 text-red-500">Invalid Credentials</p>}
								</div>
							</div>
							<div className="flex flex-col items-center pt-5">
								<Button type="submit" className="w-full">
									Signin
								</Button>
								<div className="flex gap-1 text-sm text-muted-foreground mt-2">
									Don&apos;t have an account?{' '}
									<Link href="/auth/signup" className="underline">
										Sign up
									</Link>
								</div>
							</div>
						</form>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoginForm />
		</Suspense>
	);
}

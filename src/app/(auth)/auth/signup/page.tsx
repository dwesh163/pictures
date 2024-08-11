'use client';
import React, { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Camera } from 'lucide-react';
import Link from 'next/link';
import { PhoneInput } from '@/components/phone-input';

interface StepOneProps {
	name: string;
	setName: (value: string) => void;
	lastname: string;
	setLastname: (value: string) => void;
	username: string;
	setUsername: (value: string) => void;
	email: string;
	setEmail: (value: string) => void;
	phoneNumber: string;
	setPhoneNumber: (value: string) => void;
	password: string;
	setPassword: (value: string) => void;
	showPassword: boolean;
	handleTogglePassword: () => void;
}

function StepOne({ name, setName, lastname, setLastname, username, setUsername, phoneNumber, setPhoneNumber, email, setEmail, password, setPassword, showPassword, handleTogglePassword }: StepOneProps) {
	return (
		<>
			<div className="w-full flex justify-between gap-2">
				<div className="sm:mb-4 mb-3">
					<Label className="mb-2" htmlFor="name">
						Name
					</Label>
					<Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" placeholder="Your name" required />
				</div>
				<div className="sm:mb-4 mb-3">
					<Label className="mb-2" htmlFor="lastname">
						Last name
					</Label>
					<Input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="w-full" placeholder="Your lastname" required />
				</div>
			</div>
			<div className="sm:mb-4 mb-3">
				<Label className="mb-2">Username</Label>
				<Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full" placeholder="Username" required />
			</div>
			<div className="sm:mb-4 mb-3">
				<Label className="mb-2" htmlFor="phoneNumber">
					Phone Number
				</Label>
				<PhoneInput id="phoneNumber" value={phoneNumber} onChange={setPhoneNumber} className="w-full" international={false} defaultCountry="CH" required placeholder="XXX XXX XX XX" />
			</div>

			<div className="sm:mb-4 mb-3">
				<Label className="mb-2" htmlFor="email">
					Email
				</Label>
				<Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" placeholder="name@example.com" required />
			</div>
			<div className="sm:mb-4 mb-3 relative">
				<Label className="mb-2" htmlFor="password">
					Password
				</Label>
				<Input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" placeholder="••••••••" required />
				<button type="button" onClick={handleTogglePassword} className="absolute inset-y-0 h-10 sm:mt-[2.125rem] mt-[1.29rem] right-0 pr-3 flex items-center text-gray-500">
					{showPassword ? <EyeOff /> : <Eye />}
				</button>
			</div>
		</>
	);
}

interface StepOTPProps {
	otp: string;
	setOtp: (value: string) => void;
	email: string;
	summitOtp: () => void;
	resendOtp: () => void;
	error: string;
	setError: (value: string) => void;
	countdown: number;
}

function StepOTP({ otp, setOtp, email, summitOtp, resendOtp, error, setError, countdown }: StepOTPProps) {
	return (
		<div className="w-full">
			<header className="mb-8 text-center sm:text-left">
				<p className="text-[15px] text-muted-foreground">
					Enter the 6-digit verification code that was sent to <br />
					<strong>{email}</strong>
				</p>
			</header>
			<div className="flex justify-center flex-col gap-1">
				<div className="flex justify-center">
					<InputOTP maxLength={6} value={otp} onChange={(otp) => setOtp(otp)}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>
				<div className="flex justify-center">
					<Button onClick={summitOtp} className="w-1/2 my-4 flex justify-center">
						Verify Account
					</Button>
				</div>
			</div>
			{error && <p className="text-red-500">{error}</p>}

			<div className="text-sm mt-4 text-muted-foreground">
				Didn't receive code?{' '}
				<Button disabled={countdown != 0} onClick={() => resendOtp()} variant="link" className="px-0 text-muted-foreground">
					Resend
				</Button>{' '}
				{countdown > 0 ? `0${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60}` : ''}
			</div>
		</div>
	);
}

function StepSuccess() {
	return (
		<div className="flex flex-col items-center justify-center mt-8">
			<h2 className="sm:text-2xl text-xl font-bold text-gray-800 mt-4">Signup Successful!</h2>
			<p className="text-gray-600 mt-2">
				You have successfully signed up. You can now{' '}
				<a href="/auth/signin" className="text-blue-600 hover:underline">
					Sign in
				</a>
			</p>
		</div>
	);
}

function Signup() {
	const [step, setStep] = useState(1);
	const [name, setName] = useState('');
	const [lastname, setLastname] = useState('');
	const [username, setUsername] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [otp, setOtp] = useState('');
	const [error, setError] = useState('');
	const [otpId, setOtpId] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(0);

	const searchParams = useSearchParams();

	const router = useRouter();

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);
		if (countdown <= 0) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [countdown]);

	const handleTogglePassword = () => setShowPassword(!showPassword);

	const handleNextStep = () => setStep(step + 1);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		if (name.trim() === '' || lastname.trim() === '' || username.trim() === '' || phoneNumber.trim() === '' || email.trim() === '' || password.trim() === '') {
			setError('Missing field');
			return;
		}

		if (phoneNumber.length != 12) {
			setError('Invalid phone number');
			return;
		}

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, lastname, username, phoneNumber, email, password }),
			});
			const data = await response.json();
			if (data.otpId) {
				setOtpId(data.otpId);
				setError('');
				handleNextStep();
			} else {
				setError(data.error ?? 'Failed to get OTP');
			}
		} catch (error) {
			setError('An error occurred');
		}
	};

	const isUrl = (url: string) => {
		try {
			new URL(url);
			return true;
		} catch (error) {
			return false;
		}
	};

	const callbackUrlParam = searchParams.get('callbackUrl');

	let token = '';
	let callbackUrl = new URL('https://pictures.kooked.ch/');

	if (callbackUrlParam && callbackUrlParam.includes('token') && isUrl(callbackUrlParam)) {
		callbackUrl = new URL(callbackUrlParam);
		token = callbackUrl.searchParams.get('token') || '';
	}

	const summitOtp = async () => {
		if (!otpId) {
			setError('OTP ID is missing');
			return;
		}
		try {
			const response = await fetch('/api/auth/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, otpUser: otp, otpId, token }),
			});
			const data = await response.json();
			if (data.success) {
				if (data.join) {
					router.push(`/auth/signup/success?callbackUrl=/`);
				} else {
					router.push(`/auth/signup/success?callbackUrl=${searchParams.get('callbackUrl')}`);
				}
			} else {
				setError('Invalid OTP');
			}
		} catch (error) {
			setError('An error occurred while verifying OTP');
		}
	};

	const resendOtp = async () => {
		if (!otpId) {
			setError('OTP ID is missing');
			return;
		}
		try {
			const response = await fetch('/api/auth/resend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, otp, otpId }),
			});
			const data = await response.json();
			if (data.success) {
				setCountdown(5 * 60);
			} else {
				setError(data.message);
			}
		} catch (error) {
			setError('An error occurred while verifying OTP');
		}
	};

	return (
		<Suspense>
			<div className="flex items-center justify-center w-full sm:h-screen flex-col sm:p-5 p-2 py-5 mt-12 sm:mt-0">
				<Link href="/" className="flex gap-2 justify-center items-center mb-8 mt-8">
					<Camera className="w-8 h-8" />
					<h1 className="text-3xl font-black">Pictures</h1>
				</Link>
				<Card className="w-full sm:w-1/2 xl:w-1/4 sm:mx-5 border-0 sm:border">
					<CardHeader className={(step === 2 ? 'pb-0 sm:px-6 px-3' : 'sm:px-6 px-3') || undefined}>
						<CardTitle className="font-semibold tracking-tight text-2xl sm:text-left text-center">Signup</CardTitle>
						{step !== 2 && <CardDescription className="text-sm text-muted-foreground">Enter your details below to sign up</CardDescription>}
					</CardHeader>
					<CardContent className="pt-0 sm:px-6 px-3">
						{step === 1 && (
							<form onSubmit={handleSubmit}>
								<StepOne name={name} setName={setName} lastname={lastname} setLastname={setLastname} username={username} setUsername={setUsername} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} email={email} setEmail={setEmail} password={password} setPassword={setPassword} showPassword={showPassword} handleTogglePassword={handleTogglePassword} />
								<Button type="submit" className="mt-6 w-full">
									Next
								</Button>
								{error && <p className="text-red-500 mt-2">{error}</p>}
							</form>
						)}
						{step === 2 && <StepOTP otp={otp} setOtp={setOtp} email={email} summitOtp={summitOtp} resendOtp={resendOtp} error={error} setError={setError} countdown={countdown} />}
						{step === 3 && <StepSuccess />}
					</CardContent>
				</Card>
			</div>
		</Suspense>
	);
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Signup />
		</Suspense>
	);
}

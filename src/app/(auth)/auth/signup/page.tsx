'use client';
import { useRef, useState, ChangeEvent, FormEvent, KeyboardEvent, ClipboardEvent, FocusEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface StepOneProps {
	name: string;
	setName: (name: string) => void;
	lastname: string;
	setLastname: (lastname: string) => void;
	username: string;
	setUsername: (username: string) => void;
	email: string;
	setEmail: (email: string) => void;
	password: string;
	setPassword: (password: string) => void;
	showPassword: boolean;
	handleTogglePassword: () => void;
}

const StepOne = ({ name, setName, lastname, setLastname, username, setUsername, email, setEmail, password, setPassword, showPassword, handleTogglePassword }: StepOneProps) => (
	<>
		<div className="w-full flex justify-between gap-2">
			<div className="sm:mb-4 mb-3">
				<Label htmlFor="name">Name</Label>
				<Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
			</div>
			<div className="sm:mb-4 mb-3">
				<Label htmlFor="lastname">Last name</Label>
				<Input type="text" id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Your lastname" required />
			</div>
		</div>
		<div className="sm:mb-4 mb-3">
			<Label htmlFor="username">Username</Label>
			<Input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
		</div>
		<div className="sm:mb-4 mb-3">
			<Label htmlFor="email">Email</Label>
			<Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
		</div>
		<div className="sm:mb-4 mb-3 relative">
			<Label htmlFor="password">Password</Label>
			<Input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" placeholder="••••••••" required />
			<button type="button" onClick={handleTogglePassword} className="absolute inset-y-0 h-10 mt-[1.53rem] right-0 pr-3 flex items-center text-gray-500">
				{showPassword ? <EyeOff /> : <Eye />}
			</button>
		</div>
	</>
);

interface StepOTPProps {
	otp: string;
	setOtp: (otp: string) => void;
	email: string;
	summitOtp: () => void;
}

const StepOTP = ({ otp, setOtp, email, summitOtp }: StepOTPProps) => {
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
		if (!/^[0-9]{1}$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && !e.metaKey) {
			e.preventDefault();
		}

		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (index > 0) {
				if (index === inputsRef.current.length - 1 && inputsRef.current[index]?.value) {
					inputsRef.current[index]!.value = '';
				} else if (inputsRef.current[index]?.value === '') {
					inputsRef.current[index - 1]?.focus();
				}
			}
		}
	};

	const handleFocus = (e: FocusEvent<HTMLInputElement>) => e.target.select();

	const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
		if (/^[0-9]{1}$/.test(e.target.value)) {
			setOtp(otp.slice(0, index) + e.target.value + otp.slice(index + 1));
			if (index < inputsRef.current.length - 1) {
				inputsRef.current[index + 1]?.focus();
			} else {
				e.target.blur();
				summitOtp();
			}
		} else {
			setOtp(otp.slice(0, index) + ' ' + otp.slice(index + 1));
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const paste = e.clipboardData.getData('text');
		const formatted = paste
			.split('')
			.filter((c) => /^[0-9]{1}$/.test(c))
			.slice(0, inputsRef.current.length);

		formatted.forEach((character, i) => {
			setOtp(otp.slice(0, i) + character + otp.slice(i + 1));
			if (inputsRef.current[i]) {
				inputsRef.current[i]!.value = character;
			}
		});

		if (inputsRef.current[formatted.length - 1]) {
			inputsRef.current[formatted.length - 1]!.focus();
		}
	};

	return (
		<>
			<div className="flex flex-col sm:mb-4 mb-3 text-center w-full">
				<p className="text-sm text-gray-800 mb-4 font-bold">Enter the 6-digit code sent to {email}</p>
				<div className="flex flex-row justify-center items-center gap-2">
					{Array(6)
						.fill(0)
						.map((_, index) => (
							<Input key={index} type="text" maxLength={1} onKeyDown={(e) => handleKeyDown(e, index)} onChange={(e) => handleChange(e, index)} onFocus={handleFocus} onPaste={handlePaste} ref={(ref) => (inputsRef.current[index] = ref)} className="w-12 h-12 sm:w-14 sm:h-14 text-center border rounded-lg text-2xl border-gray-300 focus:outline-none focus:border-gray-500" />
						))}
				</div>
			</div>
		</>
	);
};

const Signup = () => {
	const [step, setStep] = useState(1);
	const [name, setName] = useState('');
	const [lastname, setLastname] = useState('');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [otp, setOtp] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const handleTogglePassword = () => setShowPassword(!showPassword);

	const handleStepOneSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setMessage(''); // Clear any previous message

		try {
			// API call to send OTP
			const response = await fetch('/api/send-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, name, lastname, username, password }),
			});

			if (response.ok) {
				setStep(2);
			} else {
				const { message } = await response.json();
				setMessage(message);
			}
		} catch (error) {
			console.error(error);
			setMessage('An error occurred. Please try again later.');
		}
	};

	const summitOtp = async () => {
		setMessage(''); // Clear any previous message

		try {
			// API call to verify OTP
			const response = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, otp }),
			});

			if (response.ok) {
				router.push('/dashboard');
			} else {
				const { message } = await response.json();
				setMessage(message);
			}
		} catch (error) {
			console.error(error);
			setMessage('An error occurred. Please try again later.');
		}
	};

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			<Card className="w-full sm:w-1/4">
				<CardHeader>
					<CardTitle className="font-semibold tracking-tight text-2xl">Signup</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">Enter your personal information</CardDescription>
				</CardHeader>
				<CardContent>
					{step === 1 ? (
						<form onSubmit={handleStepOneSubmit}>
							{message && <Alert className="mb-4">{message}</Alert>}
							<StepOne name={name} setName={setName} lastname={lastname} setLastname={setLastname} username={username} setUsername={setUsername} email={email} setEmail={setEmail} password={password} setPassword={setPassword} showPassword={showPassword} handleTogglePassword={handleTogglePassword} />
							<Button type="submit" className="w-full mt-4">
								Next
							</Button>
						</form>
					) : (
						<>
							{message && <Alert className="mb-4">{message}</Alert>}
							<StepOTP otp={otp} setOtp={setOtp} email={email} summitOtp={summitOtp} />
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Signup;

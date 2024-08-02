'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { UserProfileData } from '@/types/user';

const profileFormSchema = z.object({
	username: z.string().min(2, { message: 'Username must be at least 2 characters.' }).max(30, { message: 'Username must not be longer than 30 characters.' }),
	email: z.string().email({ message: 'Invalid email address.' }),
	bio: z.string().max(160).min(4),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Map UserProfileData to ProfileFormValues
const mapUserDataToDefaultValues = (userData: UserProfileData): ProfileFormValues => ({
	username: userData.username ?? '', // Default to empty string if undefined or null
	email: userData.email ?? '', // Default to empty string if undefined or null
	bio: userData.bio ?? '', // Default to empty string if undefined or null
});

export function ProfileForm({ userData }: { userData: UserProfileData }) {
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: mapUserDataToDefaultValues(userData),
		mode: 'onChange',
	});

	function onSubmit(data: ProfileFormValues) {
		console.log(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="username" {...field} />
							</FormControl>
							<FormDescription>This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="user@example.com" {...field} disabled />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
							</FormControl>
							<FormDescription>
								You can <span>@mention</span> other users and organizations to link to them.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Update profile</Button>
			</form>
		</Form>
	);
}

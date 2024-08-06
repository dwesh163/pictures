'use client';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

export default function UserNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const fetchNotifications = async () => {
		try {
			const res = await fetch('/api/notifications?isRead=true');
			if (!res.ok) throw new Error('Failed to fetch notifications');
			const data = await res.json();
			setNotifications(data);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	async function markAsRead(notificationId: number) {
		try {
			const res = await fetch('/api/notifications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notificationId }),
			});
			if (!res.ok) throw new Error('Failed to mark notification as read');
			fetchNotifications();
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	}

	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<div className="space-y-0.5 flex items-center justify-start">
				{/* Use router.back() for navigation */}
				<button onClick={() => router.back()} className="flex items-center">
					<ArrowLeft className="mr-2 cursor-pointer mt-0.5" />
				</button>
				<h2 className="md:text-2xl text-xl font-bold tracking-tight">Notifications</h2>
			</div>
			<div>
				{loading ? (
					<p className="text-center w-full">Loading notifications...</p>
				) : notifications.length > 0 ? (
					notifications.map((notification, index) => (
						<div
							key={notification.notificationId}
							className={cn('flex flex-col items-center', {
								'opacity-50': notification.isRead == 1,
							})}>
							<button className="flex justify-between w-full p-2 pt-0 pl-1 mt-1 mb-2">
								<div className="flex flex-col ml-2">
									<span className="text-sm font-medium text-left">{notification.message}</span>
									<span className="text-xs text-muted-foreground text-left">
										You can view{' '}
										<Link href={notification.link} className="transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-primary underline-offset-4 hover:underline">
											here
										</Link>
									</span>
								</div>
								<div className="flex items-center justify-center cursor-pointer">
									<Trash2 className="mt-3" onClick={() => markAsRead(notification.notificationId)} />
								</div>
							</button>
							{notifications.length > 1 && notifications.length - 1 !== index && <div className="w-full border-t border-muted" />}
						</div>
					))
				) : (
					<p className="text-center w-full">No notifications available.</p>
				)}
			</div>
		</div>
	);
}

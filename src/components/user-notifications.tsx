'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

export function UserNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	// Fetch notifications
	useEffect(() => {
		fetch('/api/notifications')
			.then((res) => res.json())
			.then((data) => {
				setNotifications(data);
			});
	}, []);

	function markAsRead(notificationId: number) {
		fetch('/api/notifications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ notificationId: notificationId }),
		}).then(() => {
			if (notificationId) {
				setNotifications(notifications.filter((notification) => notification.notificationId !== notificationId));
			}
		});
	}

	return (
		<>
			<Link href="/notifications" className={cn('mt-2 focus-visible:outline-none', { 'sm:hidden': notifications.length > 0 })}>
				<span className="relative inline-block">
					<Bell />
					{notifications.length > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notifications.length}</span>}
				</span>
			</Link>
			<div className={cn('hidden', { 'sm:flex': notifications.length > 0 })}>
				<DropdownMenu>
					<DropdownMenuTrigger className="mt-2 focus-visible:outline-none">
						<span className="relative inline-block">
							<Bell />
							{notifications.length > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notifications.length}</span>}
						</span>
					</DropdownMenuTrigger>

					{notifications.length > 0 && (
						<DropdownMenuContent side="bottom" align="end" className="sm:max-w-[400px] w-[75vw] cursor-pointer">
							{notifications.map((notification, index) => (
								<div key={notification.notificationId}>
									<DropdownMenuItem asChild>
										<button
											className="flex flex-start w-full p-2 pl-1 cursor-pointer"
											onClick={(e) => {
												e.preventDefault(); // Prevent default button behavior
												markAsRead(notification.notificationId);
											}}>
											<div className="flex flex-col ml-2">
												<span className="text-sm font-medium text-start">{notification.message}</span>
												<span className="text-xs text-muted-foreground text-start">
													You can view{' '}
													<Link className="transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline" href={notification.link}>
														here
													</Link>
												</span>
											</div>
										</button>
									</DropdownMenuItem>
									{notifications.length > 1 && notifications.length - 1 !== index && <DropdownMenuSeparator />}
								</div>
							))}
						</DropdownMenuContent>
					)}
				</DropdownMenu>
			</div>
		</>
	);
}

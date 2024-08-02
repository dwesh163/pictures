'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UsersData } from '@/types/user';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function AdminPanel({ adminData }: { adminData: { users: UsersData[] } }) {
	const [users, setUsers] = useState<UsersData[]>(adminData.users);
	const [search, setSearch] = useState<string>('');
	const [accred, setAccred] = useState<Record<number, { name: string; description: string }>>({
		0: { name: 'Admin', description: 'Can view, edit, manage, and delete' },
		1: { name: 'Not verified', description: "Email isn't verified, state is unmodifiable" },
		2: { name: 'Unauthorized', description: 'Can do nothing' },
		3: { name: 'Authorize', description: 'Can view' },
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [openPopover, setOpenPopover] = useState<number | null>(null); // Manage open popover state

	const fetchUsers = useCallback(async () => {
		setError(null);
		try {
			const response = await fetch(`/api/admin/users`);
			if (!response.ok) throw new Error('Network response was not ok.');
			const data = await response.json();
			setUsers(data.users);
		} catch (error) {
			console.error('Failed to fetch users:', error);
			setError('Failed to fetch users.');
		}
	}, []);

	const handleRoleChange = useCallback(
		async (userId: number, newRoleId: number) => {
			setError(null);
			try {
				const response = await fetch(`/api/admin/users`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: userId, verifiedId: newRoleId }),
				});
				if (!response.ok) throw new Error('Network response was not ok.');
				await fetchUsers();
				setOpenPopover(null); // Close the popover after role change
			} catch (error) {
				console.error('Failed to update role:', error);
				setError('Failed to update role.');
			}
		},
		[fetchUsers]
	);

	const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));

	return (
		<div>
			<div className="flex items-center justify-between w-full">
				<div className="space-y-0.5 w-full">
					<h2 className="md:text-2xl text-xl font-bold tracking-tight">User Management</h2>
					<p className="text-muted-foreground md:text-base text-xs">Manage user roles and permissions</p>
				</div>
			</div>

			<Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full mt-6 mb-2" />
			<div className="grid gap-6 h-[30vh] sm:mt-3 mt-0">
				<div className="flex flex-col sm:space-y-4 space-y-2">
					{loading ? (
						<p className="flex justify-center items-center w-full h-full">
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						</p>
					) : error ? (
						<div className="flex justify-center items-center w-full h-full">
							<p className="text-red-600">{error}</p>
						</div>
					) : filteredUsers.length > 0 ? (
						<ScrollArea className="h-[70vh] w-full">
							{filteredUsers.map((user: UsersData, userIndex: number) => (
								<div key={userIndex} className="flex items-center justify-between space-x-4 sm:mt-4 mt-2">
									<div className="sm:space-x-4 space-x-2 flex items-center">
										<Avatar>
											<AvatarImage src={user.image} />
											<AvatarFallback>
												{user.name
													.split(' ')
													.map((word) => word.charAt(0).toUpperCase())
													.join('')}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-medium leading-none truncate">{user.name}</p>
											<p className="text-sm text-muted-foreground truncate sm:max-w-[24rem] max-w-[8rem]">{user.email}</p>
										</div>
									</div>
									<Popover
										open={openPopover === user.userId}
										onOpenChange={(isOpen) => {
											if (!isOpen) setOpenPopover(null);
										}}>
										<PopoverTrigger asChild>
											<Button variant="outline" className={cn('ml-auto w-42', (user.verified === 1 || user.verified === 0) && 'pointer-events-none opacity-50')} onClick={() => setOpenPopover(user.userId)}>
												{accred[user.verified]?.name || 'Unknown Role'}
												<ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0" align="end">
											<Command>
												<CommandInput placeholder="Select new role..." />
												<CommandList>
													<CommandEmpty>No roles found.</CommandEmpty>
													<CommandGroup>
														{Object.entries(accred)
															.slice(2, 4)
															.map(([id, role]) => (
																<CommandItem
																	key={id}
																	className="space-y-1 flex flex-col items-start px-4 py-2 cursor-pointer"
																	onSelect={() => {
																		handleRoleChange(user.userId, parseInt(id));
																	}}>
																	<p className="text-white">{role.name}</p>
																	<p className="text-sm text-muted-foreground">{role.description}</p>
																</CommandItem>
															))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							))}
						</ScrollArea>
					) : (
						<p className="flex justify-center items-center w-full h-full">No users available</p>
					)}
				</div>
			</div>
		</div>
	);
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AccredUser } from '@/types/user';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function UserAccred({ galleryId }: { galleryId: string }) {
	const [users, setUsers] = useState<AccredUser[]>([]);
	const [search, setSearch] = useState<string>('');
	const [accred, setAccred] = useState<Record<number, { name: string; description: string }>>({
		0: { name: 'Creator', description: 'Can view, edit, manage, and delete' },
		1: { name: 'invited', description: 'invited to gallery' },
		2: { name: 'waiting', description: 'waiting for approval' },
		3: { name: 'Viewer', description: 'Can view' },
		4: { name: 'Editor', description: 'Can view and edit' },
		5: { name: 'Owner', description: 'Can view, edit, and manage' },
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/gallery/${galleryId}/accred`);
			if (!response.ok) throw new Error('Network response was not ok.');
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error('Failed to fetch users:', error);
			setError('Failed to fetch users.');
		} finally {
			setLoading(false);
		}
	}, [galleryId]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleRoleChange = useCallback(
		async (userId: number, newRoleId: number) => {
			`Changing role for user ${userId} to ${newRoleId}`;
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/gallery/${galleryId}/accred`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: userId, accreditationId: newRoleId }),
				});
				if (!response.ok) throw new Error('Network response was not ok.');
				await fetchUsers();
			} catch (error) {
				console.error('Failed to update role:', error);
				setError('Failed to update role.');
			} finally {
				setLoading(false);
			}
		},
		[fetchUsers, galleryId]
	);

	const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));

	return (
		<>
			<Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="" />
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
						<ScrollArea className="h-[29vh] w-full">
							{filteredUsers.map((user: AccredUser, userIndex: number) => (
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
									<Popover>
										<PopoverTrigger asChild>
											<Button variant="outline" className="ml-auto w-32" disabled={user.accreditationId <= 1}>
												{accred[user.accreditationId]?.name || 'Unknown Role'}
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
															.slice(2, Object.keys(accred).length)
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
		</>
	);
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
	}[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<nav className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)} {...props}>
			{items.map((item) => (
				<Button asChild key={item.href} variant="ghost" className={cn(pathname === item.href ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline', 'justify-start')}>
					<Link href={item.href}> {item.title}</Link>
				</Button>
			))}
		</nav>
	);
}

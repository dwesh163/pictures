import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/settings/sidebar-nav';

const sidebarNavItems = [
	{
		title: 'Profile',
		href: '/settings',
	},
	{
		title: 'Account',
		href: '/settings/account',
	},
	{
		title: 'Appearance',
		href: '/settings/appearance',
	},
];

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	return (
		<div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">
			<div className="space-y-0.5">
				<h2 className="md:text-2xl text-xl font-bold tracking-tight">Settings</h2>
				<p className="text-muted-foreground md:text-base text-xs">Manage your account settings and set e-mail preferences.</p>
			</div>
			<Separator className="md:my-6 my-1" />
			<div className="flex flex-col md:space-y-8 space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0">
				<aside className="md:-mx-4 lg:w-1/5">
					<SidebarNav items={sidebarNavItems} />
				</aside>
				<div className="flex-1 lg:max-w-2xl">{children}</div>
			</div>
		</div>
	);
}

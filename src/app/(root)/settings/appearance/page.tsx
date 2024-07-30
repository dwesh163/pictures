import { Separator } from '@/components/ui/separator';
import { AppearanceForm } from './appearance-form';

export default function SettingsAppearancePage() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="md:text-lg text-base font-medium">Appearance</h3>
				<p className="md:text-sm text-xs text-muted-foreground">Customize the appearance of the app. Automatically switch between day and night themes.</p>
			</div>
			<Separator />
			<AppearanceForm />
		</div>
	);
}

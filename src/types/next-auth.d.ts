import { Session } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			username: string | undefined;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			bio?: string | null;
			birthday?: string | null;
			nameDisplay?: boolean | null;
		};
	}
}

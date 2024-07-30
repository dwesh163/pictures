// types/next-auth.d.ts
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
        username: string | undefined;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
  }
}

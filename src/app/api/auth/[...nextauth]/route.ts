import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth, { Account, AuthOptions, DefaultSession, Profile } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

interface MySQLUser {
	userId: string;
	name: string;
	email: string;
	image: string;
	password?: string;
	username?: string;
	provider?: string;
	verified?: boolean;
}

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export const authOptions: AuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID as string,
			clientSecret: process.env.GOOGLE_SECRET as string,
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const connection = await connectMySQL();
				try {
					if (credentials) {
						const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [credentials.email]);
						const user = rows[0] as MySQLUser;

						if (user && user.password && (await bcrypt.compare(credentials.password, user.password))) {
							return {
								id: user.userId,
								name: user.name,
								username: user.username || null,
								email: user.email,
								image: user.image || null,
							};
						} else {
							throw new Error('Invalid email or password');
						}
					} else {
						throw new Error('Credentials are undefined');
					}
				} catch (error) {
					console.error('Error during credentials sign-in:', error);
					return null;
				} finally {
					connection.end();
				}
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account, profile }: { user: User | AdapterUser; account: Account | null; profile?: Profile }) {
			console.log('Sign in callback');
			console.log(user);

			const connection = await connectMySQL();
			try {
				const username = (profile as Profile & { login?: string })?.login || profile?.name?.replaceAll('|', '') || null;
				const image = user.image || null;
				const provider = account?.provider || null;
				const name = (profile as Profile & { login?: string })?.login ? null : profile?.name || null;
				const verified = account?.provider === 'google' || account?.provider === 'github' ? true : false;

				const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [user.email]);

				if (rows.length == 0) {
					await connection.execute('INSERT INTO users (email, username, image, provider, name, verified) VALUES (?, ?, ?, ?, ?, ?)', [user.email, username, image, provider, name, verified]);
				}

				return Promise.resolve(true);
			} catch (error) {
				console.error('Error during sign-in:', error);
				return Promise.resolve(false);
			} finally {
				connection.end();
			}
		},

		async session({ session, token, user }: { session: Session; token: JWT; user: AdapterUser }): Promise<Session> {
			if (session && session.user) {
				const connection = await connectMySQL();
				try {
					const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute('SELECT * FROM users WHERE email = ?', [session.user.email]);
					const existingUser = rows[0];

					if (existingUser) {
						const newSession: Session = {
							...session,
							user: { ...session.user, username: existingUser.username, bio: existingUser.bio, birthday: existingUser.birthday, nameDisplay: existingUser.nameDisplay },
						};
						return newSession;
					}
				} catch (error) {
					console.error('Error during session creation:', error);
				} finally {
					connection.end();
				}
			}
			return session;
		},
	},
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);

export const GET = authHandler;
export const POST = authHandler;

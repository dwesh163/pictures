import { uniqueIndex, pgTable, serial, varchar, integer, date } from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
	'users',
	{
		userId: serial('userId').primaryKey(),
		email: varchar('email', { length: 50 }).notNull(),
		username: varchar('username', { length: 50 }).notNull(),
		image: varchar('image', { length: 255 }).notNull(),
		provider: varchar('provider', { length: 30 }).notNull(),
		name: varchar('name', { length: 150 }).notNull(),
	},
	(users) => {
		return {
			emailIndex: uniqueIndex('email_idx').on(users.email),
		};
	}
);

export const playlistsTable = pgTable('playlists', {
	playlistId: serial('playlistId').primaryKey(),
	publicId: varchar('publicId', { length: 100 }),
	name: varchar('name', { length: 100 }).notNull(),
	userId: integer('userId')
		.references(() => usersTable.userId)
		.notNull(),
});

export const playlistTracksTable = pgTable(
	'playlist_tracks',
	{
		playlistId: integer('playlistId')
			.references(() => playlistsTable.playlistId)
			.notNull(),
		trackId: varchar('trackId').notNull(),
		date: date('date').notNull(),
	},
	(playlistTracks) => {
		return {
			compositePK: (playlistTracks.playlistId, playlistTracks.trackId),
		};
	}
);

export type MyPlaylist = typeof playlistsTable.$inferSelect;

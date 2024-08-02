// types.ts

export type UserProfileData = {
	username: string | null | undefined;
	email: string | null | undefined;
	bio: string | null | undefined;
};

export type UserAccountData = {
	name: string | null | undefined;
	birthday: Date | null | undefined;
	nameDisplay: boolean | null | undefined;
};

export type UserData = {
	username?: string | null | undefined;
	email?: string | null | undefined;
	bio?: string | null | undefined;
	name?: string | null | undefined;
	birthday?: string | null | undefined;
	nameDisplay?: boolean | null | undefined;
	accreditationId?: number | null | undefined;
};

export type AccredUser = {
	userId: number;
	name: string;
	email: string;
	image: string;
	accreditationId: number;
};

export type UsersData = {
	userId: number;
	name: string;
	email: string;
	image: string;
	username: string;
	verified: number;
};

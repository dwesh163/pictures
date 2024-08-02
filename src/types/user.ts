// types.ts

export type UserProfileData = {
	username: string | null | undefined;
	email: string | null | undefined;
	bio: string | null | undefined;
};

export type UserAccountData = {
	name: string | null | undefined;
	birthday: string | null | undefined;
	nameDisplay: boolean | null | undefined;
};

export type UserData = {
	username?: string | null | undefined;
	email?: string | null | undefined;
	bio?: string | null | undefined;
	name?: string | null | undefined;
	birthday?: string | null | undefined;
	nameDisplay?: boolean | null | undefined;
};

export type AccredUser = {
	name: string;
	email: string;
	image: string;
	accreditationId: number;
};

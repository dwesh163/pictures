export type Gallery = {
	galleryId: number;
	userName: string;
	galleryName: string | undefined | null;
	description: string | undefined | null;
	createdAt: string | undefined | null;
	updatedAt: string | undefined | null;
	public: boolean | undefined | null;
	published: boolean | undefined | null;
	publicId: string;
	coverText: string | undefined | null;
	coverFont: string | undefined | null;
	images: { userId: number; imageId: number; imageUrl: string }[] | null;
	coverImage: any;
	accredited_users: { name: string; email: string; image: string; accreditationId: number }[] | null;
	tags: { id: number; name: string }[] | null;
};

export type Image = {
	imageId: number;
	userId: number;
	imageUrl: string;
};

export type Tags = {
	id: number;
	name: string;
};

export type Gallery = {
	galleryId: number;
	userId: number;
	galleryName: string | undefined | null;
	description: string | undefined | null;
	createdAt: string | undefined | null;
	updatedAt: string | undefined | null;
	public: boolean | undefined | null;
	published: boolean | undefined | null;
	publicId: string | undefined | null;
	coverText: string | undefined | null;
	coverFont: string | undefined | null;
	images: { userId: number; imageId: number; imageUrl: string }[] | null;
	coverImage: any;
	accredited_users: { name: string; email: string; image: string; accreditationId: number }[] | null;
};

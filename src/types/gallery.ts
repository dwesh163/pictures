export type Gallery = {
	gallery: Tag[];
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
	images:
		| {
				tags: any;
				userId: number;
				imageId: number;
				imageUrl: string;
		  }[]
		| null;
	coverImages: string[] | null;
	accredited_users: { name: string; email: string; image: string; accreditationId: number }[] | null;
	tags: Tag[];
};

export type Image = {
	imageId: number;
	userId: number;
	imageUrl: string;
	tags: Tag[];
};

export type Tag = {
	id: number;
	name: string;
	cover: string;
};

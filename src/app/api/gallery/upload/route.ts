import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { checkIfUserIsAuthorized } from '@/lib/users';
import { saveImage } from '@/lib/galleries';

const ensureDirectoryExists = async (dir: string) => {
	try {
		await fs.stat(dir);
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			await fs.mkdir(dir, { recursive: true });
		} else {
			throw error;
		}
	}
};

export async function POST(req: Request, res: Response) {
	try {
		const formData = await req.formData();
		const files = formData.getAll('media') as File[];
		const galleryId = formData.get('galleryId') as string;
		const tags = JSON.parse(formData.get('tags')) as string[];

		if (!galleryId) {
			return NextResponse.json({ error: 'Gallery ID is required' }, { status: 400 });
		}

		if (!files.length) {
			return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
		}

		const session = await getServerSession({ req, res, ...authOptions });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const email = session.user.email as string;
		if (!(await checkIfUserIsAuthorized(galleryId, email))) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const maxFiles = parseInt(process.env.MAX_FILES || '0', 10);
		if (files.length > maxFiles) {
			return NextResponse.json({ error: `Maximum ${process.env.MAX_FILES} files allowed` }, { status: 400 });
		}

		const maxTotalSize = parseInt(process.env.MAX_TOTAL_SIZE || '0', 10);
		const totalSize = files.reduce((sum, file) => sum + file.size, 0);

		if (totalSize > maxTotalSize) {
			return NextResponse.json({ error: `Total file size exceeds ${process.env.MAX_TOTAL_SIZE} bytes` }, { status: 400 });
		}

		const uploadDir = path.join(process.env.ROOT_DIR || process.cwd(), 'uploads');
		await ensureDirectoryExists(uploadDir);

		const filePromises = files.map(async (file) => {
			const buffer = Buffer.from(await file.arrayBuffer());

			const fileExtension = mime.getExtension(file.type) || 'bin';
			const filename = `${uuidv4()}.${fileExtension}`;
			const filePath = path.join(uploadDir, filename);

			try {
				await saveImage(filename, email, galleryId, tags, { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified });

				await fs.writeFile(filePath, buffer);
				return filePath;
			} catch (err) {
				console.error('Error saving file:', err);
				return null;
			}
		});

		const filePaths = await Promise.all(filePromises);

		return NextResponse.json({ success: 'Files uploaded successfully', filePaths });
	} catch (err) {
		console.error('Error:', err);
		return NextResponse.json({ error: 'Server Side Error!' }, { status: 500 });
	}
}

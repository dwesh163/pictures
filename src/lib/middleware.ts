import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(process.env.ROOT_DIR || process.cwd(), '/uploads');
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = uuidv4();
		const ext = path.extname(file.originalname);
		const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
		cb(null, filename);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 1024 * 1024 * 128 }, // 128MB
});

export { upload };

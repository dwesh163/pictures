// src/lib/parse-form.ts
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, stat } from 'fs/promises';
import path from 'path';
import { NextApiRequest } from 'next';

export const parseForm = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
	return new Promise(async (resolve, reject) => {
		// Répertoire de téléchargement
		const uploadDir = path.join(process.env.ROOT_DIR || process.cwd(), '/uploads');

		// Créer le répertoire si nécessaire
		try {
			await stat(uploadDir);
		} catch (e: any) {
			if (e.code === 'ENOENT') {
				await mkdir(uploadDir, { recursive: true });
			} else {
				console.error(e);
				reject(e);
				return;
			}
		}

		// Configuration de formidable
		const form = new formidable.IncomingForm({
			uploadDir,
			keepExtensions: true,
			maxFileSize: 1024 * 1024 * 128, // 128MB
			filename: (name, ext, part) => {
				// Générer un UUID pour le nom du fichier
				const uniqueName = `${uuidv4()}${ext}`;
				return uniqueName;
			},
		});

		// Analyser la requête
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(err);
			} else {
				resolve({ fields, files });
			}
		});
	});
};

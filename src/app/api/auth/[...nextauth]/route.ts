import { NextApiRequest, NextApiResponse } from 'next';
import { authHandler } from '@/lib/next-auth';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
	return authHandler(req, res);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
	return authHandler(req, res);
}

import { ConnectionOptions } from 'mysql2/promise';

interface DBConfig extends ConnectionOptions {
	host: string;
	user: string;
	password: string;
	database: string;
	port?: number;
}

if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
	throw new Error('Missing necessary environment variables for database connection');
}

export const dbConfig: DBConfig = {
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
};

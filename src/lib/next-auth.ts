import mysql, { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';

async function connectMySQL() {
    try {
      const connection = await mysql.createConnection(dbConfig);
      return connection;
    } catch (error) {
      console.error('Error connecting to MySQL:', error);
      throw error;
    }
  }

export async function getInfoSession(session: any): Promise<any> {

    const connection = await connectMySQL();
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [session.user.email]
      );

    connection.end();      

      return rows[0];

}

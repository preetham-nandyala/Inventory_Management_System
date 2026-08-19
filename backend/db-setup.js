import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
    try {
        console.log('Connecting to MySQL to setup database...');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('Creating database if not exists...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'inventory_db'}`);

        await connection.query(`USE ${process.env.DB_NAME || 'inventory_db'}`);

        console.log('Reading database.sql...');
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        const queries = sqlScript.split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0 && !query.startsWith('--'));

        console.log('Executing table creation and seeding queries...');
        for (let query of queries) {
            await connection.query(query);
        }

        console.log('Database setup completed successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Failed to setup database:', error);
        process.exit(1);
    }
};

setupDatabase();

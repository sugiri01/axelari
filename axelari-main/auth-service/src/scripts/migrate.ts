import { query } from '../db';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
    try {
        console.log('Starting migration...');
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema SQL...');
        await query(schemaSql);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();

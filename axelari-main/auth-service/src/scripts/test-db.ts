import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Log URL masking password
        const res = await query('SELECT NOW()');
        console.log('Connected successfully:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Connection error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        process.exit(1);
    }
})();

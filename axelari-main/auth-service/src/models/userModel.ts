import { query } from '../db';

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
}

export const createUser = async (name: string, email: string, passwordHash: string): Promise<User> => {
    const text = 'INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING *';
    const values = [name, email, passwordHash];
    const res = await query(text, values);
    return res.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const text = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const res = await query(text, values);
    return res.rows.length ? res.rows[0] : null;
};

export const findUserById = async (id: number): Promise<User | null> => {
    const text = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    const res = await query(text, values);
    return res.rows.length ? res.rows[0] : null;
};

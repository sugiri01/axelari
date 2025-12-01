import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../models/userModel';

const generateToken = (userId: number) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: '30m',
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await createUser(name, email, passwordHash);
        const token = generateToken(user.id);

        res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.json({
            user: { id: user.id, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        next(error);
    }
};

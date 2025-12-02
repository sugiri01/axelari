import axios from 'axios';

const AUTH_BASE = 'http://localhost:3000';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_BASE}/auth/login`, { email, password });
    return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${AUTH_BASE}/auth/register`, { name, email, password });
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const token = localStorage.getItem('token');
    const response = await axios.get<User>(`${AUTH_BASE}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

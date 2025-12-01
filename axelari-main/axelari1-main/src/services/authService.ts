import api from './api';

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
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
};

import api from './api';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role?: string;
}

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
    // Placeholder for future implementation
    // const response = await api.get<UserProfile>(`/users/${userId}`);
    // return response.data;
    return {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
    };
};

export const updateUserProfile = async (userId: number, data: Partial<UserProfile>): Promise<UserProfile> => {
    // Placeholder
    return {
        id: userId,
        name: data.name || 'Test User',
        email: 'test@example.com',
        role: 'student',
    };
};

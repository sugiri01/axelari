import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, login as loginApi, register as registerApi, getMe } from '../services/authService';
import { getOrCreateStudentProfile } from '../services/profileService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const decoded: any = jwtDecode(storedToken);
                    const currentTime = Date.now() / 1000;
                    if (decoded.exp < currentTime) {
                        console.warn('Token expired');
                        logout();
                    } else {
                        setToken(storedToken);
                        const userData = await getMe();
                        setUser(userData);
                    }
                } catch (error) {
                    console.error('Failed to restore session', error);
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginApi(email, password);
        localStorage.setItem('token', data.token);

        // Store user info
        localStorage.setItem('userId', data.user.id.toString());
        localStorage.setItem('userRole', 'student'); // Default to student for now

        // Extract user_id from token
        const decoded: any = jwtDecode(data.token);
        const userId = decoded.id;

        // Get or create student profile
        try {
            const studentProfile = await getOrCreateStudentProfile(userId, email, data.user.name);
            localStorage.setItem('student_id', studentProfile.id);
        } catch (error) {
            console.error('Failed to get/create student profile', error);
        }

        setToken(data.token);
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const data = await registerApi(name, email, password);
        localStorage.setItem('token', data.token);

        // Store user info
        localStorage.setItem('userId', data.user.id.toString());
        localStorage.setItem('userRole', 'student'); // Default to student for now

        // Extract user_id from token
        const decoded: any = jwtDecode(data.token);
        const userId = decoded.id;

        // Get or create student profile
        try {
            const studentProfile = await getOrCreateStudentProfile(userId, email, name);
            localStorage.setItem('student_id', studentProfile.id);
        } catch (error) {
            console.error('Failed to get/create student profile', error);
        }

        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('student_id');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

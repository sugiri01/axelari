import api from './api';

export interface Quiz {
    id: number;
    title: string;
    questions: any[];
}

export const getQuizzes = async (): Promise<Quiz[]> => {
    // Placeholder
    return [];
};

export const getQuizById = async (id: number): Promise<Quiz | null> => {
    // Placeholder
    return null;
};

export const submitQuiz = async (quizId: number, answers: any): Promise<any> => {
    // Placeholder
    return { score: 100 };
};

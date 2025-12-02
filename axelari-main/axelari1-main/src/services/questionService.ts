import { httpGet } from './httpClient';
import { FASTAPI_BASE } from './api';

export interface SelectQuestionRequest {
    topic_id: string;
    difficulty: number;
    student_id: string;
    exclude_ids: string[];
}

export interface Question {
    id: string;
    topic_id: string;
    question_text: string;
    question_type: string;
    options: any[];
    correct_answer: string;
    explanation: string;
    difficulty: number;
    bloom_level: number;
    estimated_time_seconds: number;
}

export const selectQuestion = async (
    request: SelectQuestionRequest
): Promise<Question> => {
    const params = new URLSearchParams({
        topic_id: request.topic_id,
        difficulty: request.difficulty.toString(),
        student_id: request.student_id,
        exclude_ids: request.exclude_ids.join(',')
    });

    return httpGet(`${FASTAPI_BASE}/questions/select?${params}`);
};

export const getQuestionById = async (questionId: string): Promise<Question> => {
    return httpGet(`${FASTAPI_BASE}/questions/${questionId}`);
};

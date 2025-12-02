import { httpGet, httpPost } from './httpClient';
import { FASTAPI_BASE } from './api';

export interface GeneratePathRequest {
    student_id: string;
    grade: number;
    subject: string;
}

export interface LearningPath {
    id: string;
    student_id: string;
    current_topic_id: string;
    current_difficulty: number;
    topic_queue: string[];
    review_schedule: any[];
    updated_at: string;
}

export interface NextTopicResponse {
    topic_id: string;
    difficulty: number;
    reason: string;
}

export const generatePath = async (
    request: GeneratePathRequest
): Promise<LearningPath> => {
    return httpPost(`${FASTAPI_BASE}/learning-path/generate`, request);
};

export const getNextTopic = async (studentId: string): Promise<NextTopicResponse> => {
    return httpGet(`${FASTAPI_BASE}/learning-path/next-topic/${studentId}`);
};

export const scheduleReviews = async (studentId: string): Promise<void> => {
    return httpPost(`${FASTAPI_BASE}/learning-path/schedule-reviews/${studentId}`, {});
};

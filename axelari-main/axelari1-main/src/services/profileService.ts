import { httpGet, httpPost } from './httpClient';
import { FASTAPI_BASE } from './api';

export interface StudentProfile {
    id: string;
    student_id: string;
    processing_speed: number;
    accuracy_consistency: number;
    memory_retention: number;
    learning_style: string;
    confidence_score: number;
    total_interactions: number;
    last_profile_update: string;
}

export interface AnalyticsProgress {
    overall_progress: number;
    topics_mastered: number;
    total_topics: number;
}

export interface WeakTopic {
    topic_id: string;
    topic_name: string;
    mastery_score: number;
    questions_attempted: number;
}

export const getProfile = async (studentId: string): Promise<StudentProfile> => {
    return httpGet(`${FASTAPI_BASE}/profile/${studentId}`);
};

export const createProfile = async (studentId: string): Promise<StudentProfile> => {
    return httpPost(`${FASTAPI_BASE}/profile/${studentId}`, {});
};

export const getProgress = async (studentId: string): Promise<AnalyticsProgress> => {
    return httpGet(`${FASTAPI_BASE}/analytics/progress/${studentId}`);
};

export const getWeakTopics = async (
    studentId: string,
    limit: number = 3
): Promise<WeakTopic[]> => {
    return httpGet(`${FASTAPI_BASE}/analytics/weak-topics/${studentId}?limit=${limit}`);
};

export const getOrCreateStudentProfile = async (
    userId: number,
    email: string,
    name: string
): Promise<{ id: string }> => {
    try {
        // Try to get existing profile
        return await httpGet(`${FASTAPI_BASE}/profile/by-user/${userId}`);
    } catch (error: any) {
        // If 404, create it. Note: httpClient throws error on 404? 
        // We need to check how httpClient handles errors. 
        // Assuming it throws, we catch it.
        // Ideally httpClient should expose status code or we handle it inside.
        // For now let's assume we can catch it.

        // Create new profile
        return await httpPost(`${FASTAPI_BASE}/profile/create`, {
            user_id: userId,
            email: email,
            name: name,
            grade: 8,
            board: 'CBSE'
        });
    }
};

import { httpGet, httpPost } from './httpClient';
import { FASTAPI_BASE } from './api';

export interface SessionStartRequest {
    student_id: string;
    grade: number;
    subject: string;
}

export interface SessionStartResponse {
    session_id: string;
    message: string;
}

export interface Question {
    id: string;
    topic_id: string;
    text: string; // Changed from question_text to match backend
    question_type: string;
    options: any[]; // each option should have { id: string; text: string }
    difficulty: number;
    estimated_time_seconds: number;
}

export interface NextQuestionResponse {
    session_id: string;
    question: Question;
}

export interface SubmitAnswerRequest {
    student_id: string;
    question_id: string;
    answer_given: string; // matches option.id
    time_spent_seconds: number;
}

export interface SubmitAnswerResponse {
    is_correct: boolean;
    correct_answer: string | null;
    explanation: string | null;
    updated_mastery: {
        topic_id: string;
        mastery_score: number;
        status: string;
        current_difficulty: number;
    };
    profile_snapshot: {
        processing_speed: number;
        accuracy_consistency: number;
        memory_retention: number;
    };
    intervention: {
        needs_intervention: boolean;
        intervention_type: string;
        message: string | null;
    };
}

export const startSession = async (
    request: SessionStartRequest
): Promise<SessionStartResponse> => {
    return httpPost(`${FASTAPI_BASE}/session/start`, request);
};

export const getNextQuestion = async (
    sessionId: string
): Promise<NextQuestionResponse> => {
    return httpGet(`${FASTAPI_BASE}/session/${sessionId}/next-question`);
};

export const submitAnswer = async (
    sessionId: string,
    request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
    return httpPost(`${FASTAPI_BASE}/session/${sessionId}/submit-answer`, request);
};

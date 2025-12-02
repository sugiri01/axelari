# Frontend-Backend Integration Analysis
## Axelari Phase 2 - 8-Week FastAPI Backend Integration

**Date:** December 01, 2025  
**Purpose:** Identify gaps between current Supabase-based frontend and new FastAPI backend specification

---

## EXECUTIVE SUMMARY

The current frontend is built for **Supabase** (PostgreSQL + Edge Functions + Auth), but the backend spec requires a **single FastAPI application**. This requires significant architectural changes across authentication, API endpoints, data fetching, and state management.

### Critical Changes Required:
1. **Authentication System** - Complete replacement from Supabase Auth to FastAPI JWT
2. **API Layer** - All 25+ API endpoints need rewriting
3. **Session Management** - From Supabase Edge Functions to FastAPI session orchestration
4. **Database Schema** - Alignment between Supabase tables and FastAPI models
5. **Real-time Features** - Adaptation from Supabase realtime to HTTP polling/WebSockets

---

## SECTION 1: AUTHENTICATION ARCHITECTURE

### Current Frontend (Supabase-based)
**Location:** `src/services/authService.ts`, `src/context/AuthContext.tsx`

```typescript
// Current Implementation
import { supabase } from './supabase';

export const login = async (email: string, password: string) => {
  const data = await loginApi(email, password);
  localStorage.setItem('token', data.token);
};

// Uses: Supabase Auth with JWT stored in localStorage
```

### Required Backend (FastAPI)
**Specification:** Phase 1 Node/Express auth service validates JWT, passes student_id

### ❌ GAPS IDENTIFIED:

1. **Auth Service URLs**
   - **Current:** Points to `http://localhost:3000` (Node.js auth microservice from Phase 1)
   - **Required:** Should point to FastAPI backend
   - **File:** `src/services/api.ts` line 3-4

2. **Token Management**
   - **Current:** JWT from Supabase Auth
   - **Required:** JWT from FastAPI (or Phase 1 Node service)
   - **Action:** No change needed IF Phase 1 auth service continues to handle authentication

3. **User Profile Structure**
   - **Current:** Supabase `profiles` table with role field
   - **Required:** FastAPI `students` table + `student_profiles` table
   - **Impact:** Need to map user.id → student_id for all API calls

### ✅ REQUIRED CHANGES:

```typescript
// FILE: src/services/api.ts
// CHANGE: Update base URL to FastAPI backend
const api = axios.create({
    baseURL: process.env.VITE_FASTAPI_URL || 'http://localhost:8000',  // ← CHANGE THIS
    headers: {
        'Content-Type': 'application/json',
    },
});

// KEEP: JWT interceptor (works with FastAPI)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);
```

```typescript
// FILE: src/context/AuthContext.tsx
// ADD: Student ID extraction after login
const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    
    // NEW: Get student_id from token or profile endpoint
    const studentProfile = await getStudentProfile();  // ← ADD THIS
    localStorage.setItem('student_id', studentProfile.id);
    
    setToken(data.token);
    setUser(data.user);
};
```

---

## SECTION 2: SESSION MANAGEMENT & QUIZ FLOW

### Current Frontend (Supabase Edge Functions)
**Components:**
- `EnhancedQuizEngine.tsx` - Calls Supabase Edge Function `adaptive-questions`
- `dcaSystem.ts` - Wrapper for Edge Functions

```typescript
// Current: Supabase Edge Functions
const result = await fetch(
  `${SUPABASE_URL}/functions/v1/adaptive-questions?topic_id=${topicId}`,
  { headers: { 'Authorization': `Bearer ${supabaseToken}` }}
);
```

### Required Backend (FastAPI Session Orchestration)
**Specification:** 
- `POST /api/v1/session/start` - Create session
- `GET /api/v1/session/{session_id}/next-question` - Get next question
- `POST /api/v1/session/{session_id}/submit-answer` - Submit answer

### ❌ CRITICAL GAPS:

1. **No Session Initialization**
   - Frontend currently fetches questions directly
   - Backend requires explicit session creation via `POST /session/start`

2. **Different Data Flow**
   - **Current:** `loadQuestions()` → `adaptive-questions` Edge Function → Questions array
   - **Required:** `startSession()` → `session_id` → `getNextQuestion(session_id)` → Single question

3. **Answer Submission**
   - **Current:** Updates Supabase tables directly
   - **Required:** Must use `POST /session/{session_id}/submit-answer` endpoint

4. **State Management**
   - **Current:** Questions array held in component state
   - **Required:** Backend maintains session state in Redis, frontend requests one question at a time

### ✅ REQUIRED CHANGES:

```typescript
// FILE: src/services/sessionService.ts (NEW FILE)
import api from './api';

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
  question_text: string;
  question_type: string;
  options: any[];
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
  answer_given: string;
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

// Start a new session
export const startSession = async (
  request: SessionStartRequest
): Promise<SessionStartResponse> => {
  const response = await api.post<SessionStartResponse>(
    '/api/v1/session/start',
    request
  );
  return response.data;
};

// Get next question in session
export const getNextQuestion = async (
  sessionId: string
): Promise<NextQuestionResponse> => {
  const response = await api.get<NextQuestionResponse>(
    `/api/v1/session/${sessionId}/next-question`
  );
  return response.data;
};

// Submit answer for current question
export const submitAnswer = async (
  sessionId: string,
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
  const response = await api.post<SubmitAnswerResponse>(
    `/api/v1/session/${sessionId}/submit-answer`,
    request
  );
  return response.data;
};
```

```typescript
// FILE: src/components/EnhancedQuizEngine.tsx
// REPLACE ENTIRE COMPONENT LOGIC

import React, { useState, useEffect } from 'react';
import { startSession, getNextQuestion, submitAnswer, Question } from '../services/sessionService';

export function EnhancedQuizEngine() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const studentId = localStorage.getItem('student_id');
      if (!studentId) {
        throw new Error('Student ID not found');
      }

      // Start new session
      const sessionResponse = await startSession({
        student_id: studentId,
        grade: 8,
        subject: 'Mathematics'
      });

      setSessionId(sessionResponse.session_id);

      // Get first question
      const questionResponse = await getNextQuestion(sessionResponse.session_id);
      setCurrentQuestion(questionResponse.question);
      setQuestionStartTime(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !currentQuestion || !selectedAnswer) return;

    try {
      setLoading(true);
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      // Submit answer to backend
      const result = await submitAnswer(sessionId, {
        student_id: localStorage.getItem('student_id')!,
        question_id: currentQuestion.id,
        answer_given: selectedAnswer,
        time_spent_seconds: timeSpent
      });

      // Show feedback
      setFeedback(result);

      // Wait 3 seconds, then load next question
      setTimeout(async () => {
        setFeedback(null);
        setSelectedAnswer(null);
        
        // Get next question
        const nextQuestion = await getNextQuestion(sessionId);
        setCurrentQuestion(nextQuestion.question);
        setQuestionStartTime(Date.now());
        setLoading(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      setLoading(false);
    }
  };

  // Rest of component render logic...
}
```

---

## SECTION 3: STUDENT PROFILE & DASHBOARD

### Current Frontend (Supabase Direct Queries)
**Component:** `DynamicStudentDashboard.tsx`

```typescript
// Current: Direct Supabase queries
const { data: metrics } = await supabase
  .from('performance_metrics')
  .select('topics_mastered, accuracy, streak_days, speed')
  .eq('student_id', userId)
  .order('date', { ascending: false })
  .limit(1)
  .maybeSingle();
```

### Required Backend (FastAPI Profile API)
**Specification:**
- `GET /api/v1/profile/{student_id}` - Get profile
- `POST /api/v1/profile/{student_id}` - Create profile
- `PUT /api/v1/profile/{student_id}` - Update profile

### ❌ GAPS:

1. **Direct Database Access**
   - Frontend queries Supabase tables directly
   - Backend requires all data access through FastAPI endpoints

2. **Profile Structure Mismatch**
   - **Current:** `performance_metrics` table with aggregated stats
   - **Required:** `student_profiles` table with cognitive dimensions

3. **Analytics Calculation**
   - **Current:** Aggregated in Supabase Edge Functions
   - **Required:** Must use FastAPI `/api/v1/analytics/*` endpoints

### ✅ REQUIRED CHANGES:

```typescript
// FILE: src/services/profileService.ts (NEW FILE)
import api from './api';

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

// Get student profile
export const getProfile = async (studentId: string): Promise<StudentProfile> => {
  const response = await api.get<StudentProfile>(
    `/api/v1/profile/${studentId}`
  );
  return response.data;
};

// Create initial profile
export const createProfile = async (studentId: string): Promise<StudentProfile> => {
  const response = await api.post<StudentProfile>(
    `/api/v1/profile/${studentId}`
  );
  return response.data;
};

// Get overall progress analytics
export const getProgress = async (studentId: string): Promise<AnalyticsProgress> => {
  const response = await api.get<AnalyticsProgress>(
    `/api/v1/analytics/progress/${studentId}`
  );
  return response.data;
};

// Get weak topics
export const getWeakTopics = async (
  studentId: string, 
  limit: number = 3
): Promise<WeakTopic[]> => {
  const response = await api.get<WeakTopic[]>(
    `/api/v1/analytics/weak-topics/${studentId}?limit=${limit}`
  );
  return response.data;
};
```

```typescript
// FILE: src/components/DynamicStudentDashboard.tsx
// REPLACE data fetching logic

import { getProfile, getProgress, getWeakTopics } from '../services/profileService';

export function DynamicStudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<AnalyticsProgress | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId = localStorage.getItem('student_id');
      if (!studentId) throw new Error('No student ID');

      // Parallel API calls
      const [profileData, progressData, weakTopicsData] = await Promise.all([
        getProfile(studentId),
        getProgress(studentId),
        getWeakTopics(studentId, 3)
      ]);

      setProfile(profileData);
      setProgress(progressData);
      setWeakTopics(weakTopicsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  // Render metrics from profile and progress data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Topics Mastered" 
          value={progress?.topics_mastered || 0}
          icon={<Award />}
        />
        <MetricCard 
          title="Processing Speed" 
          value={profile?.processing_speed || 50}
          icon={<Zap />}
        />
        {/* ... more metrics */}
      </div>
    </div>
  );
}
```

---

## SECTION 4: LEARNING PATH & ADAPTIVE LOGIC

### Current Frontend (Supabase Edge Function)
**File:** `src/lib/alpEngine.ts`

```typescript
// Current: Calls Supabase Edge Function
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/calculate-alp`,
  { method: 'POST', headers: { 'Authorization': token }}
);
```

### Required Backend (FastAPI ALP Module)
**Specification:**
- `POST /api/v1/learning-path/generate` - Generate initial path
- `GET /api/v1/learning-path/next-topic/{student_id}` - Get next topic
- `POST /api/v1/learning-path/schedule-reviews/{student_id}` - Schedule reviews

### ❌ GAPS:

1. **Path Generation**
   - Frontend doesn't call path generation on first login
   - Backend requires explicit `POST /learning-path/generate` call

2. **Next Topic Logic**
   - **Current:** Calculated in Edge Function
   - **Required:** Must use FastAPI `/learning-path/next-topic` endpoint

### ✅ REQUIRED CHANGES:

```typescript
// FILE: src/services/learningPathService.ts (NEW FILE)
import api from './api';

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
}

export interface NextTopicResponse {
  topic_id: string;
  difficulty: number;
  reason: string;
}

// Generate initial learning path
export const generatePath = async (
  request: GeneratePathRequest
): Promise<LearningPath> => {
  const response = await api.post<LearningPath>(
    '/api/v1/learning-path/generate',
    request
  );
  return response.data;
};

// Get next recommended topic
export const getNextTopic = async (studentId: string): Promise<NextTopicResponse> => {
  const response = await api.get<NextTopicResponse>(
    `/api/v1/learning-path/next-topic/${studentId}`
  );
  return response.data;
};

// Schedule spaced repetition reviews
export const scheduleReviews = async (studentId: string): Promise<void> => {
  await api.post(`/api/v1/learning-path/schedule-reviews/${studentId}`);
};
```

---

## SECTION 5: QUESTION MANAGEMENT

### Current Frontend (Direct Supabase Queries)
```typescript
// Current: Direct table access
const { data: questions } = await supabase
  .from('questions')
  .select('*')
  .eq('topic_id', topicId);
```

### Required Backend (FastAPI Question API)
**Specification:**
- `GET /api/v1/questions/select` - Select next question
- `GET /api/v1/questions/{question_id}` - Get specific question
- `POST /api/v1/questions/submit-answer` - Submit answer (use session endpoint instead)

### ❌ GAPS:

1. **Question Selection**
   - Frontend selects questions randomly from array
   - Backend provides algorithmic selection via `/questions/select`

2. **Exclusion Logic**
   - Current: No exclusion of recently seen questions
   - Required: Backend excludes last 20 questions

### ✅ REQUIRED CHANGES:

```typescript
// FILE: src/services/questionService.ts (NEW FILE)
import api from './api';

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

// Select next question (alternative to session flow)
export const selectQuestion = async (
  request: SelectQuestionRequest
): Promise<Question> => {
  const params = new URLSearchParams({
    topic_id: request.topic_id,
    difficulty: request.difficulty.toString(),
    student_id: request.student_id,
    exclude_ids: request.exclude_ids.join(',')
  });

  const response = await api.get<Question>(
    `/api/v1/questions/select?${params}`
  );
  return response.data;
};

// Get specific question by ID
export const getQuestionById = async (questionId: string): Promise<Question> => {
  const response = await api.get<Question>(
    `/api/v1/questions/${questionId}`
  );
  return response.data;
};
```

---

## SECTION 6: DATABASE SCHEMA ALIGNMENT

### Frontend Supabase Tables vs Backend FastAPI Models

| Supabase Table | FastAPI Table | Compatibility | Action Required |
|---|---|---|---|
| `profiles` | `students` | ⚠️ Partial | Map role field, add grade/board |
| `cognitive_assessments` | `student_profiles` | ❌ Mismatch | Flatten 8 dimensions to 3 core dimensions |
| `performance_metrics` | `pattern_metrics` | ⚠️ Different | Use analytics endpoints instead |
| `student_progress` | `mastery_state` | ✅ Compatible | Minor field name changes |
| `quiz_sessions` | N/A (Redis) | ❌ No equivalent | Session state in Redis, not DB |
| `questions` | `questions` | ✅ Compatible | Identical schema |
| `topics` | `topics` | ✅ Compatible | Identical schema |
| `learning_paths` | `learning_paths` | ✅ Compatible | Topic queue stored as JSONB |

### ✅ REQUIRED SCHEMA MAPPING:

```typescript
// FILE: src/types/models.ts (NEW FILE)

// Map Supabase profile to FastAPI student
export interface FastAPIStudent {
  id: string;
  email: string;
  name: string;
  grade: number;
  board: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

// Map cognitive assessment to student profile
export interface FastAPIStudentProfile {
  id: string;
  student_id: string;
  processing_speed: number;        // Aggregate of kinesthetic + speed metrics
  accuracy_consistency: number;    // Aggregate of logical + accuracy metrics
  memory_retention: number;        // Aggregate of verbal + retention metrics
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  confidence_score: number;
  total_interactions: number;
  last_profile_update: string;
}

// Mapping function
export function mapCognitiveToProfile(assessment: CognitiveAssessment): Partial<FastAPIStudentProfile> {
  return {
    processing_speed: Math.round((assessment.kinesthetic + 50) / 2),
    accuracy_consistency: Math.round((assessment.logical + 50) / 2),
    memory_retention: Math.round((assessment.verbal + 50) / 2),
    learning_style: assessment.visual > 60 ? 'visual' : 
                    assessment.kinesthetic > 60 ? 'kinesthetic' : 'reading',
    confidence_score: 0.3
  };
}
```

---

## SECTION 7: TEACHER & PARENT DASHBOARDS

### Current Frontend
- `DynamicTeacherDashboard.tsx` - Queries `class_assignments` + `student_progress`
- `DynamicParentDashboard.tsx` - Queries `parent_child_links` + `performance_metrics`

### Required Backend
**Specification:** Backend spec focuses on single student adaptive learning (Grade 8, Mathematics only). Teacher/Parent features are **OUT OF SCOPE for 8-week implementation**.

### ❌ CRITICAL GAP:

**Teacher and Parent dashboards will NOT work** with Phase 2 backend because:
1. No multi-student APIs in FastAPI spec
2. No class management endpoints
3. No parent-child linking
4. Focus is only on individual student adaptive learning

### ✅ RECOMMENDATION:

**Option 1: Keep Supabase for Multi-User Features (Hybrid Approach)**
- Use FastAPI for core adaptive learning (student quiz flow)
- Keep Supabase for teacher/parent dashboards
- Requires maintaining two databases

**Option 2: Disable Teacher/Parent Features in Phase 2**
- Hide teacher and parent role options during registration
- Only allow student role
- Add teacher/parent features in Phase 3

**Option 3: Add Teacher/Parent APIs to FastAPI Spec (Scope Expansion)**
- Design and implement teacher analytics endpoints
- Design parent-child relationship endpoints
- **Adds 2-3 weeks to timeline**

---

## SECTION 8: AI TUTOR INTEGRATION

### Current Frontend
**Component:** `AIPanel.tsx` - Calls Supabase Edge Function `ai-tutor-chat`

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/ai-tutor-chat`,
  { 
    method: 'POST',
    body: JSON.stringify({ message, context })
  }
);
```

### Required Backend
**Specification:** Backend spec does NOT include AI tutor functionality. This is a frontend-only feature.

### ✅ NO CHANGES REQUIRED

AI Tutor can remain as Supabase Edge Function or be migrated to separate microservice. It's independent of the adaptive learning backend.

---

## SECTION 9: IMPLEMENTATION PRIORITY & TIMELINE

### Phase 2A: Critical Path (Week 1-2)
**Priority: CRITICAL** - App won't function without these

1. ✅ Update `api.ts` base URL to FastAPI
2. ✅ Create `sessionService.ts` with session endpoints
3. ✅ Create `profileService.ts` with profile/analytics endpoints
4. ✅ Refactor `EnhancedQuizEngine.tsx` to use session flow
5. ✅ Refactor `DynamicStudentDashboard.tsx` to use FastAPI endpoints
6. ✅ Add student_id extraction and storage after login

**AI Coding Instructions:**
```
1. Update src/services/api.ts line 3 to point to FastAPI URL
2. Create src/services/sessionService.ts with startSession, getNextQuestion, submitAnswer functions
3. Create src/services/profileService.ts with getProfile, getProgress, getWeakTopics functions
4. Refactor src/components/EnhancedQuizEngine.tsx to use session-based flow instead of question array
5. Refactor src/components/DynamicStudentDashboard.tsx to use profileService instead of Supabase queries
6. Update src/context/AuthContext.tsx to extract and store student_id after login
```

### Phase 2B: Learning Path Integration (Week 3-4)
**Priority: HIGH** - Adaptive learning won't work properly without these

1. ✅ Create `learningPathService.ts` with path generation endpoints
2. ✅ Add path generation call on first student login
3. ✅ Create `questionService.ts` for standalone question selection
4. ✅ Update `LearningPath.tsx` component to use FastAPI data

**AI Coding Instructions:**
```
1. Create src/services/learningPathService.ts with generatePath, getNextTopic, scheduleReviews
2. Update src/context/AuthContext.tsx to call generatePath on first student login
3. Create src/services/questionService.ts with selectQuestion and getQuestionById
4. Update src/components/LearningPath.tsx to fetch data from learningPathService
```

### Phase 2C: Analytics & Progress Tracking (Week 5-6)
**Priority: MEDIUM** - Enhances user experience

1. ✅ Create `analyticsService.ts` for snapshot generation
2. ✅ Create `patternService.ts` for mastery calculations
3. ✅ Update `StudentAnalytics.tsx` to use FastAPI analytics
4. ✅ Add intervention checking in quiz flow

**AI Coding Instructions:**
```
1. Create src/services/analyticsService.ts with generateSnapshot endpoint
2. Create src/services/patternService.ts with getMastery, getPatterns endpoints
3. Update src/components/StudentAnalytics.tsx to use analyticsService
4. Add intervention checking in EnhancedQuizEngine after answer submission
```

### Phase 2D: Teacher/Parent Decision (Week 7-8)
**Priority: LOW** - Optional based on scope decision

**Option A: Disable Features**
```
1. Hide teacher and parent role options in Register.tsx
2. Add "Coming in Phase 3" message in role selection
3. Redirect existing teacher/parent users to student dashboard
```

**Option B: Keep Hybrid (Supabase + FastAPI)**
```
1. Keep teacher/parent components unchanged
2. Document dual-database architecture
3. Add data sync job between Supabase and FastAPI
```

---

## SECTION 10: ENVIRONMENT VARIABLES

### Current Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Required Frontend (.env)
```env
# Phase 1 Auth Service (if keeping separate)
VITE_AUTH_URL=http://localhost:3000

# Phase 2 FastAPI Backend
VITE_FASTAPI_URL=http://localhost:8000

# Supabase (optional, for AI Tutor only)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/axelari
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

---

## SECTION 11: FILE STRUCTURE CHANGES

### New Files to Create
```
src/
  services/
    sessionService.ts          ← NEW
    profileService.ts          ← NEW  
    learningPathService.ts     ← NEW
    questionService.ts         ← NEW
    analyticsService.ts        ← NEW
    patternService.ts          ← NEW
  types/
    models.ts                  ← NEW (type definitions)
    requests.ts                ← NEW (API request types)
    responses.ts               ← NEW (API response types)
```

### Files to Modify
```
src/
  services/
    api.ts                     ← UPDATE base URL
    authService.ts             ← UPDATE to handle student_id
  context/
    AuthContext.tsx            ← UPDATE to store student_id
  components/
    EnhancedQuizEngine.tsx     ← REFACTOR to session-based
    DynamicStudentDashboard.tsx ← REFACTOR to use FastAPI
    LearningPath.tsx           ← UPDATE to use learningPathService
    StudentAnalytics.tsx       ← UPDATE to use analyticsService
```

### Files to Potentially Remove (if disabling features)
```
src/
  components/
    DynamicTeacherDashboard.tsx   ← REMOVE if disabling teacher features
    DynamicParentDashboard.tsx    ← REMOVE if disabling parent features
    ContentCreator.tsx            ← REMOVE if disabling teacher features
  lib/
    dcaSystem.ts                  ← REMOVE (replaced by sessionService)
    alpEngine.ts                  ← REMOVE (replaced by learningPathService)
```

---

## SECTION 12: TESTING CHECKLIST

### Unit Tests Required
- [ ] sessionService.ts - Mock API responses
- [ ] profileService.ts - Mock analytics data
- [ ] learningPathService.ts - Mock path generation
- [ ] questionService.ts - Mock question selection

### Integration Tests Required
- [ ] Complete quiz flow: start → question → answer → next question
- [ ] Profile creation and update
- [ ] Learning path generation on first login
- [ ] Analytics calculation and display

### E2E Tests Required
- [ ] New user registration → onboarding → first quiz
- [ ] Returning user login → dashboard → continue quiz
- [ ] Complete quiz session → see updated analytics
- [ ] Mastery level increase → difficulty adjustment

---

## SECTION 13: BACKEND API ENDPOINT CHECKLIST

AI Assistant must ensure backend implements these exact endpoints:

### Session Management
- [ ] `POST /api/v1/session/start`
  - Request: `{ student_id, grade, subject }`
  - Response: `{ session_id, message }`
  
- [ ] `GET /api/v1/session/{session_id}/next-question`
  - Response: `{ session_id, question: {...} }`
  
- [ ] `POST /api/v1/session/{session_id}/submit-answer`
  - Request: `{ student_id, question_id, answer_given, time_spent_seconds }`
  - Response: `{ is_correct, correct_answer, explanation, updated_mastery, profile_snapshot, intervention }`

### Student Profile
- [ ] `POST /api/v1/profile/{student_id}` - Create initial profile
- [ ] `GET /api/v1/profile/{student_id}` - Get profile
- [ ] `PUT /api/v1/profile/{student_id}` - Update profile

### Learning Path
- [ ] `POST /api/v1/learning-path/generate`
  - Request: `{ student_id, grade, subject }`
  - Response: `{ id, student_id, current_topic_id, ... }`
  
- [ ] `GET /api/v1/learning-path/next-topic/{student_id}`
  - Response: `{ topic_id, difficulty, reason }`
  
- [ ] `POST /api/v1/learning-path/schedule-reviews/{student_id}`

### Question Management
- [ ] `GET /api/v1/questions/select`
  - Query params: `topic_id, difficulty, student_id, exclude_ids`
  - Response: `{ id, question_text, options, ... }`
  
- [ ] `GET /api/v1/questions/{question_id}`

### Analytics
- [ ] `GET /api/v1/analytics/progress/{student_id}`
  - Response: `{ overall_progress, topics_mastered, total_topics }`
  
- [ ] `GET /api/v1/analytics/weak-topics/{student_id}?limit=3`
  - Response: `[{ topic_id, topic_name, mastery_score, questions_attempted }]`
  
- [ ] `POST /api/v1/analytics/snapshot/{student_id}`

### Pattern Recognition
- [ ] `GET /api/v1/patterns/mastery/{student_id}/{topic_id}`
- [ ] `POST /api/v1/patterns/analyze-session`

### DCA (Dynamic Content Adaptation)
- [ ] `POST /api/v1/adaptation/adjust-difficulty`
- [ ] `POST /api/v1/adaptation/check-intervention`
- [ ] `POST /api/v1/adaptation/schedule-review`

---

## SECTION 14: DATA MIGRATION STRATEGY

### Current Data in Supabase
- User profiles with cognitive assessments
- 60+ questions across 10 topics
- Student progress records
- Quiz session history
- Achievement data

### Migration to FastAPI/PostgreSQL

**Option 1: Fresh Start (Recommended for Phase 2)**
- Start with empty FastAPI database
- Seed only essential data:
  - Grade 8 Mathematics topics
  - 30-50 questions per topic
  - No user data migration
- Users create new accounts

**Option 2: Partial Migration**
- Export questions from Supabase
- Import into FastAPI PostgreSQL
- Migrate user emails (but reset profiles)
- Lose historical data

**Option 3: Full Migration** ⚠️ Complex
- Export all Supabase tables
- Transform schema to match FastAPI models
- Import with ID preservation
- Requires custom migration scripts
- High risk of data corruption

### ✅ RECOMMENDATION: Option 1 (Fresh Start)

**Rationale:**
1. Phase 2 is MVP for Grade 8 Math only
2. Current user base is likely small
3. Avoids complex schema transformation
4. Cleaner implementation
5. Users can re-register easily

---

## SECTION 15: DEPLOYMENT CONSIDERATIONS

### Current Deployment (Supabase)
- Frontend: Auto-deployed on Vercel/Netlify
- Backend: Supabase managed
- Database: Supabase PostgreSQL
- Auth: Supabase Auth

### Required Deployment (FastAPI)
- Frontend: Same (Vercel/Netlify)
- Backend: Docker container (Render/Fly.io/EC2)
- Database: Managed PostgreSQL (Neon/Supabase)
- Cache: Managed Redis (Upstash/Redis Cloud)
- Auth: Phase 1 Node service OR integrated into FastAPI

### Deployment Architecture

```
┌─────────────┐
│  Frontend   │ (Vercel)
│  React/Vite │
└─────┬───────┘
      │ HTTPS
      ↓
┌─────────────┐
│   FastAPI   │ (Docker on Render)
│   Backend   │
└──┬────┬─────┘
   │    │
   ↓    ↓
┌──────┐  ┌──────┐
│ Neon │  │Redis │
│  PG  │  │Cloud │
└──────┘  └──────┘
```

### Environment-Specific URLs

**Development:**
```
Frontend: http://localhost:5173
FastAPI: http://localhost:8000
PostgreSQL: localhost:5432
Redis: localhost:6379
```

**Production:**
```
Frontend: https://axelari.app
FastAPI: https://api.axelari.app
PostgreSQL: managed-db-url
Redis: managed-redis-url
```

---

## SECTION 16: RISK ASSESSMENT

### High Risk
1. **Session State Management** ⚠️
   - Frontend expects question arrays
   - Backend provides one question at a time
   - **Mitigation:** Thorough testing of session flow

2. **Data Loss** ⚠️
   - Current Supabase data won't migrate easily
   - **Mitigation:** Export critical question bank before migration

3. **Authentication Complexity** ⚠️
   - Two auth systems (Phase 1 Node + FastAPI)
   - **Mitigation:** Clear documentation of auth flow

### Medium Risk
1. **Performance Degradation**
   - More API calls with session-based approach
   - **Mitigation:** Redis caching, optimize queries

2. **Teacher/Parent Feature Loss**
   - May need to disable if not in backend scope
   - **Mitigation:** Communicate scope early to stakeholders

### Low Risk
1. **AI Tutor Integration**
   - Remains independent
   - **Mitigation:** No changes needed

2. **Frontend UI/UX**
   - No visual changes required
   - **Mitigation:** Only backend integration changes

---

## SECTION 17: SUCCESS CRITERIA

### Phase 2A Complete (Week 2)
- [ ] Student can register and login
- [ ] Student profile created on first login
- [ ] Quiz session starts successfully
- [ ] Questions load one at a time
- [ ] Answers submitted and feedback received
- [ ] Dashboard shows real-time metrics

### Phase 2B Complete (Week 4)
- [ ] Learning path generated on first login
- [ ] Difficulty adjusts based on performance
- [ ] Topic progression works correctly
- [ ] Mastery levels update after each session

### Phase 2C Complete (Week 6)
- [ ] Analytics dashboard shows accurate data
- [ ] Weak topics identified correctly
- [ ] Performance trends visible
- [ ] Interventions trigger appropriately

### Phase 2D Complete (Week 8)
- [ ] All 30+ API endpoints functional
- [ ] Frontend fully migrated from Supabase
- [ ] Test coverage >70%
- [ ] Production deployment successful
- [ ] Documentation complete

---

## SECTION 18: NEXT STEPS FOR AI ASSISTANT

### Immediate Actions (Week 1)

1. **Create Service Layer Files**
   ```bash
   # Create new service files
   touch src/services/sessionService.ts
   touch src/services/profileService.ts
   touch src/services/learningPathService.ts
   touch src/services/questionService.ts
   touch src/services/analyticsService.ts
   
   # Create type definition files
   touch src/types/models.ts
   touch src/types/requests.ts
   touch src/types/responses.ts
   ```

2. **Update API Configuration**
   - Modify `src/services/api.ts` to point to FastAPI URL
   - Add environment variable for VITE_FASTAPI_URL
   - Test connection to FastAPI backend

3. **Refactor Quiz Engine**
   - Backup current `EnhancedQuizEngine.tsx`
   - Implement session-based flow
   - Test with mock data first
   - Integrate with real backend

4. **Update Authentication Flow**
   - Add student_id extraction after login
   - Store in localStorage
   - Use in all subsequent API calls

5. **Refactor Dashboard**
   - Replace Supabase queries with FastAPI calls
   - Test data loading
   - Verify metrics display correctly

### Testing Approach

1. **Mock Backend First**
   - Create mock responses matching FastAPI spec
   - Test frontend components independently
   - Validate data flow

2. **Integration Testing**
   - Connect to local FastAPI instance
   - Test complete user flows
   - Verify session management

3. **E2E Testing**
   - Full registration → quiz → results flow
   - Performance testing under load
   - Error handling validation

### Documentation Required

1. **API Integration Guide**
   - Document all service functions
   - Provide usage examples
   - List error codes

2. **Migration Guide**
   - Steps to move from Supabase to FastAPI
   - Data migration procedures
   - Rollback plans

3. **Deployment Guide**
   - Environment setup
   - Configuration management
   - Monitoring setup

---

## APPENDIX A: COMPLETE API ENDPOINT MAP

| Frontend Need | Current Supabase | Required FastAPI | Priority |
|---|---|---|---|
| Start quiz | Direct query | `POST /session/start` | CRITICAL |
| Get question | Edge function | `GET /session/{id}/next-question` | CRITICAL |
| Submit answer | Edge function | `POST /session/{id}/submit-answer` | CRITICAL |
| Get profile | Direct query | `GET /profile/{id}` | HIGH |
| Create profile | Direct query | `POST /profile/{id}` | HIGH |
| Get progress | Supabase query | `GET /analytics/progress/{id}` | HIGH |
| Get weak topics | Supabase query | `GET /analytics/weak-topics/{id}` | MEDIUM |
| Generate path | Edge function | `POST /learning-path/generate` | HIGH |
| Get next topic | Edge function | `GET /learning-path/next-topic/{id}` | MEDIUM |
| Select question | Direct query | `GET /questions/select` | MEDIUM |
| Get mastery | Calculated | `GET /patterns/mastery/{sid}/{tid}` | MEDIUM |
| Check intervention | N/A | `POST /adaptation/check-intervention` | LOW |
| Adjust difficulty | Calculated | `POST /adaptation/adjust-difficulty` | LOW |

---

## APPENDIX B: EXAMPLE API CALL TRANSFORMATIONS

### Before (Supabase)
```typescript
// Load questions for quiz
const { data: questions } = await supabase
  .from('questions')
  .select('*')
  .eq('topic_id', topicId)
  .eq('difficulty', 'medium')
  .limit(10);

// Load all at once, store in state
setQuestions(questions);
```

### After (FastAPI)
```typescript
// Start session
const { session_id } = await startSession({
  student_id: studentId,
  grade: 8,
  subject: 'Mathematics'
});

// Get first question
const { question } = await getNextQuestion(session_id);
setCurrentQuestion(question);

// After answer, get next question
const feedback = await submitAnswer(session_id, {
  question_id: question.id,
  answer_given: 'B',
  time_spent_seconds: 45
});

// Get next question
const { question: nextQuestion } = await getNextQuestion(session_id);
```

---

## APPENDIX C: COMPONENT DEPENDENCY GRAPH

```
App.tsx
├── AuthContext.tsx (MODIFY - add student_id)
│   └── authService.ts (MODIFY - extract student_id)
│       └── api.ts (MODIFY - change base URL)
│
├── Dashboard.tsx
│   ├── DynamicStudentDashboard.tsx (REFACTOR)
│   │   ├── profileService.ts (NEW)
│   │   └── analyticsService.ts (NEW)
│   │
│   ├── EnhancedQuizEngine.tsx (REFACTOR)
│   │   └── sessionService.ts (NEW)
│   │
│   ├── LearningPath.tsx (MODIFY)
│   │   └── learningPathService.ts (NEW)
│   │
│   └── StudentAnalytics.tsx (MODIFY)
│       └── analyticsService.ts (NEW)
│
└── (Optional: Keep for hybrid approach)
    ├── DynamicTeacherDashboard.tsx
    └── DynamicParentDashboard.tsx
```

---

## CONCLUSION

This document provides a comprehensive blueprint for integrating the FastAPI backend with the existing React frontend. The AI assistant should follow the implementation priority order and create the exact service files specified with the endpoint definitions provided.

**Total Estimated Effort:**
- Phase 2A (Critical): 1-2 weeks
- Phase 2B (High Priority): 1-2 weeks  
- Phase 2C (Medium Priority): 1-2 weeks
- Phase 2D (Optional): 1 week

**Recommendation:** Focus on Phase 2A first to get core functionality working, then proceed with other phases based on business priorities.

---

**Document Version:** 1.0  
**Last Updated:** December 01, 2025  
**Status:** Ready for Implementation

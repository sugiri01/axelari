# AI Assistant Action Plan
## FastAPI Backend Integration - Step-by-Step Implementation Guide

**Target:** Migrate React frontend from Supabase to FastAPI backend  
**Timeline:** 8 weeks  
**Scope:** Grade 8 Mathematics adaptive learning only

---

## QUICK START CHECKLIST

### Week 1-2: Core Session Management (CRITICAL)

#### Step 1: Update API Base Configuration
**File:** `src/services/api.ts`

```typescript
// CHANGE LINE 3-4 FROM:
const api = axios.create({
    baseURL: 'http://localhost:3000', // Auth service URL

// TO:
const api = axios.create({
    baseURL: process.env.VITE_FASTAPI_URL || 'http://localhost:8000',
```

**Add to `.env` file:**
```env
VITE_FASTAPI_URL=http://localhost:8000
```

---

#### Step 2: Create Session Service
**Create new file:** `src/services/sessionService.ts`

```typescript
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

export const startSession = async (
  request: SessionStartRequest
): Promise<SessionStartResponse> => {
  const response = await api.post<SessionStartResponse>(
    '/api/v1/session/start',
    request
  );
  return response.data;
};

export const getNextQuestion = async (
  sessionId: string
): Promise<NextQuestionResponse> => {
  const response = await api.get<NextQuestionResponse>(
    `/api/v1/session/${sessionId}/next-question`
  );
  return response.data;
};

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

---

#### Step 3: Update Auth Context
**File:** `src/context/AuthContext.tsx`

Add student_id extraction after login:

```typescript
const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    
    // NEW: Extract and store student_id
    // Option 1: If student_id is in JWT token
    const decoded: any = jwtDecode(data.token);
    const studentId = decoded.student_id || decoded.sub;
    localStorage.setItem('student_id', studentId);
    
    // Option 2: If backend provides it separately
    // const studentId = data.user.id;
    // localStorage.setItem('student_id', studentId);
    
    setToken(data.token);
    setUser(data.user);
};

const register = async (name: string, email: string, password: string) => {
    const data = await registerApi(name, email, password);
    localStorage.setItem('token', data.token);
    
    // NEW: Extract and store student_id
    const decoded: any = jwtDecode(data.token);
    const studentId = decoded.student_id || decoded.sub;
    localStorage.setItem('student_id', studentId);
    
    setToken(data.token);
    setUser(data.user);
};
```

---

#### Step 4: Refactor Quiz Engine Component
**File:** `src/components/EnhancedQuizEngine.tsx`

**REPLACE ENTIRE COMPONENT** with session-based flow:

```typescript
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react';
import { startSession, getNextQuestion, submitAnswer, Question } from '../services/sessionService';

export function EnhancedQuizEngine() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const studentId = localStorage.getItem('student_id');
      if (!studentId) {
        console.error('No student ID found');
        setLoading(false);
        return;
      }

      console.log('Starting session for student:', studentId);

      // Start new session
      const sessionResponse = await startSession({
        student_id: studentId,
        grade: 8,
        subject: 'Mathematics'
      });

      console.log('Session started:', sessionResponse);
      setSessionId(sessionResponse.session_id);

      // Get first question
      const questionResponse = await getNextQuestion(sessionResponse.session_id);
      console.log('First question loaded:', questionResponse);
      
      setCurrentQuestion(questionResponse.question);
      setQuestionStartTime(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(answer);
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !currentQuestion || !selectedAnswer) return;

    try {
      setLoading(true);
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      console.log('Submitting answer:', {
        question_id: currentQuestion.id,
        answer: selectedAnswer,
        time: timeSpent
      });

      // Submit answer to backend
      const result = await submitAnswer(sessionId, {
        student_id: localStorage.getItem('student_id')!,
        question_id: currentQuestion.id,
        answer_given: selectedAnswer,
        time_spent_seconds: timeSpent
      });

      console.log('Answer result:', result);

      // Update score
      if (result.is_correct) {
        setScore(score + 10);
      }
      setQuestionsAnswered(questionsAnswered + 1);

      // Show feedback
      setFeedback(result);
      setShowFeedback(true);

      // Wait 3 seconds, then load next question
      setTimeout(async () => {
        try {
          setShowFeedback(false);
          setFeedback(null);
          setSelectedAnswer(null);
          
          // Get next question
          const nextQuestion = await getNextQuestion(sessionId);
          console.log('Next question loaded:', nextQuestion);
          
          setCurrentQuestion(nextQuestion.question);
          setQuestionStartTime(Date.now());
          setLoading(false);
        } catch (error) {
          console.error('Error loading next question:', error);
          setLoading(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      setLoading(false);
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2">Loading quiz...</span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No questions available. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Adaptive Quiz</h2>
            <p className="text-gray-600">Question {questionsAnswered + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-3xl font-bold text-indigo-600">{score}</p>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
            Difficulty: {currentQuestion.difficulty}/10
          </span>
        </div>

        <h3 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options && currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              } ${
                showFeedback && feedback?.is_correct && selectedAnswer === option
                  ? 'border-green-500 bg-green-50'
                  : showFeedback && !feedback?.is_correct && selectedAnswer === option
                  ? 'border-red-500 bg-red-50'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showFeedback && selectedAnswer === option && (
                  feedback?.is_correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && feedback && (
          <div className={`mt-6 p-4 rounded-lg ${
            feedback.is_correct ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className={`font-semibold ${
              feedback.is_correct ? 'text-green-800' : 'text-red-800'
            }`}>
              {feedback.is_correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {feedback.explanation && (
              <p className="mt-2 text-gray-700">{feedback.explanation}</p>
            )}
            {feedback.updated_mastery && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Mastery: {feedback.updated_mastery.mastery_score.toFixed(1)}%</p>
                <p>Status: {feedback.updated_mastery.status}</p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <button
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer || loading}
            className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

#### Step 5: Create Profile Service
**Create new file:** `src/services/profileService.ts`

```typescript
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

export const getProfile = async (studentId: string): Promise<StudentProfile> => {
  const response = await api.get<StudentProfile>(
    `/api/v1/profile/${studentId}`
  );
  return response.data;
};

export const createProfile = async (studentId: string): Promise<StudentProfile> => {
  const response = await api.post<StudentProfile>(
    `/api/v1/profile/${studentId}`
  );
  return response.data;
};

export const getProgress = async (studentId: string): Promise<AnalyticsProgress> => {
  const response = await api.get<AnalyticsProgress>(
    `/api/v1/analytics/progress/${studentId}`
  );
  return response.data;
};

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

---

#### Step 6: Refactor Student Dashboard
**File:** `src/components/DynamicStudentDashboard.tsx`

**REPLACE data fetching logic:**

```typescript
import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Award, Loader } from 'lucide-react';
import { getProfile, getProgress, getWeakTopics, StudentProfile, AnalyticsProgress, WeakTopic } from '../services/profileService';

export function DynamicStudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<AnalyticsProgress | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId = localStorage.getItem('student_id');
      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Loading dashboard for student:', studentId);

      // Parallel API calls for better performance
      const [profileData, progressData, weakTopicsData] = await Promise.all([
        getProfile(studentId).catch(err => {
          console.error('Profile error:', err);
          return null;
        }),
        getProgress(studentId).catch(err => {
          console.error('Progress error:', err);
          return null;
        }),
        getWeakTopics(studentId, 3).catch(err => {
          console.error('Weak topics error:', err);
          return [];
        })
      ]);

      console.log('Dashboard data loaded:', { profileData, progressData, weakTopicsData });

      setProfile(profileData);
      setProgress(progressData);
      setWeakTopics(weakTopicsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome Back!</h1>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Topics Mastered" 
          value={progress?.topics_mastered || 0}
          total={progress?.total_topics}
          icon={<Award className="h-6 w-6" />}
          color="indigo"
        />
        <MetricCard 
          title="Overall Progress" 
          value={`${progress?.overall_progress || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <MetricCard 
          title="Processing Speed" 
          value={profile?.processing_speed || 50}
          max={100}
          icon={<Zap className="h-6 w-6" />}
          color="yellow"
        />
        <MetricCard 
          title="Accuracy" 
          value={profile?.accuracy_consistency || 50}
          max={100}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Areas to Focus On</h2>
          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div key={topic.topic_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{topic.topic_name}</p>
                  <p className="text-sm text-gray-600">
                    {topic.questions_attempted} questions attempted
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {topic.mastery_score.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Mastery</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  total?: number;
  max?: number;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'yellow' | 'blue';
}

function MetricCard({ title, value, total, max, icon, color }: MetricCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600 text-sm">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">
        {value}
        {total && <span className="text-lg text-gray-600">/{total}</span>}
        {max && <span className="text-lg text-gray-600">/{max}</span>}
      </p>
    </div>
  );
}
```

---

### Week 3-4: Learning Path Integration

#### Step 7: Create Learning Path Service
**Create new file:** `src/services/learningPathService.ts`

```typescript
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
  const response = await api.post<LearningPath>(
    '/api/v1/learning-path/generate',
    request
  );
  return response.data;
};

export const getNextTopic = async (studentId: string): Promise<NextTopicResponse> => {
  const response = await api.get<NextTopicResponse>(
    `/api/v1/learning-path/next-topic/${studentId}`
  );
  return response.data;
};

export const scheduleReviews = async (studentId: string): Promise<void> => {
  await api.post(`/api/v1/learning-path/schedule-reviews/${studentId}`);
};
```

#### Step 8: Add Path Generation on First Login
**File:** `src/context/AuthContext.tsx`

Add to the login and register functions:

```typescript
const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    
    const decoded: any = jwtDecode(data.token);
    const studentId = decoded.student_id || decoded.sub;
    localStorage.setItem('student_id', studentId);
    
    // NEW: Check if learning path exists, create if not
    try {
      await generatePath({
        student_id: studentId,
        grade: 8,
        subject: 'Mathematics'
      });
    } catch (error) {
      // Path might already exist, that's okay
      console.log('Learning path already exists or error:', error);
    }
    
    setToken(data.token);
    setUser(data.user);
};
```

---

### Week 5-6: Analytics & Progress

#### Step 9: Create Analytics Service
**Create new file:** `src/services/analyticsService.ts`

```typescript
import api from './api';

export interface AnalyticsSnapshot {
  overall_progress: number;
  topics_mastered: number;
  total_questions_attempted: number;
  average_accuracy: number;
  current_streak_days: number;
  weak_topics: Array<{
    topic_id: string;
    topic_name: string;
    mastery_score: number;
  }>;
  snapshot_date: string;
}

export const generateSnapshot = async (studentId: string): Promise<AnalyticsSnapshot> => {
  const response = await api.post<AnalyticsSnapshot>(
    `/api/v1/analytics/snapshot/${studentId}`
  );
  return response.data;
};

export const getLatestSnapshot = async (studentId: string): Promise<AnalyticsSnapshot | null> => {
  try {
    const response = await api.get<AnalyticsSnapshot>(
      `/api/v1/analytics/snapshot/${studentId}/latest`
    );
    return response.data;
  } catch (error) {
    return null;
  }
};
```

---

### Week 7-8: Teacher/Parent Features (OPTIONAL)

#### Step 10: Decide on Multi-User Features

**Option A: Disable (Recommended)**
- Hide teacher and parent options in registration
- Add "Coming Soon" message
- Focus on student experience

**Option B: Keep Hybrid**
- Keep current Supabase-based teacher/parent dashboards
- Document dual-database setup
- No changes needed

---

## TESTING GUIDE

### Test Locally

1. **Start Backend:**
   ```bash
   cd backend
   docker-compose up
   ```

2. **Start Frontend:**
   ```bash
   cd axelari1-main
   npm run dev
   ```

3. **Test Flow:**
   - Register new student
   - Should see student_id in localStorage
   - Start quiz
   - Answer questions
   - See difficulty adjust
   - Check dashboard updates

### Debug Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] CORS enabled on backend
- [ ] JWT token present in requests
- [ ] student_id stored in localStorage
- [ ] Session starts successfully
- [ ] Questions load
- [ ] Answers submit
- [ ] Dashboard loads data

---

## COMMON ERRORS & SOLUTIONS

### Error: "No student ID found"
**Solution:** Check AuthContext is storing student_id after login

### Error: "Failed to start session"
**Solution:** Verify backend is running and VITE_FASTAPI_URL is correct

### Error: "Network request failed"
**Solution:** Check CORS is enabled on FastAPI backend

### Error: "Profile not found"
**Solution:** Ensure profile is created on first login (call createProfile if needed)

---

## BACKEND REQUIREMENTS

The AI assistant coding the backend MUST implement these endpoints:

### Session Endpoints (CRITICAL)
- `POST /api/v1/session/start`
- `GET /api/v1/session/{session_id}/next-question`
- `POST /api/v1/session/{session_id}/submit-answer`

### Profile Endpoints (HIGH PRIORITY)
- `POST /api/v1/profile/{student_id}`
- `GET /api/v1/profile/{student_id}`

### Analytics Endpoints (HIGH PRIORITY)
- `GET /api/v1/analytics/progress/{student_id}`
- `GET /api/v1/analytics/weak-topics/{student_id}`

### Learning Path Endpoints (MEDIUM PRIORITY)
- `POST /api/v1/learning-path/generate`
- `GET /api/v1/learning-path/next-topic/{student_id}`

---

## SUCCESS CRITERIA

### Week 2 Milestone
- [ ] Can register and login
- [ ] Student ID stored correctly
- [ ] Quiz session starts
- [ ] Questions display
- [ ] Answers submit
- [ ] Feedback shows

### Week 4 Milestone
- [ ] Difficulty adjusts dynamically
- [ ] Profile updates after quiz
- [ ] Dashboard shows real data
- [ ] Learning path generates

### Week 6 Milestone
- [ ] Analytics accurate
- [ ] Weak topics identified
- [ ] Progress tracking works
- [ ] All core features functional

---

## FINAL CHECKLIST

Before deploying to production:

- [ ] All service files created
- [ ] All components refactored
- [ ] Environment variables set
- [ ] Backend endpoints tested
- [ ] E2E test passes
- [ ] Performance acceptable (<2s page load)
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Documentation updated

---

**Document Status:** Ready for Implementation  
**Last Updated:** December 01, 2025

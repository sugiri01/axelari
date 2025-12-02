import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
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

        <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options && currentQuestion.options.map((option: any, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === option.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
                } ${showFeedback && feedback?.is_correct && selectedAnswer === option.id
                  ? 'border-green-500 bg-green-50'
                  : showFeedback && !feedback?.is_correct && selectedAnswer === option.id
                    ? 'border-red-500 bg-red-50'
                    : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <span>{typeof option === 'object' ? option.text : option}</span>
                {showFeedback && selectedAnswer === (typeof option === 'object' ? option.id : option) && (
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
          <div className={`mt-6 p-4 rounded-lg ${feedback.is_correct ? 'bg-green-50' : 'bg-red-50'
            }`}>
            <p className={`font-semibold ${feedback.is_correct ? 'text-green-800' : 'text-red-800'
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

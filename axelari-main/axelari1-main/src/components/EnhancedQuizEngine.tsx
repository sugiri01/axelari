import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, TrendingUp, Lightbulb, Trophy, Loader } from 'lucide-react';
import { getAdaptiveQuestions, updateProgress, Question } from '../lib/dcaSystem';
import { supabase } from '../lib/supabase';

export function EnhancedQuizEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [masteryLevel, setMasteryLevel] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);
  const [topicId, setTopicId] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (loading || quizComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quizComplete]);

  const loadQuestions = async () => {
    try {
      const { data: topics } = await supabase
        .from('topics')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!topics?.id) {
        setLoading(false);
        return;
      }

      setTopicId(topics.id);

      const result = await getAdaptiveQuestions(topics.id, 10);
      if (result) {
        setQuestions(result.questions);
        setDifficulty(result.difficulty);
        setMasteryLevel(result.mastery_level);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correct_answer;
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      const points = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5;
      setScore(score + points);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setQuizComplete(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    if (topicId) {
      const result = await updateProgress(
        topicId,
        accuracy,
        timeTaken,
        questions.length,
        difficulty
      );

      if (result?.achievement) {
        setAchievement(result.achievement);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 max-w-4xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading adaptive questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800">No questions available yet. Please add questions to the database.</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const grade = accuracy >= 90 ? 'A+' : accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : 'D';

    return (
      <div className="p-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600 mb-8">Great job completing the adaptive quiz</p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="p-6 bg-teal-50 rounded-xl">
              <div className="text-3xl font-bold text-teal-600 mb-1">{grade}</div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">{score}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
          </div>

          {achievement && (
            <div className="mb-8 p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white">
              <Trophy size={32} className="mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
              <p className="text-sm text-yellow-100">+{achievement.points} points earned!</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4C6EF5] text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              Try Another Quiz
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct_answer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const options = question.options || [];

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Adaptive Quiz</h1>
            <p className="text-gray-500">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} | Mastery: {masteryLevel}%</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span className="text-lg font-medium">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-[#4C6EF5] rounded-lg font-medium">
              {correctAnswers}/{currentQuestion + 1} | {score} pts
            </div>
          </div>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4C6EF5] to-[#2AC4A8] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
              question.difficulty === 'medium' ? 'bg-blue-50 text-blue-600' :
              'bg-orange-50 text-orange-600'
            }`}>
              {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1)}
            </span>
            {showFeedback && (
              <div className="ml-auto flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-sm font-medium text-green-600">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} className="text-red-500" />
                    <span className="text-sm font-medium text-red-600">Incorrect</span>
                  </>
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-medium text-gray-900 leading-relaxed">
            {question.question_text}
          </h2>

          {question.image_url && (
            <img src={question.image_url} alt="Question" className="mt-4 rounded-lg max-w-full" />
          )}
        </div>

        <div className="p-8">
          <div className="space-y-3 mb-6">
            {question.question_type === 'mcq' && options.map((option: any, index: number) => {
              const optionValue = typeof option === 'string' ? option : option.text;
              const isSelected = selectedAnswer === optionValue;
              const isCorrectOption = optionValue === question.correct_answer;
              const showCorrect = showFeedback && isCorrectOption;
              const showIncorrect = showFeedback && isSelected && !isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswer(optionValue)}
                  disabled={showFeedback}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    showCorrect ? 'border-green-500 bg-green-50' :
                    showIncorrect ? 'border-red-500 bg-red-50' :
                    isSelected ? 'border-[#4C6EF5] bg-blue-50' :
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                      showCorrect ? 'bg-green-500 text-white' :
                      showIncorrect ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-[#4C6EF5] text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`flex-1 font-medium ${
                      showCorrect || showIncorrect ? 'text-gray-900' :
                      isSelected ? 'text-gray-900' :
                      'text-gray-700'
                    }`}>
                      {optionValue}
                    </span>
                    {showCorrect && <CheckCircle size={24} className="text-green-500" />}
                    {showIncorrect && <XCircle size={24} className="text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <>
              {question.explanation && (
                <div className="mb-6 p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Lightbulb size={20} className="text-[#4C6EF5] mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Explanation</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={nextQuestion}
                className="w-full py-4 bg-[#4C6EF5] text-white font-medium rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {showFeedback && (
        <div className="mt-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} />
            <div>
              <h3 className="font-semibold mb-1">Difficulty Adapting</h3>
              <p className="text-sm text-blue-100">
                {isCorrect
                  ? "Great work! Questions will adapt to challenge you more."
                  : "No worries! We'll adjust the difficulty to help you learn better."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

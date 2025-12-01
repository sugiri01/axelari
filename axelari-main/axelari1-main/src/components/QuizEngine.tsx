import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, TrendingUp, Lightbulb } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function QuizEngine() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const questions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the derivative of f(x) = x² + 3x - 5?',
      options: ['2x + 3', 'x² + 3', '2x - 5', 'x + 3'],
      correctAnswer: 0,
      difficulty: 'medium',
    },
    {
      id: '2',
      question: 'Evaluate the limit: lim(x→0) (sin x)/x',
      options: ['0', '1', '∞', 'Does not exist'],
      correctAnswer: 1,
      difficulty: 'hard',
    },
  ];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Adaptive Quiz</h1>
            <p className="text-gray-500">Calculus - Derivatives</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span className="text-lg font-medium">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-[#4C6EF5] rounded-lg font-medium">
              {score}/{currentQuestion + 1}
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
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
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
            {question.question}
          </h2>
        </div>

        <div className="p-8">
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctAnswer;
              const showCorrect = showFeedback && isCorrectOption;
              const showIncorrect = showFeedback && isSelected && !isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswer(index)}
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
                      {option}
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
              <div className="mb-6 p-5 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-[#4C6EF5] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Explanation</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isCorrect
                        ? "Great job! You correctly applied the power rule and sum rule of differentiation."
                        : "The correct answer uses the power rule: d/dx(xⁿ) = nxⁿ⁻¹. For x², the derivative is 2x, and for 3x it's 3."}
                    </p>
                  </div>
                </div>
              </div>

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
                  ? "You're doing great! Next question will be slightly harder."
                  : "No worries! We'll adjust the difficulty to help you learn better."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

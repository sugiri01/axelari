import React, { useState } from 'react';
import { Brain, Eye, Hand, Calculator, MessageSquare, Users, User, Music, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
}

interface DimensionTest {
  dimension: string;
  name: string;
  icon: any;
  color: string;
  questions: TestQuestion[];
}

const dimensionTests: DimensionTest[] = [
  {
    dimension: 'visual',
    name: 'Visual Learning',
    icon: Eye,
    color: 'from-blue-500 to-blue-600',
    questions: [
      {
        id: 'v1',
        question: 'When learning something new, I prefer:',
        options: ['Watching videos or demonstrations', 'Reading instructions', 'Trying it hands-on', 'Discussing with others']
      },
      {
        id: 'v2',
        question: 'I remember information best when it is presented as:',
        options: ['Pictures, diagrams, or charts', 'Written words', 'Physical activities', 'Verbal explanations']
      }
    ]
  },
  {
    dimension: 'kinesthetic',
    name: 'Kinesthetic Learning',
    icon: Hand,
    color: 'from-green-500 to-green-600',
    questions: [
      {
        id: 'k1',
        question: 'I learn best when I can:',
        options: ['Do hands-on activities', 'See demonstrations', 'Read about it', 'Discuss it']
      },
      {
        id: 'k2',
        question: 'When solving problems, I tend to:',
        options: ['Use trial and error', 'Visualize the solution', 'Think it through logically', 'Talk it through']
      }
    ]
  },
  {
    dimension: 'logical',
    name: 'Logical-Mathematical',
    icon: Calculator,
    color: 'from-purple-500 to-purple-600',
    questions: [
      {
        id: 'l1',
        question: 'I enjoy activities that involve:',
        options: ['Numbers and patterns', 'Creative expression', 'Physical movement', 'Social interaction']
      },
      {
        id: 'l2',
        question: 'I am good at:',
        options: ['Analyzing data and reasoning', 'Creative arts', 'Sports and coordination', 'Understanding people']
      }
    ]
  },
  {
    dimension: 'verbal',
    name: 'Verbal-Linguistic',
    icon: MessageSquare,
    color: 'from-orange-500 to-orange-600',
    questions: [
      {
        id: 'vl1',
        question: 'I prefer to learn through:',
        options: ['Reading and writing', 'Pictures and videos', 'Doing activities', 'Group discussions']
      },
      {
        id: 'vl2',
        question: 'I am comfortable with:',
        options: ['Words and language', 'Numbers and logic', 'Physical tasks', 'Music and rhythm']
      }
    ]
  },
  {
    dimension: 'social',
    name: 'Interpersonal (Social)',
    icon: Users,
    color: 'from-pink-500 to-pink-600',
    questions: [
      {
        id: 's1',
        question: 'I prefer to study:',
        options: ['In groups', 'Alone', 'With a partner', 'Doesn\'t matter']
      },
      {
        id: 's2',
        question: 'I learn best when:',
        options: ['Working with others', 'Working independently', 'Competing with others', 'Teaching others']
      }
    ]
  },
  {
    dimension: 'solitary',
    name: 'Intrapersonal (Solitary)',
    icon: User,
    color: 'from-indigo-500 to-indigo-600',
    questions: [
      {
        id: 'so1',
        question: 'I am most productive when:',
        options: ['Working alone', 'Working in a team', 'Leading a group', 'Following instructions']
      },
      {
        id: 'so2',
        question: 'I prefer to:',
        options: ['Set my own goals', 'Work towards group goals', 'Follow established goals', 'Compete for goals']
      }
    ]
  },
  {
    dimension: 'musical',
    name: 'Musical Intelligence',
    icon: Music,
    color: 'from-yellow-500 to-yellow-600',
    questions: [
      {
        id: 'm1',
        question: 'When studying, I:',
        options: ['Like background music', 'Need complete silence', 'Don\'t notice sounds', 'Like nature sounds']
      },
      {
        id: 'm2',
        question: 'I can easily:',
        options: ['Remember melodies', 'Remember faces', 'Remember facts', 'Remember movements']
      }
    ]
  },
  {
    dimension: 'naturalistic',
    name: 'Naturalistic Intelligence',
    icon: Leaf,
    color: 'from-teal-500 to-teal-600',
    questions: [
      {
        id: 'n1',
        question: 'I enjoy:',
        options: ['Nature and outdoors', 'Technology and gadgets', 'Art and creativity', 'Social gatherings']
      },
      {
        id: 'n2',
        question: 'I notice:',
        options: ['Patterns in nature', 'Patterns in numbers', 'Patterns in behavior', 'Patterns in music']
      }
    ]
  }
];

export function PsychometricTest({ onComplete }: { onComplete: () => void }) {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dimension = dimensionTests[currentDimension];
  const question = dimension.questions[currentQuestion];
  const totalQuestions = dimensionTests.reduce((sum, d) => sum + d.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < dimension.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentDimension < dimensionTests.length - 1) {
        setCurrentDimension(currentDimension + 1);
        setCurrentQuestion(0);
      } else {
        submitResults(newAnswers);
      }
    }, 300);
  };

  const submitResults = async (finalAnswers: Record<string, number>) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scores: Record<string, number> = {};

      dimensionTests.forEach(dim => {
        let score = 0;
        let count = 0;

        dim.questions.forEach(q => {
          const answer = finalAnswers[q.id];
          if (answer !== undefined) {
            score += answer === 0 ? 100 : answer === 1 ? 66 : answer === 2 ? 33 : 0;
            count++;
          }
        });

        scores[dim.dimension] = count > 0 ? Math.round(score / count) : 50;
      });

      const { error } = await supabase
        .from('cognitive_assessments')
        .insert({
          student_id: user.id,
          visual: scores.visual || 50,
          kinesthetic: scores.kinesthetic || 50,
          logical: scores.logical || 50,
          verbal: scores.verbal || 50,
          social: scores.social || 50,
          solitary: scores.solitary || 50,
          musical: scores.musical || 50,
          naturalistic: scores.naturalistic || 50
        });

      if (error) throw error;

      await supabase
        .from('learning_paths')
        .insert({
          student_id: user.id,
          current_phase: 1,
          learning_speed: 'medium',
          cognitive_profile: scores
        });

      onComplete();
    } catch (error) {
      console.error('Error saving psychometric results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Profile...</h2>
          <p className="text-gray-600">Creating your personalized learning path</p>
        </div>
      </div>
    );
  }

  const Icon = dimension.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 mb-4">
            <Brain size={20} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Psychometric Assessment</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Your Learning Style</h1>
          <p className="text-gray-600">Help us understand how you learn best</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {answeredQuestions + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className={`p-6 bg-gradient-to-r ${dimension.color}`}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{dimension.name}</h2>
                <p className="text-sm text-white/80">Dimension {currentDimension + 1} of {dimensionTests.length}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-medium text-gray-900 mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center text-sm font-medium transition-all">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium text-gray-700 group-hover:text-gray-900">
                      {option}
                    </span>
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>There are no right or wrong answers. Choose what feels most natural to you.</p>
        </div>
      </div>
    </div>
  );
}

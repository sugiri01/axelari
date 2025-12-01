import React, { useState } from 'react';
import { GraduationCap, BookOpen, Target, Sparkles } from 'lucide-react';
import { PsychometricTest } from './PsychometricTest';
import { supabase } from '../lib/supabase';

type OnboardingStep = 'welcome' | 'profile' | 'psychometric' | 'complete';

interface ProfileData {
  board: string;
  grade: number;
  subjects: string[];
  goals: string[];
}

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [profileData, setProfileData] = useState<ProfileData>({
    board: 'CBSE',
    grade: 10,
    subjects: [],
    goals: []
  });

  const handleWelcomeNext = () => {
    setStep('profile');
  };

  const handleProfileSubmit = async () => {
    setStep('psychometric');
  };

  const handlePsychometricComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  if (step === 'psychometric') {
    return <PsychometricTest onComplete={handlePsychometricComplete} />;
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Set!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personalized learning path has been created based on your unique profile.
          </p>
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h1>
            <p className="text-gray-600">Help us customize your learning experience</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Board
              </label>
              <select
                value={profileData.board}
                onChange={(e) => setProfileData({ ...profileData, board: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="IGCSE">IGCSE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Grade
              </label>
              <select
                value={profileData.grade}
                onChange={(e) => setProfileData({ ...profileData, grade: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>Class {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subjects You Want to Focus On
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'].map(subject => {
                  const isSelected = profileData.subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        if (isSelected) {
                          setProfileData({
                            ...profileData,
                            subjects: profileData.subjects.filter(s => s !== subject)
                          });
                        } else {
                          setProfileData({
                            ...profileData,
                            subjects: [...profileData.subjects, subject]
                          });
                        }
                      }}
                      className={`p-3 rounded-xl border-2 font-medium transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Learning Goals
              </label>
              <div className="space-y-2">
                {[
                  'Improve exam scores',
                  'Build strong concepts',
                  'Competitive exam prep',
                  'Homework help'
                ].map(goal => {
                  const isSelected = profileData.goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => {
                        if (isSelected) {
                          setProfileData({
                            ...profileData,
                            goals: profileData.goals.filter(g => g !== goal)
                          });
                        } else {
                          setProfileData({
                            ...profileData,
                            goals: [...profileData.goals, goal]
                          });
                        }
                      }}
                      className={`w-full p-3 rounded-xl border-2 font-medium text-left transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleProfileSubmit}
            disabled={profileData.subjects.length === 0}
            className="w-full mt-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Axelari
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-Powered Adaptive Learning Platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Learning</h3>
            <p className="text-sm text-gray-600">
              Content adapted to your unique learning style and pace
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Adaptive Difficulty</h3>
            <p className="text-sm text-gray-600">
              Questions that challenge you at just the right level
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Tutor Support</h3>
            <p className="text-sm text-gray-600">
              Get instant help and explanations whenever you need
            </p>
          </div>
        </div>

        <button
          onClick={handleWelcomeNext}
          className="px-12 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all"
        >
          Get Started
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Takes about 5 minutes to set up your profile
        </p>
      </div>
    </div>
  );
}

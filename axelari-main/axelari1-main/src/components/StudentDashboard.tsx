import React from 'react';
import { TrendingUp, Target, Zap, Calendar, Award, Clock, ArrowRight, Flame } from 'lucide-react';

export function StudentDashboard() {
  const performanceStats = [
    { label: 'Topics Mastered', value: '24', change: '+3 this week', icon: Target, color: 'from-blue-500 to-blue-600' },
    { label: 'Accuracy', value: '87%', change: '+5% from last week', icon: TrendingUp, color: 'from-teal-500 to-teal-600' },
    { label: 'Learning Speed', value: 'Fast', change: 'Adaptive pace', icon: Zap, color: 'from-purple-500 to-purple-600' },
    { label: 'Streak', value: '12 days', change: 'Keep it up!', icon: Flame, color: 'from-orange-500 to-orange-600' },
  ];

  const strengths = [
    { topic: 'Algebra', mastery: 92, color: 'bg-green-500' },
    { topic: 'Geometry', mastery: 88, color: 'bg-green-400' },
    { topic: 'Trigonometry', mastery: 85, color: 'bg-blue-500' },
  ];

  const weaknesses = [
    { topic: 'Calculus', mastery: 45, color: 'bg-orange-400' },
    { topic: 'Statistics', mastery: 52, color: 'bg-yellow-500' },
  ];

  const upcomingTopics = [
    { title: 'Derivatives Introduction', time: '25 min', difficulty: 'Intermediate', status: 'recommended' },
    { title: 'Limits and Continuity', time: '30 min', difficulty: 'Advanced', status: 'next' },
    { title: 'Integration Basics', time: '35 min', difficulty: 'Intermediate', status: 'upcoming' },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back, Alex</h1>
        <p className="text-gray-500">Let's continue your learning journey</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {performanceStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Strengths</h2>
            <Award size={20} className="text-green-500" />
          </div>
          <div className="space-y-4">
            {strengths.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.topic}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.mastery}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Focus Areas</h2>
            <Target size={20} className="text-orange-500" />
          </div>
          <div className="space-y-4">
            {weaknesses.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.topic}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.mastery}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-[#4C6EF5] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
            Start Practice Session
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Learning Path</h2>
            <p className="text-sm text-gray-500">Personalized based on your performance</p>
          </div>
          <button className="text-[#4C6EF5] text-sm font-medium hover:text-blue-600 flex items-center gap-1">
            View full path
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingTopics.map((topic, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-[#4C6EF5] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  topic.status === 'recommended' ? 'bg-blue-50 text-blue-600' :
                  topic.status === 'next' ? 'bg-teal-50 text-teal-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  <BookIcon size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {topic.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      topic.difficulty === 'Advanced' ? 'bg-orange-50 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              {topic.status === 'recommended' && (
                <button className="px-5 py-2 bg-[#4C6EF5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                  Start Learning
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready for your weekly assessment?</h3>
            <p className="text-blue-100">Test your knowledge and track your progress</p>
          </div>
          <button className="px-6 py-3 bg-white text-[#4C6EF5] font-medium rounded-xl hover:shadow-lg transition-all">
            Take Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

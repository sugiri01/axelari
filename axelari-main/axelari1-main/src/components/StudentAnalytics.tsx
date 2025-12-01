import React from 'react';
import { TrendingUp, Target, Zap, Award, Calendar } from 'lucide-react';

export function StudentAnalytics() {
  const weeklyData = [
    { day: 'Mon', accuracy: 82, speed: 75, time: 45 },
    { day: 'Tue', accuracy: 85, speed: 78, time: 60 },
    { day: 'Wed', accuracy: 88, speed: 82, time: 55 },
    { day: 'Thu', accuracy: 87, speed: 80, time: 50 },
    { day: 'Fri', accuracy: 90, speed: 85, time: 65 },
    { day: 'Sat', accuracy: 89, speed: 83, time: 70 },
    { day: 'Sun', accuracy: 91, speed: 87, time: 45 },
  ];

  const topicMastery = [
    { topic: 'Algebra', mastery: 92, trend: 'up', problems: 245 },
    { topic: 'Geometry', mastery: 88, trend: 'up', problems: 198 },
    { topic: 'Trigonometry', mastery: 85, trend: 'stable', problems: 167 },
    { topic: 'Calculus', mastery: 67, trend: 'up', problems: 89 },
    { topic: 'Statistics', mastery: 52, trend: 'down', problems: 56 },
  ];

  const errorPatterns = [
    { type: 'Calculation Errors', count: 23, percentage: 35 },
    { type: 'Conceptual Mistakes', count: 18, percentage: 28 },
    { type: 'Time Management', count: 15, percentage: 23 },
    { type: 'Careless Errors', count: 9, percentage: 14 },
  ];

  const maxTime = Math.max(...weeklyData.map(d => d.time));

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Performance Analytics</h1>
        <p className="text-gray-500">Detailed insights into your learning journey</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">87%</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Average Accuracy</div>
          <div className="text-xs text-green-600">+5% from last week</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">82</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Speed Score</div>
          <div className="text-xs text-green-600">+7 points this week</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Award size={24} className="text-white" />
            </div>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">24</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Topics Mastered</div>
          <div className="text-xs text-gray-500">+3 this week</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">92%</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Consistency</div>
          <div className="text-xs text-green-600">Excellent streak!</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Performance</h2>

          <div className="space-y-6 mb-6">
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-[#4C6EF5] to-blue-400 rounded-t-lg transition-all hover:shadow-lg"
                        style={{ height: `${(day.time / maxTime) * 160}px` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">{day.time}m</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">6.5 hrs</div>
              <div className="text-sm text-gray-500">Total Study Time</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">755</div>
              <div className="text-sm text-gray-500">Problems Solved</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Accuracy vs Speed Trend</h2>

          <div className="space-y-4 mb-6">
            {weeklyData.slice(-5).map((day, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{day.day}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Acc: {day.accuracy}%</span>
                    <span className="text-xs text-gray-500">Spd: {day.speed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${day.accuracy}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500"
                      style={{ width: `${day.speed}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600">Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-xs text-gray-600">Speed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Topic Mastery Heatmap</h2>

          <div className="space-y-3">
            {topicMastery.map((item, idx) => (
              <div key={idx} className="group hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                    {item.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                    {item.trend === 'down' && <TrendingUp size={14} className="text-red-500 rotate-180" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{item.problems} problems</span>
                    <span className="text-sm font-semibold text-gray-900">{item.mastery}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.mastery >= 80 ? 'bg-green-500' :
                      item.mastery >= 60 ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Error Pattern Analysis</h2>

          <div className="space-y-4">
            {errorPatterns.map((error, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{error.type}</span>
                  <span className="text-sm text-gray-500">{error.count} errors</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center px-3"
                    style={{ width: `${error.percentage}%` }}
                  >
                    <span className="text-xs font-medium text-white">{error.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommendation</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Focus on reducing calculation errors through more practice problems. Consider using the AI tutor for concept clarification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

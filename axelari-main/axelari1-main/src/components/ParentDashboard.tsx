import React from 'react';
import { TrendingUp, Target, Calendar, Award, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export function ParentDashboard() {
  const weeklySummary = {
    timeSpent: '5.2 hours',
    topicsCompleted: 4,
    accuracy: 87,
    consistency: 92,
    examReadiness: 78,
    streak: 6,
  };

  const strengths = [
    { subject: 'Algebra', score: 92 },
    { subject: 'Geometry', score: 88 },
    { subject: 'Physics', score: 85 },
  ];

  const focusAreas = [
    { subject: 'Calculus', score: 45, recommendation: 'Additional practice needed' },
    { subject: 'Statistics', score: 52, recommendation: 'Review basic concepts' },
  ];

  const recentActivity = [
    { date: 'Today', activity: 'Completed Algebra quiz', score: '92%', type: 'success' },
    { date: 'Yesterday', activity: 'Practiced Calculus problems', score: '65%', type: 'warning' },
    { date: '2 days ago', activity: 'Watched Geometry lessons', duration: '45 min', type: 'info' },
  ];

  const upcomingTests = [
    { subject: 'Mathematics', date: 'Dec 15, 2025', readiness: 78 },
    { subject: 'Physics', date: 'Dec 20, 2025', readiness: 85 },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Alex's Progress Dashboard</h1>
        <p className="text-gray-500">Weekly summary and insights</p>
      </div>

      <div className="bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-8 text-white mb-10">
        <h2 className="text-2xl font-semibold mb-6">This Week's Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold mb-1">{weeklySummary.timeSpent}</div>
            <div className="text-blue-100 text-sm">Study Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{weeklySummary.topicsCompleted}</div>
            <div className="text-blue-100 text-sm">Topics Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{weeklySummary.accuracy}%</div>
            <div className="text-blue-100 text-sm">Average Accuracy</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
            <TrendingUp size={20} className="text-green-500" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Consistency Score</span>
                <span className="text-lg font-semibold text-gray-900">{weeklySummary.consistency}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${weeklySummary.consistency}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Excellent! Studying regularly</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Exam Readiness</span>
                <span className="text-lg font-semibold text-gray-900">{weeklySummary.examReadiness}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${weeklySummary.examReadiness}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Good progress, keep practicing</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{weeklySummary.streak} Day Streak</div>
                  <div className="text-sm text-gray-600">Keep the momentum going!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Tests</h2>
            <Calendar size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {upcomingTests.map((test, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-gray-100 hover:border-[#4C6EF5] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{test.subject}</h3>
                    <p className="text-sm text-gray-500">{test.date}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    test.readiness >= 80 ? 'bg-green-50 text-green-600' :
                    test.readiness >= 60 ? 'bg-blue-50 text-blue-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {test.readiness}% Ready
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      test.readiness >= 80 ? 'bg-green-500' :
                      test.readiness >= 60 ? 'bg-blue-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${test.readiness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Strengths</h2>
            <CheckCircle size={20} className="text-green-500" />
          </div>

          <div className="space-y-4">
            {strengths.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Focus Areas</h2>
            <AlertCircle size={20} className="text-orange-500" />
          </div>

          <div className="space-y-4">
            {focusAreas.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.subject}</span>
                  <span className="text-sm font-semibold text-orange-600">{item.score}%</span>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

        <div className="space-y-3">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'success' ? 'bg-green-100' :
                activity.type === 'warning' ? 'bg-orange-100' :
                'bg-blue-100'
              }`}>
                {activity.type === 'success' ? <CheckCircle size={20} className="text-green-600" /> :
                 activity.type === 'warning' ? <AlertCircle size={20} className="text-orange-600" /> :
                 <Clock size={20} className="text-blue-600" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.activity}</div>
                <div className="text-sm text-gray-500">{activity.date}</div>
              </div>
              {activity.score && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.type === 'success' ? 'bg-green-50 text-green-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {activity.score}
                </div>
              )}
              {activity.duration && (
                <div className="text-sm text-gray-500">{activity.duration}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions This Week</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Schedule 2-3 focused practice sessions for Calculus (30 min each)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Review Statistics fundamentals with AI Tutor assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Maintain daily learning streak to build consistency</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Users, TrendingUp, Award, BookOpen, BarChart3, Target } from 'lucide-react';

export function AdminAnalytics() {
  const institutionalMetrics = [
    { label: 'Total Students', value: '2,450', change: '+12% vs last month', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Teachers', value: '68', change: '+4 this quarter', icon: Target, color: 'from-teal-500 to-teal-600' },
    { label: 'Avg Performance', value: '84%', change: '+6% improvement', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Course Completion', value: '78%', change: '+3% from last term', icon: Award, color: 'from-orange-500 to-orange-600' },
  ];

  const classPerformance = [
    { grade: 'Grade 12', students: 420, avgScore: 88, teachers: 12 },
    { grade: 'Grade 11', students: 380, avgScore: 85, teachers: 11 },
    { grade: 'Grade 10', students: 410, avgScore: 84, teachers: 13 },
    { grade: 'Grade 9', students: 390, avgScore: 82, teachers: 12 },
    { grade: 'Grade 8', students: 425, avgScore: 81, teachers: 14 },
    { grade: 'Grade 7', students: 425, avgScore: 79, teachers: 13 },
  ];

  const boardComparison = [
    { board: 'CBSE', students: 1200, avgScore: 85, growth: '+5%' },
    { board: 'ICSE', students: 800, avgScore: 87, growth: '+7%' },
    { board: 'State Board', students: 450, avgScore: 82, growth: '+4%' },
  ];

  const teacherEffectiveness = [
    { name: 'Dr. Sharma', subject: 'Mathematics', students: 120, satisfaction: 95, improvement: '+12%' },
    { name: 'Ms. Patel', subject: 'Physics', students: 110, satisfaction: 93, improvement: '+10%' },
    { name: 'Mr. Kumar', subject: 'Chemistry', students: 105, satisfaction: 91, improvement: '+8%' },
    { name: 'Ms. Singh', subject: 'Biology', students: 115, satisfaction: 89, improvement: '+7%' },
  ];

  const subjectAnalytics = [
    { subject: 'Mathematics', avgScore: 86, atRisk: 45, excelling: 280 },
    { subject: 'Physics', avgScore: 84, atRisk: 52, excelling: 245 },
    { subject: 'Chemistry', avgScore: 83, atRisk: 58, excelling: 230 },
    { subject: 'Biology', avgScore: 85, atRisk: 48, excelling: 265 },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Institutional Analytics</h1>
        <p className="text-gray-500">Comprehensive performance overview across all grades and boards</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {institutionalMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">{metric.label}</div>
              <div className="text-xs text-green-600">{metric.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Grade-wise Performance</h2>
            <BarChart3 size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {classPerformance.map((grade, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:border-[#4C6EF5] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{grade.grade}</div>
                    <div className="text-sm text-gray-500">{grade.students} students • {grade.teachers} teachers</div>
                  </div>
                  <div className="text-2xl font-bold text-[#4C6EF5]">{grade.avgScore}%</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4C6EF5]"
                    style={{ width: `${grade.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Board-wise Comparison</h2>
            <BookOpen size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {boardComparison.map((board, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{board.board}</h3>
                    <p className="text-sm text-gray-500">{board.students} students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{board.avgScore}%</div>
                    <div className="text-sm text-green-600">{board.growth}</div>
                  </div>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4C6EF5] to-[#2AC4A8]"
                    style={{ width: `${board.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-sm font-medium text-gray-900 mb-1">Regional Ranking</div>
            <div className="text-xs text-gray-600">Top 15% among schools in South India</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Teacher Effectiveness</h2>

          <div className="space-y-4">
            {teacherEffectiveness.map((teacher, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{teacher.name}</div>
                    <div className="text-sm text-gray-500">{teacher.subject} • {teacher.students} students</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{teacher.satisfaction}%</div>
                      <div className="text-xs text-green-600">{teacher.improvement}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${teacher.satisfaction}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">Satisfaction</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Subject Analytics</h2>

          <div className="space-y-4">
            {subjectAnalytics.map((subject, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900">{subject.subject}</div>
                  <div className="text-xl font-bold text-[#4C6EF5]">{subject.avgScore}%</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-xs text-gray-600">At Risk</div>
                    <div className="text-lg font-semibold text-red-600">{subject.atRisk}</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600">Excelling</div>
                    <div className="text-lg font-semibold text-green-600">{subject.excelling}</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4C6EF5]"
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Strategic Insights</h3>
            <ul className="space-y-2 text-blue-100">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Overall performance improved by 6% this quarter across all grades</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>ICSE board students showing highest growth trajectory</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Chemistry and Physics require additional resource allocation</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Teacher satisfaction and effectiveness metrics are strong</span>
              </li>
            </ul>
          </div>
          <button className="px-6 py-3 bg-white text-[#4C6EF5] font-medium rounded-xl hover:shadow-lg transition-all">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  );
}

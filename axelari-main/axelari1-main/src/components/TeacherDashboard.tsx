import React from 'react';
import { Users, TrendingUp, AlertTriangle, Award, ChevronRight, BarChart3 } from 'lucide-react';

export function TeacherDashboard() {
  const classStats = [
    { label: 'Total Students', value: '42', change: '+2 this month', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Average Performance', value: '84%', change: '+3% improvement', icon: TrendingUp, color: 'from-teal-500 to-teal-600' },
    { label: 'At Risk Students', value: '5', change: 'Need attention', icon: AlertTriangle, color: 'from-orange-500 to-orange-600' },
    { label: 'High Performers', value: '18', change: '43% of class', icon: Award, color: 'from-purple-500 to-purple-600' },
  ];

  const topicPerformance = [
    { topic: 'Algebra', average: 88, atRisk: 2, color: 'bg-green-500' },
    { topic: 'Geometry', average: 85, atRisk: 3, color: 'bg-green-400' },
    { topic: 'Trigonometry', average: 78, atRisk: 5, color: 'bg-blue-500' },
    { topic: 'Calculus', average: 65, atRisk: 12, color: 'bg-orange-500' },
    { topic: 'Statistics', average: 72, atRisk: 8, color: 'bg-yellow-500' },
  ];

  const recentAlerts = [
    { student: 'Sarah Johnson', issue: 'Declining performance in Calculus', severity: 'high', time: '2 hours ago' },
    { student: 'Mike Chen', issue: 'Missed last 3 assignments', severity: 'high', time: '5 hours ago' },
    { student: 'Emma Wilson', issue: 'Low quiz scores in Statistics', severity: 'medium', time: '1 day ago' },
    { student: 'James Brown', issue: 'Improved accuracy by 15%', severity: 'positive', time: '2 days ago' },
  ];

  const studentHeatmap = [
    { name: 'Sarah J.', algebra: 90, geometry: 85, trig: 75, calculus: 45, stats: 70 },
    { name: 'Mike C.', algebra: 88, geometry: 82, trig: 80, calculus: 78, stats: 65 },
    { name: 'Emma W.', algebra: 92, geometry: 90, trig: 88, calculus: 85, stats: 55 },
    { name: 'James B.', algebra: 75, geometry: 78, trig: 72, calculus: 68, stats: 80 },
    { name: 'Lisa A.', algebra: 95, geometry: 92, trig: 90, calculus: 88, stats: 85 },
    { name: 'Tom R.', algebra: 68, geometry: 70, trig: 65, calculus: 52, stats: 60 },
  ];

  const getMasteryColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 55) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Class Overview</h1>
        <p className="text-gray-500">Grade 11 - Mathematics - Section A</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {classStats.map((stat, idx) => {
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

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Student Mastery Heatmap</h2>
            <button className="text-sm text-[#4C6EF5] font-medium hover:text-blue-600 flex items-center gap-1">
              View All
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Algebra</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Geometry</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Trig</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Calculus</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Stats</th>
                </tr>
              </thead>
              <tbody>
                {studentHeatmap.map((student, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-lg ${getMasteryColor(student.algebra)} flex items-center justify-center text-white text-xs font-medium`}>
                          {student.algebra}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-lg ${getMasteryColor(student.geometry)} flex items-center justify-center text-white text-xs font-medium`}>
                          {student.geometry}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-lg ${getMasteryColor(student.trig)} flex items-center justify-center text-white text-xs font-medium`}>
                          {student.trig}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-lg ${getMasteryColor(student.calculus)} flex items-center justify-center text-white text-xs font-medium`}>
                          {student.calculus}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-lg ${getMasteryColor(student.stats)} flex items-center justify-center text-white text-xs font-medium`}>
                          {student.stats}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs text-gray-600">85-100% Mastered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs text-gray-600">70-84% Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs text-gray-600">55-69% Needs Work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs text-gray-600">Below 55% At Risk</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Alerts</h2>

          <div className="space-y-3">
            {recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-100' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                  'bg-green-50 border-green-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className={
                      alert.severity === 'high' ? 'text-red-500 mt-0.5' :
                      alert.severity === 'medium' ? 'text-yellow-500 mt-0.5' :
                      'text-green-500 mt-0.5'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">{alert.student}</p>
                    <p className="text-xs text-gray-600 mb-2">{alert.issue}</p>
                    <p className="text-xs text-gray-400">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Topic Performance Overview</h2>
          <BarChart3 size={20} className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {topicPerformance.map((topic, idx) => (
            <div key={idx} className="group hover:bg-gray-50 rounded-lg p-4 -mx-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900 w-32">{topic.topic}</span>
                  <span className="text-xs text-gray-500">{topic.atRisk} students need attention</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{topic.average}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${topic.color} transition-all`}
                  style={{ width: `${topic.average}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

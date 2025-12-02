import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, Award, ChevronRight, BarChart3, Loader } from 'lucide-react';
// Supabase removed - using FastAPI backend

interface ClassStats {
  totalStudents: number;
  averagePerformance: number;
  atRiskCount: number;
  highPerformers: number;
}

interface StudentHeatmap {
  name: string;
  studentId: string;
  topicScores: Record<string, number>;
}

interface TopicPerformance {
  topic: string;
  topicId: string;
  average: number;
  atRisk: number;
}

export function DynamicTeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStats>({
    totalStudents: 0,
    averagePerformance: 0,
    atRiskCount: 0,
    highPerformers: 0
  });
  const [studentHeatmap, setStudentHeatmap] = useState<StudentHeatmap[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadTeacherDashboard();
  }, []);

  const loadTeacherDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: assignments } = await supabase
        .from('class_assignments')
        .select('student_id, profiles!class_assignments_student_id_fkey(full_name)')
        .eq('teacher_id', user.id)
        .eq('active', true);

      if (!assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }

      const studentIds = assignments.map(a => a.student_id);

      const [progressResult, topicsResult] = await Promise.all([
        supabase
          .from('student_progress')
          .select('student_id, mastery_level, topics(id, title)')
          .in('student_id', studentIds),
        supabase
          .from('topics')
          .select('id, title')
          .limit(5)
      ]);

      const allProgress = progressResult.data;
      const topicsList = topicsResult.data;

      if (topicsList) {
        setTopics(topicsList.map((t: any) => t.title));
      }

      if (allProgress && allProgress.length > 0) {
        let totalMastery = 0;
        let atRisk = 0;
        let high = 0;

        const studentMap = new Map<string, any>();

        allProgress.forEach((prog: any) => {
          if (!studentMap.has(prog.student_id)) {
            const assignment = assignments.find(a => a.student_id === prog.student_id);
            studentMap.set(prog.student_id, {
              name: assignment?.profiles?.full_name || 'Unknown',
              studentId: prog.student_id,
              topicScores: {},
              totalMastery: 0,
              count: 0
            });
          }

          const student = studentMap.get(prog.student_id);
          const topicTitle = prog.topics?.title || 'Unknown';
          student.topicScores[topicTitle] = prog.mastery_level;
          student.totalMastery += prog.mastery_level;
          student.count += 1;
        });

        const heatmapData: StudentHeatmap[] = [];
        studentMap.forEach((student) => {
          const avgMastery = student.count > 0 ? student.totalMastery / student.count : 0;
          totalMastery += avgMastery;

          if (avgMastery < 55) atRisk++;
          if (avgMastery >= 85) high++;

          heatmapData.push({
            name: student.name.split(' ')[0] + ' ' + student.name.split(' ')[1]?.[0] + '.',
            studentId: student.studentId,
            topicScores: student.topicScores
          });
        });

        const avgPerformance = studentMap.size > 0 ? Math.round(totalMastery / studentMap.size) : 0;

        setClassStats({
          totalStudents: studentIds.length,
          averagePerformance: avgPerformance,
          atRiskCount: atRisk,
          highPerformers: high
        });

        setStudentHeatmap(heatmapData.slice(0, 6));

        const topicPerfMap = new Map<string, { total: number; count: number; atRisk: number }>();

        allProgress.forEach((prog: any) => {
          const topicTitle = prog.topics?.title || 'Unknown';
          if (!topicPerfMap.has(topicTitle)) {
            topicPerfMap.set(topicTitle, { total: 0, count: 0, atRisk: 0 });
          }

          const tp = topicPerfMap.get(topicTitle)!;
          tp.total += prog.mastery_level;
          tp.count += 1;
          if (prog.mastery_level < 55) tp.atRisk += 1;
        });

        const topicPerfArray: TopicPerformance[] = [];
        topicPerfMap.forEach((value, key) => {
          topicPerfArray.push({
            topic: key,
            topicId: '',
            average: Math.round(value.total / value.count),
            atRisk: value.atRisk
          });
        });

        setTopicPerformance(topicPerfArray.sort((a, b) => b.average - a.average).slice(0, 5));

        const alerts: any[] = [];
        heatmapData.slice(0, 4).forEach((student) => {
          const avgScore = Object.values(student.topicScores).reduce((a, b) => a + b, 0) / Object.values(student.topicScores).length;
          if (avgScore < 60) {
            alerts.push({
              student: student.name,
              issue: 'Low performance across multiple topics',
              severity: 'high',
              time: 'Recent'
            });
          } else if (avgScore >= 85) {
            alerts.push({
              student: student.name,
              issue: 'Excellent performance, keep it up!',
              severity: 'positive',
              time: 'This week'
            });
          }
        });

        setRecentAlerts(alerts);
      }

    } catch (error) {
      console.error('Error loading teacher dashboard:', error);
      setLoading(false);
    }
  };

  const getMasteryColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 55) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your class data...</p>
        </div>
      </div>
    );
  }

  if (classStats.totalStudents === 0) {
    return (
      <div className="p-12 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <Users size={48} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Students Assigned Yet</h2>
          <p className="text-gray-600 mb-6">You haven't been assigned any students. Contact your administrator to get started.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Students',
      value: classStats.totalStudents.toString(),
      change: 'Active students',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Average Performance',
      value: `${classStats.averagePerformance}%`,
      change: 'Class average',
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600'
    },
    {
      label: 'At Risk Students',
      value: classStats.atRiskCount.toString(),
      change: 'Need attention',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'High Performers',
      value: classStats.highPerformers.toString(),
      change: `${Math.round((classStats.highPerformers / classStats.totalStudents) * 100)}% of class`,
      icon: Award,
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Class Overview</h1>
        <p className="text-gray-500">Your Students' Performance Dashboard</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => {
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

          {studentHeatmap.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                      {topics.slice(0, 5).map((topic, idx) => (
                        <th key={idx} className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                          {topic.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentHeatmap.map((student, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </td>
                        {topics.slice(0, 5).map((topic, tidx) => {
                          const score = student.topicScores[topic] || 0;
                          return (
                            <td key={tidx} className="py-3 px-4">
                              <div className="flex items-center justify-center">
                                <div className={`w-10 h-10 rounded-lg ${getMasteryColor(score)} flex items-center justify-center text-white text-xs font-medium`}>
                                  {score || '-'}
                                </div>
                              </div>
                            </td>
                          );
                        })}
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
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No student progress data available yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Alerts</h2>

          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${alert.severity === 'high' ? 'bg-red-50 border-red-100' :
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
          ) : (
            <p className="text-gray-500 text-sm">No alerts at this time</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Topic Performance Overview</h2>
          <BarChart3 size={20} className="text-gray-400" />
        </div>

        {topicPerformance.length > 0 ? (
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
                    className={`h-full ${getMasteryColor(topic.average)} transition-all`}
                    style={{ width: `${topic.average}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No topic performance data available yet</p>
        )}
      </div>
    </div>
  );
}

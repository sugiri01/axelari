import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Award, Clock, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChildData {
  id: string;
  name: string;
  grade: number;
  board: string;
}

export function DynamicParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [strengths, setStrengths] = useState<any[]>([]);
  const [focusAreas, setFocusAreas] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadParentDashboard();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild);
    }
  }, [selectedChild]);

  const loadParentDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: links } = await supabase
        .from('parent_child_links')
        .select(`
          student_id,
          profiles!parent_child_links_student_id_fkey(
            full_name,
            id
          )
        `)
        .eq('parent_id', user.id)
        .eq('active', true);

      if (links && links.length > 0) {
        const childrenData = links.map((link: any) => ({
          id: link.student_id,
          name: link.profiles?.full_name || 'Student',
          grade: 10,
          board: 'CBSE'
        }));

        setChildren(childrenData);
        setSelectedChild(childrenData[0].id);
      }
    } catch (error) {
      console.error('Error loading parent dashboard:', error);
      setLoading(false);
    }
  };

  const loadChildData = async (childId: string) => {
    try {
      const [metricsResult, progressResult, sessionsResult] = await Promise.all([
        supabase
          .from('performance_metrics')
          .select('topics_mastered, accuracy, consistency, streak_days')
          .eq('student_id', childId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('student_progress')
          .select('mastery_level, topics(title)')
          .eq('student_id', childId)
          .order('mastery_level', { ascending: false })
          .limit(10),
        supabase
          .from('quiz_sessions')
          .select('created_at, score')
          .eq('student_id', childId)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      if (metricsResult.data) {
        const latest = metricsResult.data;
        setWeeklyData({
          timeSpent: '5.2 hours',
          topicsCompleted: latest.topics_mastered || 0,
          accuracy: latest.accuracy || 0,
          consistency: latest.consistency || 0,
          examReadiness: 78,
          streak: latest.streak_days || 0
        });
      } else {
        setWeeklyData({
          timeSpent: '0 hours',
          topicsCompleted: 0,
          accuracy: 0,
          consistency: 0,
          examReadiness: 0,
          streak: 0
        });
      }

      if (progressResult.data) {
        const strong = progressResult.data
          .filter((p: any) => p.mastery_level >= 70)
          .slice(0, 3)
          .map((p: any) => ({
            subject: p.topics?.title || 'Topic',
            score: p.mastery_level
          }));

        const weak = progressResult.data
          .filter((p: any) => p.mastery_level < 70 && p.mastery_level > 0)
          .slice(0, 2)
          .map((p: any) => ({
            subject: p.topics?.title || 'Topic',
            score: p.mastery_level,
            recommendation: p.mastery_level < 50 ? 'Needs urgent attention' : 'Additional practice needed'
          }));

        setStrengths(strong);
        setFocusAreas(weak);
      }

      if (sessionsResult.data) {
        const activities = sessionsResult.data.map((session: any) => ({
          date: new Date(session.created_at).toLocaleDateString(),
          activity: 'Completed quiz',
          score: `${session.score}%`,
          type: session.score >= 75 ? 'success' : session.score >= 50 ? 'warning' : 'danger'
        }));

        setRecentActivity(activities);
      }

    } catch (error) {
      console.error('Error loading child data:', error);
      setWeeklyData({
        timeSpent: '0 hours',
        topicsCompleted: 0,
        accuracy: 0,
        consistency: 0,
        examReadiness: 0,
        streak: 0
      });
    }
  };

  if (loading) {
    return (
      <div className="p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-12 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <Target size={48} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Children Linked</h2>
          <p className="text-gray-600 mb-6">You haven't linked any student accounts yet. Contact your school administrator to link your child's account.</p>
        </div>
      </div>
    );
  }

  const selectedChildData = children.find(c => c.id === selectedChild);

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {selectedChildData?.name}'s Progress Dashboard
          </h1>
          <p className="text-gray-500">Weekly summary and insights</p>
        </div>

        {children.length > 1 && (
          <div className="relative">
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-4 py-2 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {weeklyData && (
        <>
          <div className="bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-8 text-white mb-10">
            <h2 className="text-2xl font-semibold mb-6">This Week's Summary</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold mb-1">{weeklyData.timeSpent}</div>
                <div className="text-blue-100 text-sm">Study Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">{weeklyData.topicsCompleted}</div>
                <div className="text-blue-100 text-sm">Topics Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">{weeklyData.accuracy}%</div>
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
                    <span className="text-lg font-semibold text-gray-900">{weeklyData.consistency}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${weeklyData.consistency}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {weeklyData.consistency >= 80 ? 'Excellent! Studying regularly' : 'Keep practicing regularly'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exam Readiness</span>
                    <span className="text-lg font-semibold text-gray-900">{weeklyData.examReadiness}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${weeklyData.examReadiness}%` }}
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
                      <div className="font-semibold text-gray-900">{weeklyData.streak} Day Streak</div>
                      <div className="text-sm text-gray-600">Keep the momentum going!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Clock size={20} className="text-gray-400" />
              </div>

              {recentActivity.length > 0 ? (
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Strengths</h2>
                <CheckCircle size={20} className="text-green-500" />
              </div>

              {strengths.length > 0 ? (
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
              ) : (
                <p className="text-gray-500 text-sm">Building strengths...</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Focus Areas</h2>
                <AlertCircle size={20} className="text-orange-500" />
              </div>

              {focusAreas.length > 0 ? (
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
              ) : (
                <p className="text-gray-500 text-sm">All topics looking good!</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions This Week</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {focusAreas.length > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Schedule focused practice for {focusAreas[0].subject}</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Maintain daily learning streak to build consistency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Encourage use of AI Tutor for difficult concepts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

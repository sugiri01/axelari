import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Calendar, Award, Clock, ArrowRight, Flame, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PerformanceMetric {
  topics_mastered: number;
  accuracy: number;
  streak_days: number;
  speed: number;
}

interface TopicProgress {
  id: string;
  title: string;
  mastery_level: number;
}

export function DynamicStudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric | null>(null);
  const [strengths, setStrengths] = useState<TopicProgress[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicProgress[]>([]);
  const [upcomingTopics, setUpcomingTopics] = useState<any[]>([]);
  const [userName, setUserName] = useState('Student');
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  useEffect(() => {
    console.log('[Dashboard] Component mounted');
    loadDashboardData();

    const timeout = setTimeout(() => {
      console.warn('[Dashboard] Loading timeout - forcing display');
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('[Dashboard] Starting data load');
      setLoadingStage('Checking authentication...');

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('[Dashboard] Error getting user:', userError);
      }

      const userId = user?.id || localStorage.getItem('axelari_user_id');
      const userEmail = user?.email || localStorage.getItem('axelari_user_email');

      console.log('[Dashboard] User ID:', userId);
      console.log('[Dashboard] User email:', userEmail);
      console.log('[Dashboard] Using Supabase session:', !!user);

      if (!userId) {
        console.warn('[Dashboard] No user ID found');
        setLoading(false);
        return;
      }

      setLoadingStage('Loading profile...');
      let profileResult;
      try {
        console.log('[Dashboard] Fetching profile');
        profileResult = await Promise.race([
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .maybeSingle(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile query timeout')), 3000))
        ]) as any;
        console.log('[Dashboard] Profile result:', profileResult);
      } catch (error) {
        console.error('[Dashboard] Profile query error:', error);
        profileResult = { data: null, error };
      }

      setLoadingStage('Loading performance metrics...');
      let metricsResult;
      try {
        console.log('[Dashboard] Fetching metrics');
        metricsResult = await Promise.race([
          supabase
            .from('performance_metrics')
            .select('topics_mastered, accuracy, streak_days, speed')
            .eq('student_id', userId)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Metrics query timeout')), 3000))
        ]) as any;
        console.log('[Dashboard] Metrics result:', metricsResult);
      } catch (error) {
        console.error('[Dashboard] Metrics query error:', error);
        metricsResult = { data: null, error };
      }

      setLoadingStage('Loading progress data...');
      let progressResult;
      try {
        console.log('[Dashboard] Fetching progress');
        progressResult = await Promise.race([
          supabase
            .from('student_progress')
            .select('mastery_level, topics(id, title)')
            .eq('student_id', userId)
            .order('mastery_level', { ascending: false })
            .limit(10),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Progress query timeout')), 3000))
        ]) as any;
        console.log('[Dashboard] Progress result:', progressResult);
      } catch (error) {
        console.error('[Dashboard] Progress query error:', error);
        progressResult = { data: null, error };
      }

      setLoadingStage('Loading learning path...');
      let learningPathResult;
      try {
        console.log('[Dashboard] Fetching learning path');
        learningPathResult = await Promise.race([
          supabase
            .from('learning_paths')
            .select('next_topic_id, topics(id, title, difficulty, estimated_time)')
            .eq('student_id', userId)
            .maybeSingle(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Learning path query timeout')), 3000))
        ]) as any;
        console.log('[Dashboard] Learning path result:', learningPathResult);
      } catch (error) {
        console.error('[Dashboard] Learning path query error:', error);
        learningPathResult = { data: null, error };
      }

      if (profileResult?.data?.full_name) {
        const firstName = profileResult.data.full_name.split(' ')[0];
        console.log('[Dashboard] Setting user name:', firstName);
        setUserName(firstName);
      } else if (userEmail) {
        const emailName = userEmail.split('@')[0];
        console.log('[Dashboard] Using email for name:', emailName);
        setUserName(emailName);
      }

      if (metricsResult?.data) {
        console.log('[Dashboard] Setting metrics:', metricsResult.data);
        setMetrics(metricsResult.data);
      } else {
        console.log('[Dashboard] Using default metrics');
        setMetrics({
          topics_mastered: 0,
          accuracy: 0,
          streak_days: 0,
          speed: 50
        });
      }

      if (progressResult?.data && Array.isArray(progressResult.data)) {
        console.log('[Dashboard] Processing progress data:', progressResult.data.length, 'items');
        const topicsWithProgress = progressResult.data.map((p: any) => ({
          id: p.topics?.id || '',
          title: p.topics?.title || 'Unknown Topic',
          mastery_level: p.mastery_level
        }));

        const strengthsList = topicsWithProgress.filter((t: TopicProgress) => t.mastery_level >= 70).slice(0, 3);
        const weaknessesList = topicsWithProgress.filter((t: TopicProgress) => t.mastery_level < 70 && t.mastery_level > 0).slice(0, 2);

        console.log('[Dashboard] Strengths:', strengthsList.length);
        console.log('[Dashboard] Weaknesses:', weaknessesList.length);

        setStrengths(strengthsList);
        setWeaknesses(weaknessesList);
      } else {
        console.log('[Dashboard] No progress data available');
      }

      setLoadingStage('Loading recommended topics...');
      if (learningPathResult?.data?.topics) {
        console.log('[Dashboard] Using learning path topics');
        setUpcomingTopics([
          {
            ...learningPathResult.data.topics,
            status: 'recommended'
          }
        ]);
      } else {
        try {
          console.log('[Dashboard] Fetching default topics');
          const topicsQuery = await Promise.race([
            supabase
              .from('topics')
              .select('id, title, difficulty, estimated_time')
              .limit(3),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Topics query timeout')), 3000))
          ]) as any;

          if (topicsQuery?.data && Array.isArray(topicsQuery.data)) {
            console.log('[Dashboard] Setting', topicsQuery.data.length, 'default topics');
            setUpcomingTopics(topicsQuery.data.map((t: any, idx: number) => ({
              ...t,
              status: idx === 0 ? 'recommended' : idx === 1 ? 'next' : 'upcoming'
            })));
          } else {
            console.log('[Dashboard] No topics available');
          }
        } catch (error) {
          console.error('[Dashboard] Topics query error:', error);
        }
      }

      console.log('[Dashboard] Data loading complete');
      setLoading(false);

    } catch (error) {
      console.error('[Dashboard] Fatal error loading dashboard:', error);
      setMetrics({
        topics_mastered: 0,
        accuracy: 0,
        streak_days: 0,
        speed: 50
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm">{loadingStage}</p>
        </div>
      </div>
    );
  }

  const performanceStats = [
    {
      label: 'Topics Mastered',
      value: metrics?.topics_mastered?.toString() || '0',
      change: 'Keep learning!',
      icon: Target,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Accuracy',
      value: `${metrics?.accuracy || 0}%`,
      change: 'Great progress',
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600'
    },
    {
      label: 'Learning Speed',
      value: metrics?.speed && metrics.speed >= 70 ? 'Fast' : metrics?.speed && metrics.speed >= 40 ? 'Medium' : 'Steady',
      change: 'Adaptive pace',
      icon: Zap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Streak',
      value: `${metrics?.streak_days || 0} days`,
      change: 'Keep it up!',
      icon: Flame,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back, {userName}</h1>
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
          {strengths.length > 0 ? (
            <div className="space-y-4">
              {strengths.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.mastery_level}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${item.mastery_level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Start practicing to build your strengths!</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Focus Areas</h2>
            <Target size={20} className="text-orange-500" />
          </div>
          {weaknesses.length > 0 ? (
            <div className="space-y-4">
              {weaknesses.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.mastery_level}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 transition-all duration-500"
                      style={{ width: `${item.mastery_level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">All topics looking good!</p>
          )}
          <button
            onClick={() => window.location.hash = '#/quiz'}
            className="mt-6 w-full py-3 bg-[#4C6EF5] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
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
        </div>

        {upcomingTopics.length > 0 ? (
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
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {topic.estimated_time || 30} min
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        topic.difficulty === 'advanced' ? 'bg-orange-50 text-orange-600' :
                        topic.difficulty === 'intermediate' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {topic.difficulty || 'beginner'}
                      </span>
                    </div>
                  </div>
                </div>
                {topic.status === 'recommended' && (
                  <button
                    onClick={() => window.location.hash = '#/quiz'}
                    className="px-5 py-2 bg-[#4C6EF5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Start Learning
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No topics available yet. Start exploring!</p>
        )}
      </div>

      <div className="mt-6 bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
            <p className="text-blue-100">Take a quiz and track your progress</p>
          </div>
          <button
            onClick={() => window.location.hash = '#/quiz'}
            className="px-6 py-3 bg-white text-[#4C6EF5] font-medium rounded-xl hover:shadow-lg transition-all"
          >
            Take Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

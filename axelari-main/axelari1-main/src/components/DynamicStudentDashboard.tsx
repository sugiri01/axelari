import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Award, Loader } from 'lucide-react';
import { getProfile, getProgress, getWeakTopics, StudentProfile, AnalyticsProgress, WeakTopic } from '../services/profileService';

import { useAuth } from '../context/AuthContext';

export function DynamicStudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<AnalyticsProgress | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId = localStorage.getItem('student_id');
      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Loading dashboard for student:', studentId);

      // Parallel API calls for better performance
      const [profileData, progressData, weakTopicsData] = await Promise.all([
        getProfile(studentId).catch(err => {
          console.error('Profile error:', err);
          return null;
        }),
        getProgress(studentId).catch(err => {
          console.error('Progress error:', err);
          return null;
        }),
        getWeakTopics(studentId, 3).catch(err => {
          console.error('Weak topics error:', err);
          return [];
        })
      ]);

      console.log('Dashboard data loaded:', { profileData, progressData, weakTopicsData });

      setProfile(profileData);
      setProgress(progressData);
      setWeakTopics(weakTopicsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome Back, {user?.name || 'Student'}!</h1>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Topics Mastered"
          value={progress?.topics_mastered || 0}
          total={progress?.total_topics}
          icon={<Award className="h-6 w-6" />}
          color="indigo"
        />
        <MetricCard
          title="Overall Progress"
          value={`${progress?.overall_progress || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Processing Speed"
          value={profile?.processing_speed || 50}
          max={100}
          icon={<Zap className="h-6 w-6" />}
          color="yellow"
        />
        <MetricCard
          title="Accuracy"
          value={profile?.accuracy_consistency || 50}
          max={100}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Areas to Focus On</h2>
          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div key={topic.topic_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{topic.topic_name}</p>
                  <p className="text-sm text-gray-600">
                    {topic.questions_attempted} questions attempted
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {topic.mastery_score.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Mastery</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  total?: number;
  max?: number;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'yellow' | 'blue';
}

function MetricCard({ title, value, total, max, icon, color }: MetricCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600 text-sm">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">
        {value}
        {total && <span className="text-lg text-gray-600">/{total}</span>}
        {max && <span className="text-lg text-gray-600">/{max}</span>}
      </p>
    </div>
  );
}

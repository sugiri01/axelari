import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Zap, Star, TrendingUp, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  earned_at: string;
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      setAchievements(data || []);
      const points = (data || []).reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(points);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      award: Award,
      target: Target,
      zap: Zap,
      star: Star,
      medal: Medal,
      trending: TrendingUp
    };
    return icons[iconName] || Trophy;
  };

  const achievementCategories = [
    { type: 'topic_mastery', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { type: 'streak', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { type: 'speed', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50' },
    { type: 'accuracy', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { type: 'milestone', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Your Achievements</h1>
        <p className="text-gray-500">Celebrate your learning milestones</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <Trophy size={40} className="mb-4" />
          <div className="text-4xl font-bold mb-2">{achievements.length}</div>
          <div className="text-blue-100">Total Achievements</div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
          <Star size={40} className="mb-4" />
          <div className="text-4xl font-bold mb-2">{totalPoints}</div>
          <div className="text-teal-100">Total Points</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
          <Award size={40} className="mb-4" />
          <div className="text-4xl font-bold mb-2">{Math.floor(totalPoints / 100)}</div>
          <div className="text-purple-100">Level</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : achievements.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <Trophy size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
          <p className="text-gray-600">Start learning to earn your first achievement!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {achievements.map((achievement) => {
            const Icon = getIconComponent(achievement.icon);
            const category = achievementCategories.find(c => c.type === achievement.achievement_type) || achievementCategories[0];

            return (
              <div key={achievement.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </span>
                      <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                        +{achievement.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

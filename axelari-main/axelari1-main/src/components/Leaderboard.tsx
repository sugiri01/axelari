import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  student_id: string;
  score: number;
  rank: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function Leaderboard() {
  const [category, setCategory] = useState<'overall' | 'weekly' | 'accuracy' | 'speed'>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const period = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          id,
          student_id,
          score,
          rank,
          profiles:student_id (
            full_name,
            avatar_url
          )
        `)
        .eq('category', category)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;

      setEntries(data || []);

      const userEntry = (data || []).find(e => e.student_id === user.id);
      setCurrentUserRank(userEntry?.rank || null);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    return 'from-blue-400 to-blue-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={24} className="text-white" />;
    if (rank === 2) return <Medal size={24} className="text-white" />;
    if (rank === 3) return <Award size={24} className="text-white" />;
    return <span className="text-white font-bold">{rank}</span>;
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-500">See how you rank among your peers</p>
      </div>

      {currentUserRank && (
        <div className="mb-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-100 mb-1">Your Current Rank</div>
              <div className="text-4xl font-bold">#{currentUserRank}</div>
            </div>
            <TrendingUp size={48} />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['overall', 'weekly', 'accuracy', 'speed'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              category === cat
                ? 'bg-[#4C6EF5] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  index < 3 ? 'bg-gradient-to-r from-gray-50 to-transparent' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center flex-shrink-0`}>
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{entry.profiles.full_name}</h3>
                  <p className="text-sm text-gray-500">Rank #{entry.rank}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{entry.score}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

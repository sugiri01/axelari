import React from 'react';
import { CheckCircle, Circle, Clock, Zap, TrendingUp, Lock } from 'lucide-react';

interface PathNode {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  mastery?: number;
  phase: number;
}

export function LearningPath() {
  const pathNodes: PathNode[] = [
    { id: '1', title: 'Introduction to Limits', status: 'completed', difficulty: 'beginner', estimatedTime: 20, mastery: 95, phase: 1 },
    { id: '2', title: 'Limit Properties', status: 'completed', difficulty: 'beginner', estimatedTime: 25, mastery: 88, phase: 1 },
    { id: '3', title: 'Continuity', status: 'completed', difficulty: 'intermediate', estimatedTime: 30, mastery: 92, phase: 2 },
    { id: '4', title: 'Derivatives - Power Rule', status: 'current', difficulty: 'intermediate', estimatedTime: 35, mastery: 67, phase: 2 },
    { id: '5', title: 'Product & Quotient Rules', status: 'upcoming', difficulty: 'intermediate', estimatedTime: 40, phase: 3 },
    { id: '6', title: 'Chain Rule', status: 'upcoming', difficulty: 'advanced', estimatedTime: 45, phase: 3 },
    { id: '7', title: 'Implicit Differentiation', status: 'upcoming', difficulty: 'advanced', estimatedTime: 35, phase: 4 },
    { id: '8', title: 'Higher Order Derivatives', status: 'locked', difficulty: 'advanced', estimatedTime: 40, phase: 4 },
  ];

  const cognitiveProfile = {
    visualLearner: 75,
    practicalLearner: 85,
    theoreticalLearner: 60,
  };

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Your Learning Path</h1>
        <p className="text-gray-500">AI-powered adaptive journey tailored to your pace</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">Phase 2</div>
          <div className="text-sm font-medium text-gray-600 mb-2">Current Phase</div>
          <div className="text-xs text-gray-500">Foundation Building</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">Fast</div>
          <div className="text-sm font-medium text-gray-600 mb-2">Learning Speed</div>
          <div className="text-xs text-gray-500">Adapting to your pace</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-white" />
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">3/8</div>
          <div className="text-sm font-medium text-gray-600 mb-2">Topics Completed</div>
          <div className="text-xs text-gray-500">Keep up the momentum!</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="col-span-2">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Timeline</h2>

            <div className="space-y-6">
              {pathNodes.map((node, index) => {
                const isCompleted = node.status === 'completed';
                const isCurrent = node.status === 'current';
                const isLocked = node.status === 'locked';

                return (
                  <div key={node.id} className="relative">
                    {index < pathNodes.length - 1 && (
                      <div className={`absolute left-6 top-12 w-0.5 h-12 ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}

                    <div className={`flex items-start gap-4 p-5 rounded-xl transition-all ${
                      isCurrent ? 'bg-blue-50 border-2 border-[#4C6EF5]' :
                      isCompleted ? 'bg-gray-50 border border-gray-100' :
                      isLocked ? 'bg-gray-50 border border-gray-100 opacity-50' :
                      'border border-gray-100 hover:border-gray-200 hover:shadow-md cursor-pointer'
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-green-500' :
                        isCurrent ? 'bg-[#4C6EF5]' :
                        isLocked ? 'bg-gray-300' :
                        'bg-gray-200'
                      }`}>
                        {isCompleted ? <CheckCircle size={24} className="text-white" /> :
                         isLocked ? <Lock size={24} className="text-gray-500" /> :
                         <Circle size={24} className="text-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${
                            isLocked ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {node.title}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-1 bg-[#4C6EF5] text-white text-xs font-medium rounded">
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {node.estimatedTime} min
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            node.difficulty === 'beginner' ? 'bg-green-50 text-green-600' :
                            node.difficulty === 'intermediate' ? 'bg-blue-50 text-blue-600' :
                            'bg-orange-50 text-orange-600'
                          }`}>
                            {node.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">Phase {node.phase}</span>
                        </div>

                        {node.mastery !== undefined && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  node.mastery >= 80 ? 'bg-green-500' :
                                  node.mastery >= 60 ? 'bg-blue-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${node.mastery}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-12">
                              {node.mastery}%
                            </span>
                          </div>
                        )}

                        {isCurrent && (
                          <button className="mt-3 px-4 py-2 bg-[#4C6EF5] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                            Continue Learning
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Cognitive Profile</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Visual Learning</span>
                  <span className="text-sm font-medium text-gray-900">{cognitiveProfile.visualLearner}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${cognitiveProfile.visualLearner}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Practical Learning</span>
                  <span className="text-sm font-medium text-gray-900">{cognitiveProfile.practicalLearner}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: `${cognitiveProfile.practicalLearner}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Theoretical Learning</span>
                  <span className="text-sm font-medium text-gray-900">{cognitiveProfile.theoreticalLearner}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${cognitiveProfile.theoreticalLearner}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">Recommended Action</h3>
            <p className="text-sm text-blue-100 mb-4">
              Focus on completing "Derivatives - Power Rule" to unlock the next phase.
            </p>
            <button className="w-full py-2 bg-white text-[#4C6EF5] font-medium rounded-lg hover:shadow-lg transition-all">
              Start Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

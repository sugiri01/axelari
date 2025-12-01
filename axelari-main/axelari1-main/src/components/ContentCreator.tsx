import React, { useState } from 'react';
import { Sparkles, BookOpen, FileText, List, Wand2, Save, Eye } from 'lucide-react';

export function ContentCreator() {
  const [selectedType, setSelectedType] = useState<'question' | 'lesson' | 'assignment'>('question');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generatedContent, setGeneratedContent] = useState('');

  const contentTypes = [
    { id: 'question', label: 'AI Question Generator', icon: FileText },
    { id: 'lesson', label: 'Lesson Planner', icon: BookOpen },
    { id: 'assignment', label: 'Assignment Creator', icon: List },
  ];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const topics = {
    Mathematics: ['Algebra', 'Calculus', 'Geometry', 'Statistics'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
    Chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical'],
    Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution'],
  };

  const handleGenerate = () => {
    setGeneratedContent('AI-generated content will appear here based on your selections...');
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Content Creation Tools</h1>
        <p className="text-gray-500">Generate exam-quality questions and learning materials in seconds</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-[#4C6EF5] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={32} className={isActive ? 'text-[#4C6EF5] mb-3' : 'text-gray-400 mb-3'} />
              <div className={`font-semibold ${isActive ? 'text-[#4C6EF5]' : 'text-gray-700'}`}>
                {type.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#4C6EF5] focus:ring-2 focus:ring-blue-100 outline-none">
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Topic</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#4C6EF5] focus:ring-2 focus:ring-blue-100 outline-none">
                  {topics.Mathematics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        difficulty === level
                          ? 'bg-[#4C6EF5] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Board</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#4C6EF5] focus:ring-2 focus:ring-blue-100 outline-none">
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>IGCSE</option>
                  <option>State Board</option>
                </select>
              </div>

              {selectedType === 'question' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Question Count</label>
                  <input
                    type="number"
                    defaultValue={5}
                    min={1}
                    max={50}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#4C6EF5] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleGenerate}
                className="w-full py-3 bg-gradient-to-r from-[#4C6EF5] to-[#2AC4A8] text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Wand2 size={20} />
                Generate with AI
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
            <Sparkles size={24} className="mb-3" />
            <h3 className="font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-sm text-purple-100">
              Our AI creates exam-quality content aligned to your board's curriculum in seconds.
            </p>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Preview</h3>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Eye size={18} />
                  Preview
                </button>
                <button className="px-4 py-2 bg-[#4C6EF5] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>

            {!generatedContent ? (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-center">
                  <Sparkles size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No content generated yet</p>
                  <p className="text-sm text-gray-400">Configure your settings and click Generate</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Question 1</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">Medium</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded">Algebra</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">5 marks</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-900 leading-relaxed">
                      Solve for x in the equation: 2x² + 5x - 3 = 0
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">Options:</p>
                    <div className="space-y-1 pl-4">
                      <div className="text-sm text-gray-600">A) x = 1/2, x = -3</div>
                      <div className="text-sm text-gray-600">B) x = -1/2, x = 3</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        C) x = 1/2, x = 3
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded">Correct</span>
                      </div>
                      <div className="text-sm text-gray-600">D) x = -1/2, x = -3</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Solution:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
                      <br />
                      Where a = 2, b = 5, c = -3
                      <br />
                      x = (-5 ± √(25 + 24)) / 4 = (-5 ± 7) / 4
                      <br />
                      Therefore, x = 1/2 or x = -3
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Generated 4 more questions</span>
                  <span>•</span>
                  <span>Board aligned</span>
                  <span>•</span>
                  <span>Ready to use</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { ReactNode } from 'react';
import { Home, BookOpen, BarChart3, MessageSquare, Settings, Users, FileText, Trophy } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeView?: string;
  userRole?: 'student' | 'teacher' | 'parent' | 'admin';
  showAIPanel?: boolean;
  aiPanelContent?: ReactNode;
  onNavigate?: (viewId: string) => void;
}

export function Layout({ children, activeView = 'home', userRole = 'student', showAIPanel = false, aiPanelContent, onNavigate }: LayoutProps) {
  const navItems = {
    student: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'learning', label: 'Learning Path', icon: BookOpen },
      { id: 'quiz', label: 'Practice', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'ai-tutor', label: 'AI Tutor', icon: MessageSquare },
    ],
    teacher: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'content', label: 'Content', icon: BookOpen },
      { id: 'grading', label: 'Grading', icon: FileText },
    ],
    parent: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'progress', label: 'Progress', icon: Trophy },
      { id: 'notifications', label: 'Notifications', icon: MessageSquare },
    ],
    admin: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'academic', label: 'Academic', icon: BookOpen },
      { id: 'admin', label: 'Admin', icon: Settings },
    ],
  };

  const currentNavItems = navItems[userRole] || navItems.student;

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed left-0 top-0 h-full w-20 border-r border-gray-100 bg-white flex flex-col items-center py-8 gap-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4C6EF5] to-[#2AC4A8] flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>

        <div className="flex-1 flex flex-col gap-2 w-full px-3">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                className={`w-full h-14 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#4C6EF5] text-white shadow-lg shadow-blue-200'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title={item.label}
              >
                <Icon size={22} />
              </button>
            );
          })}
        </div>

        <button
          className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </nav>

      <div className={`ml-20 ${showAIPanel ? 'mr-96' : ''}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {showAIPanel && (
        <aside className="fixed right-0 top-0 h-full w-96 border-l border-gray-100 bg-white overflow-y-auto">
          {aiPanelContent}
        </aside>
      )}
    </div>
  );
}

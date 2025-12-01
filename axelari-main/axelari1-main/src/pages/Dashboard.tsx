import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { AIPanel } from '../components/AIPanel';
import { DynamicStudentDashboard } from '../components/DynamicStudentDashboard';
import { EnhancedQuizEngine } from '../components/EnhancedQuizEngine';
import { Achievements } from '../components/Achievements';
import { Leaderboard } from '../components/Leaderboard';
import { Notifications } from '../components/Notifications';
import { LearningPath } from '../components/LearningPath';
import { StudentAnalytics } from '../components/StudentAnalytics';
import { DynamicTeacherDashboard } from '../components/DynamicTeacherDashboard';
import { DynamicParentDashboard } from '../components/DynamicParentDashboard';
import { AdminAnalytics } from '../components/AdminAnalytics';
import { ContentCreator } from '../components/ContentCreator';
import { useAuth } from '../hooks/useAuth';

type StudentView = 'home' | 'learning' | 'quiz' | 'analytics' | 'ai-tutor' | 'lesson' | 'achievements' | 'leaderboard' | 'notifications';
type TeacherView = 'home' | 'students' | 'analytics' | 'content' | 'grading';
type ParentView = 'home' | 'progress' | 'notifications';
type AdminView = 'home' | 'analytics' | 'academic' | 'admin';
type View = StudentView | TeacherView | ParentView | AdminView;
type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState<View>('home');
    const [userRole, setUserRole] = useState<UserRole>('student');
    const [showAIPanel, setShowAIPanel] = useState(false);

    // In a real app, we would fetch the user's role from the backend
    // For Phase 1, we default to student
    useEffect(() => {
        if (user) {
            // Logic to determine role could go here
            setUserRole('student');
        }
    }, [user]);

    const handleLogout = () => {
        logout();
    };

    const handleNavigate = (viewId: string) => {
        setCurrentView(viewId as View);
        if (viewId === 'ai-tutor') {
            setShowAIPanel(true);
            setCurrentView('home');
        } else {
            if (userRole === 'student' && viewId !== 'home') {
                setShowAIPanel(false);
            }
        }
    };

    const renderView = () => {
        if (userRole === 'student') {
            switch (currentView) {
                case 'home':
                    return <DynamicStudentDashboard />;
                case 'learning':
                    return <LearningPath />;
                case 'quiz':
                    return <EnhancedQuizEngine />;
                case 'achievements':
                    return <Achievements />;
                case 'leaderboard':
                    return <Leaderboard />;
                case 'notifications':
                    return <Notifications />;
                case 'analytics':
                    return <StudentAnalytics />;
                case 'lesson':
                    return <div className="p-12 max-w-7xl mx-auto"><h1 className="text-3xl font-semibold text-gray-900">Lesson Player - Coming Soon</h1></div>;
                default:
                    return <DynamicStudentDashboard />;
            }
        } else if (userRole === 'teacher') {
            switch (currentView) {
                case 'home':
                    return <DynamicTeacherDashboard />;
                case 'content':
                    return <ContentCreator />;
                case 'students':
                case 'grading':
                    return <div className="p-12 max-w-7xl mx-auto"><h1 className="text-3xl font-semibold text-gray-900">{currentView.charAt(0).toUpperCase() + currentView.slice(1)} - Coming Soon</h1></div>;
                default:
                    return <DynamicTeacherDashboard />;
            }
        } else if (userRole === 'parent') {
            switch (currentView) {
                case 'home':
                    return <DynamicParentDashboard />;
                case 'progress':
                case 'notifications':
                    return <div className="p-12 max-w-7xl mx-auto"><h1 className="text-3xl font-semibold text-gray-900">{currentView.charAt(0).toUpperCase() + currentView.slice(1)} - Coming Soon</h1></div>;
                default:
                    return <DynamicParentDashboard />;
            }
        } else if (userRole === 'admin') {
            switch (currentView) {
                case 'home':
                case 'analytics':
                    return <AdminAnalytics />;
                case 'academic':
                case 'admin':
                    return <div className="p-12 max-w-7xl mx-auto"><h1 className="text-3xl font-semibold text-gray-900">{currentView.charAt(0).toUpperCase() + currentView.slice(1)} Management - Coming Soon</h1></div>;
                default:
                    return <AdminAnalytics />;
            }
        }
        return <DynamicStudentDashboard />;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
                {userRole === 'student' && (
                    <button
                        onClick={() => setShowAIPanel(!showAIPanel)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showAIPanel
                                ? 'bg-[#4C6EF5] text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {showAIPanel ? 'Hide' : 'Show'} AI Tutor
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                >
                    Logout
                </button>
            </div>

            <Layout
                activeView={currentView}
                userRole={userRole}
                showAIPanel={showAIPanel && userRole === 'student'}
                aiPanelContent={<AIPanel />}
                onNavigate={handleNavigate}
            >
                {renderView()}
            </Layout>
        </div>
    );
};

export default Dashboard;

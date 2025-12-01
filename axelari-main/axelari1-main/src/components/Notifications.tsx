import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Award, BookOpen, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement' | 'assignment' | 'reminder';
  read: boolean;
  link: string | null;
  created_at: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertCircle,
      achievement: Award,
      assignment: BookOpen,
      reminder: Bell
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getColor = (type: string) => {
    const colors = {
      info: 'from-blue-500 to-blue-600',
      success: 'from-green-500 to-green-600',
      warning: 'from-yellow-500 to-yellow-600',
      achievement: 'from-purple-500 to-purple-600',
      assignment: 'from-teal-500 to-teal-600',
      reminder: 'from-orange-500 to-orange-600'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[#4C6EF5] text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <Bell size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const color = getColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border p-6 transition-all hover:shadow-md ${
                  notification.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className="text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
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

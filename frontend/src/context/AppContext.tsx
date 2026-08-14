import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SystemNotification, SystemAlert } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface AppContextType {
  notifications: SystemNotification[];
  alerts: SystemAlert[];
  unreadNotificationCount: number;
  unresolvedAlertCount: number;
  toasts: ToastMessage[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  refreshAppData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const refreshAppData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, alertRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/alerts')
      ]);

      setNotifications(notifRes.data.notifications || []);
      setUnreadNotificationCount(notifRes.data.unreadCount || 0);
      setAlerts(alertRes.data || []);
    } catch (err) {
      console.error('Error refreshing app state:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAppData();
    const interval = setInterval(refreshAppData, 30000); // 30s background sync
    return () => clearInterval(interval);
  }, [refreshAppData]);

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
      showToast('All notifications marked as read', 'info');
    } catch (err: any) {
      showToast('Failed to mark notifications as read', 'error');
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      showToast('Action alert marked as resolved', 'success');
    } catch (err: any) {
      showToast('Failed to resolve alert', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        notifications,
        alerts,
        unreadNotificationCount,
        unresolvedAlertCount: alerts.length,
        toasts,
        globalSearch,
        setGlobalSearch,
        showToast,
        refreshAppData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resolveAlert
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              backgroundColor:
                toast.type === 'success' ? '#10B981' :
                toast.type === 'error' ? '#EF4444' :
                toast.type === 'warning' ? '#F59E0B' : '#3B82F6',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

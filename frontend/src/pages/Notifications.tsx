import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, AlertTriangle, Calendar, FileSearch, Users, Sparkles } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = notifications.filter(n => {
    if (filterCategory === 'ALL') return true;
    return n.type === filterCategory;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'TIMETABLE_CONFLICT': return Calendar;
      case 'ATTENDANCE_WARNING': return Users;
      case 'DOCUMENT_VERIFICATION': return FileSearch;
      default: return Bell;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Notifications & System Alerts Center
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time operational updates, attendance thresholds, and scheduling conflicts
            </p>
          </div>
        </div>

        <button onClick={markAllNotificationsAsRead} className="btn-secondary">
          <CheckCheck size={16} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['ALL', 'TIMETABLE_CONFLICT', 'ATTENDANCE_WARNING', 'DOCUMENT_VERIFICATION', 'STAFF_SHORTAGE', 'SYSTEM'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: filterCategory === cat ? 'var(--primary)' : '#FFFFFF',
              color: filterCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No notifications in this category.
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = getCategoryIcon(n.type);
            const isHigh = n.severity === 'HIGH';

            return (
              <div
                key={n.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  backgroundColor: n.read ? '#FFFFFF' : '#EEF2FF',
                  borderColor: n.read ? 'var(--border)' : 'var(--primary-border)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: isHigh ? 'var(--bg-rose-light)' : 'var(--primary-light)',
                    color: isHigh ? 'var(--accent-rose)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {n.title}
                      </h4>
                      <span className={`badge ${isHigh ? 'badge-rose' : 'badge-amber'}`}>
                        {n.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markNotificationAsRead(n.id)}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--primary-border)'
                    }}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

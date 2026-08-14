import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Calendar,
  ClipboardCheck,
  FileSearch,
  Bell,
  TrendingUp,
  Settings,
  Sparkles,
  School
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  const { hasRole } = useAuth();
  const { unreadNotificationCount, unresolvedAlertCount } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: School },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'rooms', label: 'Rooms', icon: DoorOpen },
    { id: 'timetable', label: 'Smart Timetable', icon: Calendar, badge: 'SMART' },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'documents', label: 'AI Document Reader', icon: FileSearch, badge: 'OCR' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotificationCount },
    { id: 'staffing', label: 'Smart Staffing', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90
          }}
        />
      )}

      <aside style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'transform 0.25s ease'
      }} className={`sidebar-aside ${mobileOpen ? 'mobile-show' : ''}`}>
        {/* Brand Logo Header */}
        <div style={{
          height: '70px',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              EduMatrix<span style={{ color: 'var(--primary)' }}>.AI</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              SCHOOL OPERATIONS
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.5rem 0.75rem 0.25rem 0.75rem' }}>
            MANAGEMENT MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  margin: '0.2rem 0',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={19} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>

                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '99px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF'
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '99px',
                    backgroundColor: 'var(--accent-rose)',
                    color: '#FFFFFF'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: '#F8FAFC',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>EduMatrix v2.4 Pro</div>
          <div>All operations synced</div>
        </div>
      </aside>
    </>
  );
};

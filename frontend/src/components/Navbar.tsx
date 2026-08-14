import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Bell, Search, LogOut, UserCheck, Shield, Menu, X } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onNavigatePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, onNavigatePage }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { unreadNotificationCount, globalSearch, setGlobalSearch } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setShowRoleMenu(false);
    await switchDemoRole(role);
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Left: Mobile Toggle & Brand/Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <button
          onClick={onToggleMobileSidebar}
          style={{
            display: 'inline-flex',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'var(--text-secondary)'
          }}
          className="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search students, staff, rooms, documents..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.4rem',
              borderRadius: '99px',
              border: '1px solid var(--border)',
              backgroundColor: '#F8FAFC',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Right: Actions, Role Selector, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Static Authenticated Role Badge */}
        <div
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '99px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            border: '1px solid var(--primary-border)'
          }}
          title="Authenticated User Role"
        >
          <Shield size={14} />
          <span>ROLE: {user?.role.replace('_', ' ')}</span>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigatePage('notifications')}
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: '99px',
            color: 'var(--text-secondary)'
          }}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadNotificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: 'var(--accent-rose)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>

        {/* User Profile Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '0.5rem',
          borderLeft: '1px solid var(--border)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }} className="user-details-desktop">
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.email || 'admin@school.com'}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 0.75rem',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              marginLeft: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
            title="Sign Out / Change Account"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Classes } from './pages/Classes';
import { Subjects } from './pages/Subjects';
import { Rooms } from './pages/Rooms';
import { TimetablePage } from './pages/Timetable';
import { AttendancePage } from './pages/Attendance';
import { AIDocumentReader } from './pages/AIDocumentReader';
import { NotificationsPage } from './pages/Notifications';
import { SmartStaffingPage } from './pages/SmartStaffing';
import { SettingsPage } from './pages/Settings';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--primary)'
      }}>
        Initializing EduMatrix AI Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={(p) => setActivePage(p)} />;
      case 'students': return <Students />;
      case 'teachers': return <Teachers />;
      case 'classes': return <Classes />;
      case 'subjects': return <Subjects />;
      case 'rooms': return <Rooms />;
      case 'timetable': return <TimetablePage />;
      case 'attendance': return <AttendancePage />;
      case 'documents': return <AIDocumentReader />;
      case 'notifications': return <NotificationsPage />;
      case 'staffing': return <SmartStaffingPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard onNavigate={(p) => setActivePage(p)} />;
    }
  };

  return (
    <div className="layout-container">
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigatePage={(p) => setActivePage(p)}
        />

        <main className="content-body">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
};

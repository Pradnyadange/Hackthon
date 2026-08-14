import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { ActionAlerts } from '../components/ActionAlerts';
import { DashboardStats } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardCheck,
  DoorOpen,
  FileSearch,
  Bell,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { alerts, resolveAlert, showToast } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err: any) {
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        color: '#FFFFFF',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="#FDE047" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: '#C7D2FE' }}>
              INTELLIGENT SCHOOL OPERATIONS PLATFORM
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
            Welcome to EduMatrix Operations Center
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#E0E7FF', marginTop: '0.25rem', maxWidth: '620px' }}>
            AI-powered document intelligence + constraint-based timetable optimization + proactive operations monitoring.
          </p>
        </div>

        <button
          onClick={() => onNavigate('timetable')}
          style={{
            backgroundColor: '#FFFFFF',
            color: 'var(--primary)',
            fontWeight: 800,
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Calendar size={18} />
          <span>Smart Timetable Generator</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 50}
          subtitle="Enrolled active students"
          icon={Users}
          color="primary"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 15}
          subtitle="Faculty across departments"
          icon={GraduationCap}
          color="emerald"
          onClick={() => onNavigate('teachers')}
        />
        <StatCard
          title="Active Classes"
          value={stats?.totalClasses || 5}
          subtitle="Academic class divisions"
          icon={School}
          color="sky"
          onClick={() => onNavigate('classes')}
        />
        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects || 8}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="amber"
          onClick={() => onNavigate('subjects')}
        />
        <StatCard
          title="Attendance Today"
          value={`${stats?.attendanceTodayPercentage || 94}%`}
          subtitle="Class attendance rate"
          icon={ClipboardCheck}
          color="emerald"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          title="Available Rooms"
          value={stats?.activeRooms || 10}
          subtitle="Classrooms & laboratories"
          icon={DoorOpen}
          color="sky"
          onClick={() => onNavigate('rooms')}
        />
        <StatCard
          title="Pending Documents"
          value={stats?.pendingDocuments || 2}
          subtitle="Awaiting OCR verification"
          icon={FileSearch}
          color="rose"
          onClick={() => onNavigate('documents')}
        />
        <StatCard
          title="Unread Alerts"
          value={stats?.unreadNotifications || 2}
          subtitle="System notifications"
          icon={Bell}
          color="amber"
          onClick={() => onNavigate('notifications')}
        />
      </div>

      {/* Proactive Action Required Alert Section */}
      <ActionAlerts
        alerts={alerts}
        onResolve={resolveAlert}
        onNavigate={onNavigate}
      />

      {/* Quick Operations Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div
          onClick={() => onNavigate('timetable')}
          className="card"
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Smart Timetable Generator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Automatically generate conflict-free weekly schedules using constraint optimization.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Open Scheduler</span>
            <ArrowRight size={16} />
          </div>
        </div>

        <div
          onClick={() => onNavigate('documents')}
          className="card"
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-sky-light)',
              color: 'var(--text-sky)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <FileSearch size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              AI Document Reader & OCR
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Digitize physical paper forms into structured database records with automated field extraction and review.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', color: 'var(--text-sky)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Digitize Documents</span>
            <ArrowRight size={16} />
          </div>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="card"
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-emerald-light)',
              color: 'var(--text-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <ClipboardCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Attendance & Auto-RFID
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Log daily attendance, trigger low-attendance warnings (&lt;75%), and simulate RFID card scanning.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1.25rem', color: 'var(--text-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>
            <span>Track Attendance</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

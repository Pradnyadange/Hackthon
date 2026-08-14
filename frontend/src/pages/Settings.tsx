import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Settings, Save, Shield, Database, Bell, Server } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useApp();

  const [schoolName, setSchoolName] = useState('EduMatrix International Academy');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform operational settings saved successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Settings size={26} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System & School Settings
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Manage school profile, attendance threshold parameters, and backend configurations
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* General Settings */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            School Profile Parameters
          </h3>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label>Institution Name</label>
              <input
                type="text"
                className="form-control"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Current Academic Session</label>
              <input
                type="text"
                className="form-control"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Low Attendance Warning (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Periods / Day</label>
                <input
                  type="number"
                  className="form-control"
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>

        {/* Database & API System Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Database & API Specifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} color="var(--primary)" />
                Database ORM
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                PostgreSQL / Prisma ORM Persistence (Active Session)
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={16} color="var(--accent-emerald)" />
                Swagger API Documentation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                OpenAPI Specification live at <a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>/api/docs</a>
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="var(--accent-amber)" />
                Active Authenticated Account
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {user?.name} ({user?.role}) — {user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

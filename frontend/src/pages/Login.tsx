import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState('schooladmin@school.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setErrorMsg('');
    try {
      await switchDemoRole(role);
      showToast(`Logged in as ${role.replace('_', ' ')}`, 'success');
    } catch (err: any) {
      setErrorMsg('Failed to log in with demo account.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            EduMatrix<span style={{ color: 'var(--primary)' }}>.AI</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Intelligent School Operations Platform
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-rose-light)',
            color: 'var(--text-rose)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            border: '1px solid #FCA5A5'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="schooladmin@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>

          {/* Hackathon Judge Quick Role Sign-in */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
              HACKATHON DEMO SIGN-IN
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('SCHOOL_ADMIN')}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.775rem', padding: '0.5rem' }}
              >
                🏫 School Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('SUPER_ADMIN')}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.775rem', padding: '0.5rem' }}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('TEACHER')}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.775rem', padding: '0.5rem' }}
              >
                👨‍🏫 Teacher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

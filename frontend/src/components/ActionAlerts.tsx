import React from 'react';
import { AlertTriangle, ShieldAlert, FileText, Calendar, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SystemAlert } from '../types';

interface ActionAlertsProps {
  alerts: SystemAlert[];
  onResolve: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const ActionAlerts: React.FC<ActionAlertsProps> = ({ alerts, onResolve, onNavigate }) => {
  if (alerts.length === 0) {
    return (
      <div className="card" style={{
        textAlign: 'center',
        padding: '2rem 1.5rem',
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle2 size={26} />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#047857' }}>
          All Systems Operational
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#065F46', maxWidth: '400px' }}>
          Zero operational conflicts detected. All schedules, room allocations, document queues, and attendance metrics are optimal.
        </p>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'PENDING_DOCUMENT': return FileText;
      case 'TIMETABLE_ISSUE':
      case 'TEACHER_CONFLICT':
      case 'ROOM_CONFLICT': return Calendar;
      case 'LOW_ATTENDANCE': return Users;
      default: return AlertTriangle;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="var(--accent-rose)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Action Required ({alerts.length})
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          PROACTIVE ALERT ENGINE
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const isHigh = alert.severity === 'HIGH';

          return (
            <div
              key={alert.id}
              className="card"
              style={{
                borderLeft: `4px solid ${isHigh ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                backgroundColor: isHigh ? '#FEF2F2' : '#FFFBEB',
                borderColor: isHigh ? '#FCA5A5' : '#FDE68A'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={`badge ${isHigh ? 'badge-rose' : 'badge-amber'}`}>
                    {alert.severity} SEVERITY
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: isHigh ? 'var(--accent-rose)' : 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {alert.title}
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  onClick={() => onResolve(alert.id)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px'
                  }}
                >
                  Dismiss
                </button>

                <button
                  onClick={() => {
                    if (alert.actionUrl) {
                      onNavigate(alert.actionUrl.replace('/', ''));
                    }
                  }}
                  className="btn-primary"
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    backgroundColor: isHigh ? 'var(--accent-rose)' : 'var(--primary)'
                  }}
                >
                  <span>{alert.actionLabel || 'Resolve Conflict'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

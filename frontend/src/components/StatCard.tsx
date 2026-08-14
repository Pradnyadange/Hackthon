import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'emerald' | 'amber' | 'sky' | 'rose';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  onClick
}) => {
  const colorMap = {
    primary: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary-border)' },
    emerald: { bg: 'var(--bg-emerald-light)', text: 'var(--text-emerald)', border: '#A7F3D0' },
    amber: { bg: 'var(--bg-amber-light)', text: 'var(--text-amber)', border: '#FDE68A' },
    sky: { bg: 'var(--bg-sky-light)', text: 'var(--text-sky)', border: '#BAE6FD' },
    rose: { bg: 'var(--bg-rose-light)', text: 'var(--text-rose)', border: '#FCA5A5' }
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: scheme.bg,
          color: scheme.text,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={22} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scheme.text }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

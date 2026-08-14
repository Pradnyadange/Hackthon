import React from 'react';
import { TrendingUp, AlertTriangle, Users, BookOpen } from 'lucide-react';

interface StaffingInsightsProps {
  insights: any;
}

export const StaffingInsights: React.FC<StaffingInsightsProps> = ({ insights }) => {
  if (!insights) return null;

  const { summary, departmentAnalysis, teacherWorkloads } = insights;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL TEACHING STAFF</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {summary.totalTeachers} Staff
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-emerald)', fontWeight: 600, marginTop: '0.25rem' }}>
            Active across departments
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUBJECT SHORTAGES</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: summary.departmentsWithShortage > 0 ? 'var(--accent-amber)' : 'var(--text-emerald)', marginTop: '0.25rem' }}>
            {summary.departmentsWithShortage} Subjects
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Require additional staff hiring
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG WORKLOAD UTILIZATION</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {summary.averageWorkload}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Based on 25 period max load
          </div>
        </div>
      </div>

      {/* Staffing Demand Predictions Grid */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Subject Teacher Demand vs Capacity
          </h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Current Teachers</th>
                <th>Required Teachers</th>
                <th>Weekly Periods Needed</th>
                <th>Shortage / Surplus</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentAnalysis.map((dept: any) => (
                <tr key={dept.subjectId}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept.subjectName}</td>
                  <td>{dept.currentTeachers}</td>
                  <td>{dept.requiredTeachers}</td>
                  <td>{dept.weeklyPeriodsNeeded} hrs</td>
                  <td style={{ fontWeight: 700, color: dept.shortage > 0 ? 'var(--accent-rose)' : 'var(--text-emerald)' }}>
                    {dept.shortage > 0 ? `-${dept.shortage} Shortage` : 'Adequate'}
                  </td>
                  <td>
                    <span className={`badge ${dept.shortage > 0 ? 'badge-amber' : 'badge-emerald'}`}>
                      {dept.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Workload Distribution */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Individual Teacher Workload Allocation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {teacherWorkloads.map((t: any) => (
            <div key={t.teacherId} style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.department}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Assigned: {t.assignedPeriods} / {t.maxCapacity} weekly periods ({t.utilizationPercentage}%)
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '99px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(t.utilizationPercentage, 100)}%`,
                  backgroundColor: t.utilizationPercentage > 90 ? 'var(--accent-rose)' : 'var(--primary)',
                  borderRadius: '99px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

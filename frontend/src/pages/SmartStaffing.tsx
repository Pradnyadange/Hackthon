import React, { useState, useEffect } from 'react';
import { StaffingInsights } from '../components/StaffingInsights';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { TrendingUp, RefreshCw } from 'lucide-react';

export const SmartStaffingPage: React.FC = () => {
  const { showToast } = useApp();
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStaffingData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/staffing/insights');
      setInsights(res.data);
    } catch (err: any) {
      showToast('Failed to load staffing insights', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffingData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Smart Staffing & Predictive Hiring Demand
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Historical workload distribution, faculty utilization, and subject shortage predictions
            </p>
          </div>
        </div>

        <button onClick={fetchStaffingData} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Recalculate Insights</span>
        </button>
      </div>

      <StaffingInsights insights={insights} />
    </div>
  );
};

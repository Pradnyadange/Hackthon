import React, { useState, useEffect } from 'react';
import { AttendanceMatrix } from '../components/AttendanceMatrix';
import { Class } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export const AttendancePage: React.FC = () => {
  const { showToast } = useApp();
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data || []);
      } catch (err: any) {
        showToast('Failed to load classes for attendance', 'error');
      }
    };
    fetchClasses();
  }, []);

  return <AttendanceMatrix classes={classes} showToast={showToast} />;
};

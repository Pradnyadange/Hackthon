import React, { useState, useEffect } from 'react';
import { Class, AttendanceRecord } from '../types';
import { api } from '../services/api';
import { ClipboardCheck, Save, Radio, Check, X, Clock, AlertTriangle } from 'lucide-react';

interface AttendanceMatrixProps {
  classes: Class[];
  showToast: (text: string, type?: any) => void;
}

export const AttendanceMatrix: React.FC<AttendanceMatrixProps> = ({ classes, showToast }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentsAttendance, setStudentsAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // RFID Simulator State
  const [rfidInput, setRfidInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const fetchAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance?classId=${selectedClassId}&date=${selectedDate}`);
      setStudentsAttendance(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load class attendance', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  const handleStatusToggle = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudentsAttendance(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      await api.post('/attendance', {
        classId: selectedClassId,
        date: selectedDate,
        records: studentsAttendance.map(s => ({ studentId: s.studentId, status: s.status }))
      });
      showToast('Attendance records saved persistently to database!', 'success');
      await fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateRfidScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;
    setIsScanning(true);
    try {
      const res = await api.post('/attendance/rfid-scan', {
        rfidCode: rfidInput.trim(),
        status: 'PRESENT'
      });
      showToast(res.data.message || 'Auto-Attendance scan logged!', 'success');
      setRfidInput('');
      await fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'RFID Code not recognized', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const total = studentsAttendance.length;
  const presentCount = studentsAttendance.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length;
  const absentCount = studentsAttendance.filter(s => s.status === 'ABSENT').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Filter Bar & RFID Scan Simulator */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Daily Class Attendance
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontWeight: 700 }}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>Class {c.grade}-{c.division}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontWeight: 600 }}
            />
          </div>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="btn-primary"
          style={{ backgroundColor: 'var(--accent-emerald)' }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Attendance to Database'}</span>
        </button>
      </div>

      {/* Summary KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLASS ATTENDANCE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{attendanceRate}%</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-emerald-light)', color: 'var(--text-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRESENT / LATE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-emerald)' }}>{presentCount} / {total}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-rose-light)', color: 'var(--text-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ABSENT STUDENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-rose)' }}>{absentCount}</div>
          </div>
        </div>

        {/* RFID Hardware Simulation Card */}
        <div className="card" style={{ padding: '1rem', backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <Radio size={16} color="var(--accent-sky)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sky)' }}>
              RFID AUTO-ATTENDANCE SIMULATOR
            </span>
          </div>

          <form onSubmit={handleSimulateRfidScan} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Scan/Type Student ID (e.g. STU-2026-1001)"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              className="form-control"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Scan RFID
            </button>
          </form>
        </div>
      </div>

      {/* Attendance Grid Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Roll</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th style={{ textAlign: 'center' }}>Attendance Status Toggle</th>
            </tr>
          </thead>
          <tbody>
            {studentsAttendance.map((st) => (
              <tr key={st.studentId}>
                <td style={{ fontWeight: 700 }}>#{st.rollNumber}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{st.studentCode}</td>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.studentName}</td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleStatusToggle(st.studentId, 'PRESENT')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: st.status === 'PRESENT' ? 'var(--accent-emerald)' : 'var(--border)',
                        backgroundColor: st.status === 'PRESENT' ? 'var(--bg-emerald-light)' : '#FFFFFF',
                        color: st.status === 'PRESENT' ? 'var(--text-emerald)' : 'var(--text-muted)'
                      }}
                    >
                      Present
                    </button>

                    <button
                      onClick={() => handleStatusToggle(st.studentId, 'ABSENT')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: st.status === 'ABSENT' ? 'var(--accent-rose)' : 'var(--border)',
                        backgroundColor: st.status === 'ABSENT' ? 'var(--bg-rose-light)' : '#FFFFFF',
                        color: st.status === 'ABSENT' ? 'var(--text-rose)' : 'var(--text-muted)'
                      }}
                    >
                      Absent
                    </button>

                    <button
                      onClick={() => handleStatusToggle(st.studentId, 'LATE')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: st.status === 'LATE' ? 'var(--accent-amber)' : 'var(--border)',
                        backgroundColor: st.status === 'LATE' ? 'var(--bg-amber-light)' : '#FFFFFF',
                        color: st.status === 'LATE' ? 'var(--text-amber)' : 'var(--text-muted)'
                      }}
                    >
                      Late
                    </button>

                    <button
                      onClick={() => handleStatusToggle(st.studentId, 'EXCUSED')}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: st.status === 'EXCUSED' ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: st.status === 'EXCUSED' ? 'var(--primary-light)' : '#FFFFFF',
                        color: st.status === 'EXCUSED' ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      Excused
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

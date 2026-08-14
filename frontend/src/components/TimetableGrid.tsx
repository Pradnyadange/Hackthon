import React, { useState } from 'react';
import { TimetableEntry, ConflictItem, Class, Subject, Teacher, Room } from '../types';
import { Calendar, AlertOctagon, RefreshCw, CheckCircle, Edit3, Sparkles, Cpu, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface TimetableGridProps {
  entries: TimetableEntry[];
  conflicts: ConflictItem[];
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onGenerateTimetable: () => Promise<void>;
  onSimulateConflict?: () => void;
  onSaveSlot: (slotData: Partial<TimetableEntry>) => Promise<void>;
  isGenerating: boolean;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  conflicts,
  classes,
  subjects,
  teachers,
  rooms,
  selectedClassId,
  onSelectClass,
  onGenerateTimetable,
  onSimulateConflict,
  onSaveSlot,
  isGenerating
}) => {
  const [activeMobileDay, setActiveMobileDay] = useState<string>('MONDAY');
  const [showAlgoInfo, setShowAlgoInfo] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ day: string; period: number; existingEntry?: TimetableEntry } | null>(null);

  // Form states for manual slot editing
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editRoomId, setEditRoomId] = useState('');

  const getSlotEntry = (day: string, period: number) => {
    return entries.find(e => e.day === day && e.period === period);
  };

  const getSlotConflict = (day: string, period: number) => {
    return conflicts.find(c => c.day === day && c.period === period);
  };

  const openSlotEditor = (day: string, period: number) => {
    const existing = getSlotEntry(day, period);
    setEditingCell({ day, period, existingEntry: existing });
    setEditSubjectId(existing?.subjectId || (subjects[0]?.id || ''));
    setEditTeacherId(existing?.teacherId || (teachers[0]?.id || ''));
    setEditRoomId(existing?.roomId || (rooms[0]?.id || ''));
  };

  const handleSaveSlotModal = async () => {
    if (!editingCell) return;
    await onSaveSlot({
      id: editingCell.existingEntry?.id,
      classId: selectedClassId,
      day: editingCell.day as any,
      period: editingCell.period,
      subjectId: editSubjectId,
      teacherId: editTeacherId,
      roomId: editRoomId
    });
    setEditingCell(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header controls & Class Selector */}
      <div className="card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Smart Constraint-Based Timetable Generator
            </h2>
          </div>

          <select
            value={selectedClassId}
            onChange={(e) => onSelectClass(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: '#FFFFFF',
              fontWeight: 700,
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class {c.grade}-{c.division} (Year {c.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {conflicts.length > 0 ? (
            <span className="badge badge-rose" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>
              <AlertOctagon size={14} />
              🔴 {conflicts.length} Conflict(s) Detected
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>
              <CheckCircle size={14} />
              🟢 0 Conflicts (Optimized)
            </span>
          )}

          <button
            onClick={onGenerateTimetable}
            disabled={isGenerating}
            className="btn-primary"
            style={{ opacity: isGenerating ? 0.7 : 1 }}
          >
            <RefreshCw size={16} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Solving Constraints...' : conflicts.length > 0 ? 'Resolve Conflict' : 'Generate Smart Timetable'}</span>
          </button>

          <button
            onClick={() => setShowAlgoInfo(!showAlgoInfo)}
            className="btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '8px' }}
            title="Algorithm Specs"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Algorithm Specs Info Panel */}
      {showAlgoInfo && (
        <div className="card" style={{ backgroundColor: '#F8FAFC', borderColor: 'var(--primary-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Cpu size={18} />
            <span>CONSTRAINT SATISFACTION TIMETABLE ENGINE ALGORITHM</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            The timetable engine implements a deterministic constraint satisfaction algorithm evaluating 6 operational dimensions:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.775rem', fontWeight: 600 }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Teacher Double-Booking Check
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Classroom Double-Booking Check
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Class Double-Booking Avoidance
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Room Capacity vs Class Size
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Weekly Subject Period Quotas
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--border)' }}>
              ✓ Teacher Schedule Availability
            </div>
          </div>
        </div>
      )}

      {/* Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '2px solid var(--accent-rose)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-rose)', fontWeight: 800 }}>
              <AlertOctagon size={20} />
              <span>🔴 TIMETABLE CONFLICTS DETECTED ({conflicts.length})</span>
            </div>
            <button
              onClick={onGenerateTimetable}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', backgroundColor: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
            >
              <Sparkles size={14} />
              <span>Resolve Conflict with Constraint Solver</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {conflicts.map((conf, idx) => (
              <div
                key={conf.id || idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FCA5A5',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ color: 'var(--accent-rose)', fontWeight: 800 }}>🚨 {conf.type.replace('_', ' ')}:</span>
                <span>{conf.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="table-container desktop-timetable">
        <table className="data-table" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '100px', textAlign: 'center' }}>Time / Slot</th>
              {DAYS.map(day => (
                <th key={day} style={{ textAlign: 'center' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period}>
                <td style={{
                  textAlign: 'center',
                  fontWeight: 700,
                  backgroundColor: '#F8FAFC',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  Period {period}<br />
                  <span style={{ fontWeight: 400, fontSize: '0.7rem' }}>
                    {8 + period}:00 AM
                  </span>
                </td>

                {DAYS.map(day => {
                  const entry = getSlotEntry(day, period);
                  const conflict = getSlotConflict(day, period);

                  return (
                    <td
                      key={day}
                      onClick={() => openSlotEditor(day, period)}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        backgroundColor: conflict ? '#FEF2F2' : entry ? '#FFFFFF' : '#FAFAFA',
                        border: conflict ? '2px solid var(--accent-rose)' : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                        height: '90px',
                        verticalAlign: 'top'
                      }}
                    >
                      {entry ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.825rem',
                              color: conflict ? 'var(--accent-rose)' : 'var(--primary)'
                            }}>
                              {entry.subject?.name || 'Subject'}
                            </span>
                            <Edit3 size={12} color="var(--text-muted)" />
                          </div>

                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            👨‍🏫 {entry.teacher?.name || 'Unassigned'}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>🏛️ {entry.room?.roomName || entry.room?.roomNumber || 'Room'}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>P{period}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#CBD5E1',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          + Add Slot
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Day View Card Layout */}
      <div className="mobile-timetable">
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveMobileDay(day)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: activeMobileDay === day ? 'var(--primary)' : '#FFFFFF',
                color: activeMobileDay === day ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
          {PERIODS.map(period => {
            const entry = getSlotEntry(activeMobileDay, period);
            const conflict = getSlotConflict(activeMobileDay, period);

            return (
              <div
                key={period}
                onClick={() => openSlotEditor(activeMobileDay, period)}
                className="card"
                style={{
                  padding: '1rem',
                  borderLeft: conflict ? '4px solid var(--accent-rose)' : '4px solid var(--primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Period {period} ({8 + period}:00 AM)
                  </span>
                  <span className="badge badge-sky">Day View</span>
                </div>

                {entry ? (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {entry.subject?.name}
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Teacher: {entry.teacher?.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Room: {entry.room?.roomName} ({entry.room?.roomNumber})
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Unscheduled period slot — Tap to assign
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Slot Editing Modal */}
      {editingCell && (
        <div className="modal-overlay" onClick={() => setEditingCell(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Edit Period Slot ({editingCell.day} - Period {editingCell.period})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Manually assign or swap subject, teacher, and room for this period slot.
            </p>

            <div className="form-group">
              <label>Select Subject</label>
              <select
                className="form-control"
                value={editSubjectId}
                onChange={(e) => setEditSubjectId(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned Teacher</label>
              <select
                className="form-control"
                value={editTeacherId}
                onChange={(e) => setEditTeacherId(e.target.value)}
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.department}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned Room</label>
              <select
                className="form-control"
                value={editRoomId}
                onChange={(e) => setEditRoomId(e.target.value)}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomName} ({r.roomNumber}) — Cap: {r.capacity}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setEditingCell(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveSlotModal}
              >
                Save Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

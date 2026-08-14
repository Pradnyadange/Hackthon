import React, { useState, useEffect } from 'react';
import { Class, Teacher, Room } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { School, Plus, Edit, Trash2, Users, DoorOpen, GraduationCap } from 'lucide-react';

export const Classes: React.FC = () => {
  const { showToast } = useApp();
  const { hasRole } = useAuth();

  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [formData, setFormData] = useState({
    grade: '10',
    division: 'A',
    academicYear: '2026-2027',
    classTeacherId: '',
    roomId: ''
  });

  const fetchClasses = async () => {
    try {
      const [clsRes, tchRes, rmRes] = await Promise.all([
        api.get('/classes'),
        api.get('/teachers'),
        api.get('/rooms')
      ]);
      setClasses(clsRes.data || []);
      setTeachers(tchRes.data || []);
      setRooms(rmRes.data || []);
    } catch (err: any) {
      showToast('Failed to load class divisions', 'error');
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      showToast('New class division created!', 'success');
      setShowAddModal(false);
      fetchClasses();
    } catch (err: any) {
      showToast(err.message || 'Failed to create class', 'error');
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      await api.put(`/classes/${editingClass.id}`, formData);
      showToast('Class assignment updated successfully!', 'success');
      setEditingClass(null);
      fetchClasses();
    } catch (err: any) {
      showToast(err.message || 'Failed to update class', 'error');
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(`Delete class ${name}?`)) return;
    try {
      await api.delete(`/classes/${id}`);
      showToast(`Class ${name} deleted.`, 'info');
      fetchClasses();
    } catch (err: any) {
      showToast('Failed to delete class', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <School size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Class Divisions
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {classes.length} active classes with teacher & room assignments
            </p>
          </div>
        </div>

        {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
          <button onClick={() => {
            setFormData({
              grade: '10',
              division: 'A',
              academicYear: '2026-2027',
              classTeacherId: teachers[0]?.id || '',
              roomId: rooms[0]?.id || ''
            });
            setShowAddModal(true);
          }} className="btn-primary">
            <Plus size={16} />
            <span>Create Class</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {classes.map((cls) => (
          <div key={cls.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Class {cls.grade}-{cls.division}
                </h3>
                <span className="badge badge-sky">Year {cls.academicYear}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={16} color="var(--text-muted)" />
                  <span><strong>Class Teacher:</strong> {cls.classTeacher?.name || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DoorOpen size={16} color="var(--text-muted)" />
                  <span><strong>Assigned Room:</strong> {cls.room ? `${cls.room.roomName} (${cls.room.roomNumber})` : 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--text-muted)" />
                  <span><strong>Enrolled Students:</strong> {cls._count?.students || 10} Students</span>
                </div>
              </div>
            </div>

            {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => {
                    setEditingClass(cls);
                    setFormData({
                      grade: cls.grade,
                      division: cls.division,
                      academicYear: cls.academicYear,
                      classTeacherId: cls.classTeacherId || '',
                      roomId: cls.roomId || ''
                    });
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClass(cls.id, `${cls.grade}-${cls.division}`)}
                  className="btn-danger"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Class Modal */}
      {(showAddModal || editingClass) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingClass(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingClass ? 'Edit Class Assignment' : 'Create Class Division'}
            </h3>

            <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Grade (e.g. 10)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Division (e.g. A)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Academic Year</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Class Teacher</label>
                <select
                  className="form-control"
                  value={formData.classTeacherId}
                  onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                >
                  <option value="">None (Unassigned)</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Classroom</label>
                <select
                  className="form-control"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                >
                  <option value="">None (Unassigned)</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.roomName} ({r.roomNumber})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setEditingClass(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

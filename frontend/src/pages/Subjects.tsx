import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Edit, Trash2, Clock } from 'lucide-react';

export const Subjects: React.FC = () => {
  const { showToast } = useApp();
  const { hasRole } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    weeklyPeriods: 5
  });

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data || []);
    } catch (err: any) {
      showToast('Failed to load subjects catalog', 'error');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, formData);
        showToast('Subject updated successfully!', 'success');
      } else {
        await api.post('/subjects', formData);
        showToast('New subject created!', 'success');
      }
      setShowAddModal(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete subject ${name}?`)) return;
    try {
      await api.delete(`/subjects/${id}`);
      showToast(`Subject ${name} deleted.`, 'info');
      fetchSubjects();
    } catch (err: any) {
      showToast('Failed to delete subject', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Curriculum Subjects
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {subjects.length} subjects configured with weekly period quotas
            </p>
          </div>
        </div>

        {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
          <button onClick={() => {
            setFormData({ name: '', code: '', weeklyPeriods: 5 });
            setShowAddModal(true);
          }} className="btn-primary">
            <Plus size={16} />
            <span>Add New Subject</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {subjects.map((sub) => (
          <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {sub.name}
                </h3>
                <span className="badge badge-primary">{sub.code}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} color="var(--primary)" />
                <span><strong>Target Quota:</strong> {sub.weeklyPeriods} Periods / Week</span>
              </div>
            </div>

            {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => {
                    setEditingSubject(sub);
                    setFormData({ name: sub.name, code: sub.code, weeklyPeriods: sub.weeklyPeriods });
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(sub.id, sub.name)}
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

      {(showAddModal || editingSubject) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingSubject(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Weekly Periods Required</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="form-control"
                    value={formData.weeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, weeklyPeriods: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setEditingSubject(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

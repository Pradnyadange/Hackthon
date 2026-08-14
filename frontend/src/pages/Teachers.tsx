import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserPlus, Search, Edit, Trash2, Calendar, Phone, Mail, BookOpen } from 'lucide-react';

export const Teachers: React.FC = () => {
  const { showToast } = useApp();
  const { hasRole } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    subjects: 'Mathematics',
    qualifications: 'M.Sc, B.Ed'
  });

  const fetchTeachers = async () => {
    try {
      let query = `/teachers?search=${encodeURIComponent(search)}`;
      if (selectedDept) query += `&department=${selectedDept}`;
      const res = await api.get(query);
      setTeachers(res.data || []);
    } catch (err: any) {
      showToast('Failed to load teachers', 'error');
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, selectedDept]);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teachers', formData);
      showToast('New faculty member added to database!', 'success');
      setShowAddModal(false);
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create teacher', 'error');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      await api.put(`/teachers/${editingTeacher.id}`, formData);
      showToast('Teacher profile updated successfully!', 'success');
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update teacher', 'error');
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete teacher ${name}?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      showToast(`Teacher ${name} deleted from database.`, 'info');
      fetchTeachers();
    } catch (err: any) {
      showToast('Failed to delete teacher', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Faculty & Staff Directory
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {teachers.length} teaching staff members persisted in PostgreSQL
            </p>
          </div>
        </div>

        {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
          <button onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '+91 98765 00000',
              department: 'Mathematics',
              subjects: 'Mathematics',
              qualifications: 'M.Sc, B.Ed'
            });
            setShowAddModal(true);
          }} className="btn-primary">
            <UserPlus size={16} />
            <span>Add New Teacher</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by teacher name, department, subjects..."
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', fontWeight: 600 }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="English">English</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Biology">Biology</option>
          <option value="Social Studies">Social Studies</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {/* Teacher Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {teachers.map((t) => (
          <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {t.name}
                    </h3>
                    <span className="badge badge-sky">{t.teacherId}</span>
                  </div>
                </div>

                <span className="badge badge-primary">{t.department}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={14} color="var(--text-muted)" />
                  <span><strong>Subjects:</strong> {t.subjects}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{t.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span>{t.phone}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t.qualifications}
              </span>

              {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingTeacher(t);
                      setFormData({
                        name: t.name,
                        email: t.email,
                        phone: t.phone,
                        department: t.department,
                        subjects: t.subjects,
                        qualifications: t.qualifications
                      });
                    }}
                    style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingTeacher) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingTeacher(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              {editingTeacher ? 'Edit Teacher Record' : 'Add New Teacher'}
            </h3>

            <form onSubmit={editingTeacher ? handleUpdateTeacher : handleCreateTeacher}>
              <div className="form-group">
                <label>Full Name *</label>
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
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Biology">Biology</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subjects Taught</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Qualifications</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setEditingTeacher(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

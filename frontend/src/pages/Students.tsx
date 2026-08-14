import React, { useState, useEffect } from 'react';
import { Student, Class } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';

export const Students: React.FC = () => {
  const { showToast } = useApp();
  const { hasRole } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    dateOfBirth: '2011-05-15',
    gender: 'Male',
    classId: '',
    division: 'A',
    rollNumber: '1',
    parentName: '',
    parentPhone: '',
    email: '',
    address: 'Sector 4, Metro City',
    emergencyContact: ''
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      let query = `/students?search=${encodeURIComponent(search)}`;
      if (selectedClassId) query += `&classId=${selectedClassId}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;

      const [stRes, clsRes] = await Promise.all([
        api.get(query),
        api.get('/classes')
      ]);

      setStudents(stRes.data.data || []);
      setClasses(clsRes.data || []);
      if (!formData.classId && clsRes.data.length > 0) {
        setFormData((prev: any) => ({ ...prev, classId: clsRes.data[0].id }));
      }
    } catch (err: any) {
      showToast('Failed to load students directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClassId, selectedStatus]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      showToast('New student created and persisted to database!', 'success');
      setShowAddModal(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create student', 'error');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await api.put(`/students/${editingStudent.id}`, formData);
      showToast('Student updated successfully in database!', 'success');
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to update student', 'error');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}?`)) return;
    try {
      await api.delete(`/students/${id}`);
      showToast(`Student ${name} deleted from database.`, 'info');
      fetchStudents();
    } catch (err: any) {
      showToast('Failed to delete student', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Student Code,First Name,Last Name,Class,Parent Name,Parent Phone,Email\n';
    const rows = students.map(s =>
      `"${s.id}","${s.studentId}","${s.firstName}","${s.lastName}","${s.class ? s.class.grade + '-' + s.class.division : ''}","${s.parentName}","${s.parentPhone}","${s.email || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduMatrix_Students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Students directory exported to CSV!', 'success');
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      classId: student.classId,
      division: student.division,
      rollNumber: student.rollNumber,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      email: student.email || '',
      address: student.address,
      emergencyContact: student.emergencyContact
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Controls */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={24} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Student Records Directory
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total {students.length} active students persisted in PostgreSQL database
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
            <button onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                dateOfBirth: '2011-05-15',
                gender: 'Male',
                classId: classes[0]?.id || '',
                division: 'A',
                rollNumber: '1',
                parentName: '',
                parentPhone: '',
                email: '',
                address: 'Sector 4, Metro City',
                emergencyContact: ''
              });
              setShowAddModal(true);
            }} className="btn-primary">
              <UserPlus size={16} />
              <span>Add New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, student code, email..."
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', fontWeight: 600 }}
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>Class {c.grade}-{c.division}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', fontWeight: 600 }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Roll #</th>
              <th>Parent / Guardian</th>
              <th>Phone</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No student records match your query.
                </td>
              </tr>
            ) : (
              students.map((st) => (
                <tr key={st.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{st.studentId}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.firstName} {st.lastName}
                  </td>
                  <td>
                    <span className="badge badge-sky">
                      Class {st.class ? `${st.class.grade}-${st.class.division}` : st.division}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>#{st.rollNumber}</td>
                  <td>{st.parentName}</td>
                  <td style={{ fontSize: '0.85rem' }}>{st.parentPhone}</td>
                  <td>
                    <span className={`badge ${st.status === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
                      {st.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                      <button
                        onClick={() => setViewingStudent(st)}
                        style={{ padding: '0.35rem', color: 'var(--primary)', borderRadius: '6px' }}
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </button>

                      {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
                        <>
                          <button
                            onClick={() => openEditModal(st)}
                            style={{ padding: '0.35rem', color: 'var(--text-secondary)', borderRadius: '6px' }}
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id, `${st.firstName} ${st.lastName}`)}
                            style={{ padding: '0.35rem', color: 'var(--accent-rose)', borderRadius: '6px' }}
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingStudent(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              {editingStudent ? 'Edit Student Record' : 'Add New Student'}
            </h3>

            <form onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Class Assignment *</label>
                  <select
                    className="form-control"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Class {c.grade}-{c.division}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="form-control"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Parent Phone Number *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Student Email (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Residential Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setEditingStudent(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {viewingStudent.firstName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewingStudent.firstName} {viewingStudent.lastName}
                </h3>
                <span className="badge badge-primary">{viewingStudent.studentId}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div><strong>Class:</strong> {viewingStudent.class ? `${viewingStudent.class.grade}-${viewingStudent.class.division}` : viewingStudent.division}</div>
              <div><strong>Roll Number:</strong> #{viewingStudent.rollNumber}</div>
              <div><strong>Gender:</strong> {viewingStudent.gender}</div>
              <div><strong>Date of Birth:</strong> {viewingStudent.dateOfBirth}</div>
              <div><strong>Parent Name:</strong> {viewingStudent.parentName}</div>
              <div><strong>Parent Phone:</strong> {viewingStudent.parentPhone}</div>
              <div><strong>Email:</strong> {viewingStudent.email || 'N/A'}</div>
              <div><strong>Address:</strong> {viewingStudent.address}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setViewingStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

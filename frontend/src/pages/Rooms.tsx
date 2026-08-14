import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DoorOpen, Plus, Edit, Trash2, Users, Wrench } from 'lucide-react';

export const Rooms: React.FC = () => {
  const { showToast } = useApp();
  const { hasRole } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    roomNumber: '105',
    roomName: 'Classroom 105',
    capacity: 45,
    type: 'Classroom',
    availableEquipment: 'Smartboard, Whiteboard'
  });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data || []);
    } catch (err: any) {
      showToast('Failed to load room inventory', 'error');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
        showToast('Room specs updated successfully!', 'success');
      } else {
        await api.post('/rooms', formData);
        showToast('New room added to inventory!', 'success');
      }
      setShowAddModal(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete room ${name}?`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      showToast(`Room ${name} deleted.`, 'info');
      fetchRooms();
    } catch (err: any) {
      showToast('Failed to delete room', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DoorOpen size={26} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rooms & Facilities Inventory
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {rooms.length} registered classrooms, laboratories, and halls
            </p>
          </div>
        </div>

        {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
          <button onClick={() => {
            setFormData({
              roomNumber: `${Math.floor(105 + Math.random() * 50)}`,
              roomName: 'Classroom',
              capacity: 45,
              type: 'Classroom',
              availableEquipment: 'Smartboard, Whiteboard'
            });
            setShowAddModal(true);
          }} className="btn-primary">
            <Plus size={16} />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {rooms.map((rm) => (
          <div key={rm.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {rm.roomName}
                </h3>
                <span className="badge badge-sky">{rm.roomNumber}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--primary)" />
                  <span><strong>Seating Capacity:</strong> {rm.capacity} Seats</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={16} color="var(--text-muted)" />
                  <span><strong>Equipment:</strong> {rm.availableEquipment}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <span className="badge badge-emerald">{rm.type}</span>

              {hasRole('SUPER_ADMIN', 'SCHOOL_ADMIN') && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingRoom(rm);
                      setFormData({
                        roomNumber: rm.roomNumber,
                        roomName: rm.roomName,
                        capacity: rm.capacity,
                        type: rm.type,
                        availableEquipment: rm.availableEquipment
                      });
                    }}
                    style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(rm.id, rm.roomName)}
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

      {(showAddModal || editingRoom) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingRoom(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingRoom ? 'Edit Room Specs' : 'Add Room to Inventory'}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Room Number *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Room Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.roomName}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Room Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Library">Library</option>
                    <option value="Sports Room">Sports Room</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Available Equipment</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.availableEquipment}
                  onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowAddModal(false); setEditingRoom(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

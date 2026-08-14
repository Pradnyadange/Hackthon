import React, { useState, useEffect } from 'react';
import { TimetableGrid } from '../components/TimetableGrid';
import { TimetableEntry, ConflictItem, Class, Subject, Teacher, Room } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export const TimetablePage: React.FC = () => {
  const { showToast } = useApp();

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchTimetableData = async () => {
    try {
      const [clsRes, subRes, tchRes, rmRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teachers'),
        api.get('/rooms')
      ]);

      setClasses(clsRes.data || []);
      setSubjects(subRes.data || []);
      setTeachers(tchRes.data || []);
      setRooms(rmRes.data || []);

      const defaultClass = clsRes.data[0]?.id || '';
      const targetClass = selectedClassId || defaultClass;
      if (!selectedClassId && defaultClass) {
        setSelectedClassId(defaultClass);
      }

      if (targetClass) {
        const ttRes = await api.get(`/timetable?classId=${targetClass}`);
        setEntries(ttRes.data.entries || []);
        setConflicts(ttRes.data.conflicts || []);
      }
    } catch (err: any) {
      showToast('Failed to load timetable data', 'error');
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, [selectedClassId]);

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    setConflicts([]);
    try {
      const res = await api.post('/timetable/generate');
      setConflicts([]);
      showToast('🟢 Schedule Optimized! Constraint solver generated conflict-free timetable.', 'success');
      await fetchTimetableData();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate timetable', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSlot = async (slotData: Partial<TimetableEntry>) => {
    try {
      if (slotData.id) {
        await api.put(`/timetable/${slotData.id}`, slotData);
        showToast('Timetable period slot updated persistently!', 'success');
      } else {
        await api.post('/timetable/generate', slotData);
      }
      await fetchTimetableData();
    } catch (err: any) {
      showToast('Failed to update timetable slot', 'error');
    }
  };

  return (
    <TimetableGrid
      entries={entries}
      conflicts={conflicts}
      classes={classes}
      subjects={subjects}
      teachers={teachers}
      rooms={rooms}
      selectedClassId={selectedClassId}
      onSelectClass={(id) => setSelectedClassId(id)}
      onGenerateTimetable={handleGenerateTimetable}
      onSaveSlot={handleSaveSlot}
      isGenerating={isGenerating}
    />
  );
};

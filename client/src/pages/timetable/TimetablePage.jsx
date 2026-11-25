import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Building, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const TimetablePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/academics/classes');
        if (res.data?.success && res.data.classes.length > 0) {
          setClasses(res.data.classes);
          setSelectedClass(res.data.classes[0].id);
          setSelectedSection(res.data.classes[0].sections?.[0]?.id || 1);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClass || !selectedSection) return;
      setLoading(true);
      try {
        const res = await api.get('/timetable', {
          params: { classId: selectedClass, sectionId: selectedSection }
        });
        if (res.data?.success) {
          setSchedule(res.data.schedule || []);
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedClass, selectedSection]);

  const currentClassObj = classes.find((c) => String(c.id) === String(selectedClass));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Class Timetable</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject periods, faculty teacher allocations, and room scheduling
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              const cls = classes.find((c) => String(c.id) === String(e.target.value));
              if (cls?.sections?.[0]) setSelectedSection(cls.sections[0].id);
            }}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
          >
            {currentClassObj?.sections?.map((sec) => (
              <option key={sec.id} value={sec.id}>Section {sec.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <Loader text="Loading timetable slots..." />
      ) : schedule.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No periods scheduled for this class and section.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const daySlots = schedule.filter((s) => s.dayOfWeek === day);
            if (daySlots.length === 0) return null;
            return (
              <div key={day} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 text-blue-700">
                  {day}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Period {slot.periodNo}</span>
                          <span className="text-slate-400 font-normal">{slot.roomNo || 'Room'}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs mt-1">{slot.subject?.name}</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {slot.teacher?.firstName} {slot.teacher?.lastName}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimetablePage;


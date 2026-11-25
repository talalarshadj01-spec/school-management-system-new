import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, CheckCircle, Clock, AlertCircle, FileBarChart, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const StudentAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Mode: 'daily' or 'report'
  const [mode, setMode] = useState('daily');
  const [reportSummary, setReportSummary] = useState([]);

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

  const fetchDailyAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/attendance/class', {
        params: { classId: selectedClass, sectionId: selectedSection, date }
      });
      if (res.data?.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const [year, month] = date.split('-');
      const res = await api.get('/attendance/report', {
        params: { classId: selectedClass, sectionId: selectedSection, month, year }
      });
      if (res.data?.success) {
        setReportSummary(res.data.summary || []);
      }
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'daily') {
      fetchDailyAttendance();
    } else {
      fetchMonthlyReport();
    }
  }, [selectedClass, selectedSection, date, mode]);

  const updateStudentStatus = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const saveAttendance = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks || ''
      }));
      const res = await api.post('/attendance/bulk', {
        classId: selectedClass,
        sectionId: selectedSection,
        date,
        records
      });
      if (res.data?.success) {
        toast.success('Attendance saved successfully!');
        setMessage('Attendance saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const currentClassObj = classes.find((c) => String(c.id) === String(selectedClass));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Attendance Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark daily attendance by class, track absences, and view monthly summary reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={mode === 'daily' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('daily')}
          >
            Daily Sheet
          </Button>
          <Button
            variant={mode === 'report' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('report')}
          >
            Monthly Summary Report
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
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
        <div>
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {mode === 'daily' ? 'Attendance Date' : 'Month Reference Date'}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Mode 1: Daily Attendance Entry Table */}
      {mode === 'daily' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Students ({students.length}) • Date: {date}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 mr-1">Quick Actions:</span>
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-100 text-rose-800 hover:bg-rose-200"
              >
                All Absent
              </button>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading class roster..." />
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No students enrolled in this class and section.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((stu) => (
                    <tr key={stu.studentId} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold">{stu.rollNo || '-'}</td>
                      <td className="p-3 font-bold text-blue-700">{stu.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{stu.name}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 space-x-1">
                          {[
                            { id: 'present', label: 'P', color: 'bg-emerald-600 text-white' },
                            { id: 'late', label: 'L', color: 'bg-amber-500 text-white' },
                            { id: 'absent', label: 'A', color: 'bg-rose-600 text-white' },
                            { id: 'leave', label: 'LV', color: 'bg-indigo-600 text-white' }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => updateStudentStatus(stu.studentId, opt.id)}
                              className={`w-7 h-7 text-xs font-bold rounded-md transition-colors ${
                                stu.status === opt.id ? opt.color : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={stu.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudents((prev) =>
                              prev.map((s) => (s.studentId === stu.studentId ? { ...s, remarks: val } : s))
                            );
                          }}
                          placeholder="Optional notes"
                          className="w-full p-1 border border-slate-200 rounded text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-200 flex justify-end">
            <Button icon={Save} loading={saving} onClick={saveAttendance}>
              Save Attendance Record
            </Button>
          </div>
        </div>
      )}

      {/* Mode 2: Monthly Summary Report Table */}
      {mode === 'report' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Monthly Attendance Percentage Summary
            </h3>
          </div>
          {loading ? (
            <Loader text="Compiling monthly reports..." />
          ) : reportSummary.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No attendance records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center text-emerald-700">Present Days</th>
                    <th className="p-3 text-center text-amber-700">Late Days</th>
                    <th className="p-3 text-center text-rose-700">Absent Days</th>
                    <th className="p-3 text-center text-blue-700">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportSummary.map((item) => (
                    <tr key={item.studentId}>
                      <td className="p-3 font-semibold">{item.rollNo || '-'}</td>
                      <td className="p-3 font-bold text-blue-700">{item.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{item.presentCount}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{item.lateCount}</td>
                      <td className="p-3 text-center font-bold text-rose-600">{item.absentCount}</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-slate-900">{item.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;


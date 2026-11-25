import React, { useState, useEffect } from 'react';
import { User, CalendarCheck, CreditCard, BookOpen, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import { formatPKR, formatDate } from '../../utils/formatters';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/student');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student portal');
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="Student Portal Unavailable"
        description={error}
        onRetry={fetchStudentData}
      />
    );
  }

  const student = data?.student;
  const attendance = data?.attendance;
  const vouchers = data?.vouchers || [];
  const homework = data?.homeworkList || [];
  const timetable = data?.timetable || [];

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center border-2 border-white/20">
            {student?.firstName?.[0]}{student?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{student?.firstName} {student?.lastName}</h2>
            <p className="text-sm text-slate-300">
              Admission No: {student?.admissionNo} • Roll No: {student?.rollNo || 'Pending'}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Badge variant="success">Status: Active Student</Badge>
        </div>
      </div>

      {/* Cards Row: Attendance, Vouchers, Homework */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{attendance?.percentage || 100}%</h3>
          <p className="text-xs text-slate-500 mt-1">
            {attendance?.presentDays || 0} days present out of {attendance?.totalDays || 0} days
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fee Vouchers</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {vouchers.filter((v) => v.status !== 'paid').length} Pending
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Latest: {vouchers[0] ? `${vouchers[0].status.toUpperCase()} (${formatPKR(vouchers[0].remainingAmount)})` : 'All cleared'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Homework</span>
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{homework.length} Tasks</h3>
          <p className="text-xs text-slate-500 mt-1">Assigned by subject teachers</p>
        </div>
      </div>

      {/* Timetable & Homework Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Today's Timetable</span>
          </h3>
          {timetable.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No classes scheduled for today.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {timetable.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">Period {t.periodNo}: {t.subject?.name}</span>
                    <p className="text-slate-500">{t.roomNo || 'Main Classroom'}</p>
                  </div>
                  <span className="font-medium text-slate-600">{t.startTime?.slice(0, 5)} - {t.endTime?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Homework List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>My Homework & Tasks</span>
          </h3>
          {homework.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No pending homework.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {homework.map((hw) => (
                <div key={hw.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{hw.title}</h4>
                    <span className="text-slate-500">Due: {formatDate(hw.dueDate)}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


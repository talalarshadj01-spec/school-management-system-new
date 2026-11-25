import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/teacher');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teacher portal');
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="Teacher Portal Unavailable"
        description={error}
        onRetry={fetchData}
      />
    );
  }

  const teacher = data?.teacher;
  const schedule = data?.todaySchedule || [];
  const homework = data?.homeworkAssigned || [];

  return (
    <div className="space-y-6">
      {/* Teacher Profile Welcome Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Welcome, {teacher?.firstName} {teacher?.lastName}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {teacher?.designation} • {teacher?.department} • ID: {teacher?.employeeId}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Badge variant="success">Duty Status: Active</Badge>
        </div>
      </div>

      {/* Today's Classes Timetable */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Today's Class Schedule</span>
        </h3>
        {schedule.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No scheduled periods for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                    <span>Period {item.periodNo}</span>
                    <span className="text-[11px] bg-blue-200/60 px-1.5 py-0.5 rounded">{item.roomNo || 'Main'}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{item.subject?.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{item.class?.name}</p>
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Homework & Assignments */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Recent Homework Assigned</span>
        </h3>
        {homework.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No recent homework tasks assigned.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {homework.map((hw) => (
              <div key={hw.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900">{hw.title}</h4>
                  <p className="text-xs text-slate-500">{hw.class?.name} • {hw.subject?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600">Due: {formatDate(hw.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;


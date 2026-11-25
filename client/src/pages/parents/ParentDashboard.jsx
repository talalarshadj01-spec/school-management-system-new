import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, CreditCard, Award, Phone } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import { formatPKR, formatDate } from '../../utils/formatters';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/parent');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parent portal');
      console.error('Failed to load parent dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="Parent Portal Unavailable"
        description={error}
        onRetry={fetchParentData}
      />
    );
  }

  const parent = data?.parent;
  const children = data?.children || [];

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="bg-navy-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Welcome, {parent?.fatherName}</h2>
          <p className="text-sm text-slate-300 mt-1">
            Parent Guardian Portal • CNIC: {parent?.fatherCnic || 'Registered'} • Contact: {parent?.fatherPhone}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Badge variant="primary">{children.length} Linked Children</Badge>
        </div>
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900">Your Enrolled Children</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map(({ child, recentAttendance, pendingVouchers }) => (
            <div key={child.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {child.firstName?.[0]}{child.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{child.firstName} {child.lastName}</h4>
                    <p className="text-xs text-slate-500">
                      Admission: {child.admissionNo} • Class: {child.currentClass?.name || 'Class 9'}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Enrolled</Badge>
              </div>

              {/* Attendance Quick View */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>Recent Attendance</span>
                </h5>
                <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                  {recentAttendance.slice(0, 7).map((att) => (
                    <div
                      key={att.id}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                        att.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : att.status === 'late'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                      title={formatDate(att.date)}
                    >
                      {att.status[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Fee Vouchers */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Fee Status</span>
                </h5>
                {pendingVouchers.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">✓ No pending fees for this student.</p>
                ) : (
                  <div className="space-y-1.5">
                    {pendingVouchers.map((v) => (
                      <div key={v.id} className="p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{v.voucherNo}</span>
                          <span className="text-slate-500 ml-2">Due: {formatDate(v.dueDate)}</span>
                        </div>
                        <span className="font-bold text-rose-600">{formatPKR(v.remainingAmount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;


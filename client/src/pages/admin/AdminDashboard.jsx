import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Bell
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorState from '../../components/common/ErrorState';
import { formatPKR, formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        description={error}
        onRetry={fetchStats}
      />
    );
  }

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-navy-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg">
        <div>
          <h2 className="text-xl font-bold">School Overview & Operations</h2>
          <p className="text-sm text-slate-300 mt-1">
            Real-time academic and financial metrics for Iqbal Memorial Public School & College
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="px-3 py-1 bg-navy-800 rounded-lg text-xs font-semibold text-emerald-400 border border-navy-700">
            ● Active Session 2025-2026
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Actively enrolled"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Teaching faculty"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Monthly Fee Collection"
          value={formatPKR(stats?.finances?.monthlyFeeCollection || 0)}
          subtitle="Current month collection"
          icon={CreditCard}
          color="green"
        />
        <StatCard
          title="Pending Fees"
          value={formatPKR(stats?.finances?.pendingFees || 0)}
          subtitle="Outstanding vouchers"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Secondary Stats: Staff, Classes, Today's Attendance, Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Administrative Staff"
          value={stats?.totalStaff || 0}
          subtitle="Accounts, admin & support"
          icon={Briefcase}
          color="slate"
        />
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses || 0}
          subtitle="Class 1 to Class 10"
          icon={Building2}
          color="slate"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats?.todayAttendance?.percentage || 0}%`}
          subtitle={`${stats?.todayAttendance?.present || 0} present today`}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatPKR(stats?.finances?.monthlyExpenses || 0)}
          subtitle="Utilities & supplies"
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Monthly Fee Collection vs Expenses (PKR)</span>
            <span className="text-xs text-slate-400 font-normal">Past 6 Months</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.monthlyFinancialsChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₨${val / 1000}k`} />
                <Tooltip formatter={(value) => formatPKR(value)} />
                <Legend />
                <Bar dataKey="collected" name="Fee Collection" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Attendance Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-2">Today's Attendance Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Overall student presence</p>
          <div className="h-56 relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts?.attendanceChart || []}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.charts?.attendanceChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Present ({stats?.todayAttendance?.present || 0})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Late ({stats?.todayAttendance?.late || 0})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Absent ({stats?.todayAttendance?.absent || 0})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600">Leave ({stats?.todayAttendance?.leave || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Notices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Recent Admissions</span>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-2.5">Admission No</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Class</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(stats?.recentAdmissions || []).map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-medium text-slate-900">{stu.admissionNo}</td>
                    <td className="p-2.5">{stu.firstName} {stu.lastName}</td>
                    <td className="p-2.5">{stu.currentClass?.name || '-'}</td>
                    <td className="p-2.5">{formatDate(stu.admissionDate)}</td>
                    <td className="p-2.5">
                      <Badge variant="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Fee Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Recent Fee Payments</span>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">View Ledger</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-2.5">Receipt No</th>
                  <th className="p-2.5">Student</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(stats?.recentPayments || []).map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-medium text-slate-900">{pmt.receiptNo}</td>
                    <td className="p-2.5">{pmt.student?.firstName} {pmt.student?.lastName}</td>
                    <td className="p-2.5 font-semibold text-emerald-600">{formatPKR(pmt.amount)}</td>
                    <td className="p-2.5 capitalize">{pmt.paymentMethod?.replace('_', ' ')}</td>
                    <td className="p-2.5">{formatDate(pmt.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


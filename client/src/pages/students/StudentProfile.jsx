import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  History,
  FileText,
  ShieldCheck,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatPKR, formatDate } from '../../utils/formatters';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <Loader text="Loading student comprehensive record..." />;
  if (!data?.student) return <p className="text-center py-12 text-slate-500">Student not found.</p>;

  const { student, attendance, vouchers, examMarks } = data;
  const parent = student.parents?.[0];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'parents', label: 'Parents / Guardians', icon: Phone },
    { id: 'attendance', label: 'Attendance History', icon: CalendarCheck },
    { id: 'fees', label: 'Fees & Vouchers', icon: CreditCard },
    { id: 'exams', label: 'Exam Results', icon: FileSpreadsheet },
    { id: 'history', label: 'Academic History', icon: History }
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back and Print buttons */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students List</span>
        </button>
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
          Print Profile Card
        </Button>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant="success">{student.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Admission No: <span className="font-semibold text-blue-700">{student.admissionNo}</span> •
              Roll No: <span className="font-semibold text-slate-700">{student.rollNo || '-'}</span> •
              Class: <span className="font-semibold text-slate-700">{student.currentClass?.name || 'Class 9'} ({student.currentSection?.name || 'A'})</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-slate-600">
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">B-Form No</span>
            <span className="font-mono font-semibold text-slate-800">{student.bFormNo || 'Pending'}</span>
          </div>
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
            <span className="font-semibold text-rose-600">{student.bloodGroup || 'O+'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 flex flex-wrap gap-1 no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Admission Date</span>
                <p className="text-base font-bold text-slate-900 mt-1">{formatDate(student.admissionDate)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Current Session</span>
                <p className="text-base font-bold text-slate-900 mt-1">{student.currentSession?.name || '2025-2026'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Guardian Contact</span>
                <p className="text-base font-bold text-slate-900 mt-1">{student.emergencyContactPhone || parent?.fatherPhone || '-'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Residential Address</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {student.address || 'Johar Town, Lahore'}, {student.city || 'Lahore'}, {student.state || 'Punjab'}, Pakistan
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Information */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Full Legal Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.firstName} {student.lastName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Gender</span>
              <span className="font-bold text-slate-900 text-sm capitalize">{student.gender}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Date of Birth</span>
              <span className="font-bold text-slate-900 text-sm">{formatDate(student.dob)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Religion & Nationality</span>
              <span className="font-bold text-slate-900 text-sm">{student.religion || 'Islam'} / {student.nationality || 'Pakistani'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Previous School Attended</span>
              <span className="font-bold text-slate-900 text-sm">{student.previousSchool || 'None / Fresh Admission'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block font-semibold uppercase">Emergency Contact Person</span>
              <span className="font-bold text-slate-900 text-sm">{student.emergencyContactName || parent?.fatherName || '-'}</span>
            </div>
          </div>
        )}

        {/* Tab 3: Parents & Guardians */}
        {activeTab === 'parents' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">Father / Primary Guardian Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Father Name</span>
                  <span className="font-bold text-slate-900">{parent?.fatherName || 'Not recorded'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Father CNIC</span>
                  <span className="font-mono font-bold text-slate-900">{parent?.fatherCnic || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Phone Number</span>
                  <span className="font-bold text-blue-700">{parent?.fatherPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Occupation</span>
                  <span className="font-bold text-slate-900">{parent?.fatherOccupation || 'Private Business'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Email</span>
                  <span className="font-bold text-slate-900">{parent?.fatherEmail || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Recent Daily Attendance Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {attendance.map((att) => (
                    <tr key={att.id}>
                      <td className="p-2.5 font-medium">{formatDate(att.date)}</td>
                      <td className="p-2.5">
                        <Badge
                          variant={
                            att.status === 'present'
                              ? 'success'
                              : att.status === 'late'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {att.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-500">{att.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Fees & Vouchers */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Student Fee Vouchers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="p-2.5">Voucher No</th>
                    <th className="p-2.5">Month/Year</th>
                    <th className="p-2.5">Due Date</th>
                    <th className="p-2.5">Total Payable</th>
                    <th className="p-2.5">Paid</th>
                    <th className="p-2.5">Remaining</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vouchers.map((v) => (
                    <tr key={v.id}>
                      <td className="p-2.5 font-bold text-blue-700">{v.voucherNo}</td>
                      <td className="p-2.5">{v.month}/{v.year}</td>
                      <td className="p-2.5">{formatDate(v.dueDate)}</td>
                      <td className="p-2.5 font-semibold">{formatPKR(v.totalPayable)}</td>
                      <td className="p-2.5 font-semibold text-emerald-600">{formatPKR(v.paidAmount)}</td>
                      <td className="p-2.5 font-semibold text-rose-600">{formatPKR(v.remainingAmount)}</td>
                      <td className="p-2.5">
                        <Badge variant={v.status === 'paid' ? 'success' : 'warning'}>
                          {v.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Exam Results */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Official Examination Results</h4>
            {examMarks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No exam marks entered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5">Examination</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Total Marks</th>
                      <th className="p-2.5">Obtained Marks</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {examMarks.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-bold text-slate-900">{m.examSubject?.examination?.name}</td>
                        <td className="p-2.5">{m.examSubject?.subject?.name}</td>
                        <td className="p-2.5">{m.examSubject?.totalMarks}</td>
                        <td className="p-2.5 font-bold text-blue-600">{m.marksObtained}</td>
                        <td className="p-2.5">
                          <Badge variant={m.marksObtained >= m.examSubject?.passingMarks ? 'success' : 'danger'}>
                            {m.marksObtained >= m.examSubject?.passingMarks ? 'PASSED' : 'FAILED'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Academic History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Enrollment & Promotion Timeline</h4>
            <div className="space-y-3">
              {(student.enrollments || []).map((enr) => (
                <div key={enr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{enr.academicSession?.name}</span>
                    <p className="text-slate-500 mt-0.5">{enr.class?.name} - Section {enr.section?.name}</p>
                  </div>
                  <Badge variant="primary">{enr.status.toUpperCase()}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;


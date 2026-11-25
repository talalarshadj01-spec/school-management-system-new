import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Trash2,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  // New Student Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: '2012-05-10',
    classId: '',
    sectionId: '',
    bloodGroup: 'B+',
    bFormNo: '',
    rollNo: '',
    fatherName: '',
    fatherCnic: '',
    fatherPhone: '+92 300 1234567',
    address: 'Johar Town, Lahore'
  });

  // Promote Modal state
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [promoteData, setPromoteData] = useState({
    newClassId: '',
    newSectionId: '',
    newSessionId: 1
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/students', {
        params: {
          search: debouncedSearch,
          classId: selectedClass || undefined,
          page,
          limit: 15
        }
      });
      if (res.data?.success) {
        setStudents(res.data.students);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total || res.data.students.length);
      }
    } catch (err) {
      const isNetwork = !err.response;
      setError({
        message: isNetwork
          ? 'Unable to reach the server. Check your connection.'
          : (err.response?.data?.message || 'Failed to load students'),
        isNetwork,
      });
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedClass, page]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/academics/classes');
      if (res.data?.success) {
        setClasses(res.data.classes);
        if (res.data.classes.length > 0 && !newStudent.classId) {
          setNewStudent((prev) => ({
            ...prev,
            classId: res.data.classes[0].id,
            sectionId: res.data.classes[0].sections?.[0]?.id || 1
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading('Registering student...');
    try {
      const res = await api.post('/students', newStudent);
      if (res.data?.success) {
        toast.success('Student registered successfully!', { id: toastId });
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register student', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoteStudent = async (e) => {
    e.preventDefault();
    if (!promoteTarget) return;
    setSubmitting(true);
    const toastId = toast.loading('Promoting student...');
    try {
      const res = await api.post(`/students/${promoteTarget.id}/promote`, promoteData);
      if (res.data?.success) {
        toast.success('Student promoted successfully!', { id: toastId });
        setShowPromoteModal(false);
        setPromoteTarget(null);
        fetchStudents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to safely archive this student record?')) {
      const toastId = toast.loading('Archiving student...');
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student archived successfully', { id: toastId });
        fetchStudents();
      } catch (err) {
        toast.error('Failed to archive student', { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Directory & Admissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, academic enrollments, and promotions
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/reports/students/excel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </a>
          <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>
            Add New Student
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, admission no, roll no or B-form..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load students"
            description={error.message}
            isNetwork={error.isNetwork}
            onRetry={fetchStudents}
          />
        ) : students.length === 0 ? (
          <EmptyState
            iconKey="students"
            title={debouncedSearch || selectedClass ? 'No students match your filters' : 'No students registered yet'}
            description={
              debouncedSearch || selectedClass
                ? 'Try changing your search term or clearing the class filter.'
                : 'Register the first student to get started.'
            }
            action={
              <Button icon={UserPlus} onClick={() => setShowAddModal(true)} size="sm">
                Register First Student
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3">B-Form / CNIC</th>
                  <th className="p-3">Guardian Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-blue-700">{student.admissionNo}</td>
                    <td className="p-3 font-semibold text-slate-800">{student.rollNo || '-'}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">{student.gender}</span>
                    </td>
                    <td className="p-3 font-medium">
                      {student.currentClass?.name || 'Class 9'} - Sec {student.currentSection?.name || 'A'}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {student.bFormNo || 'Pending'}
                    </td>
                    <td className="p-3">
                      <span className="text-slate-800 font-medium block">
                        {student.parents?.[0]?.fatherName || 'Guardian'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {student.emergencyContactPhone || student.parents?.[0]?.fatherPhone || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                        {student.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPromoteTarget(student);
                            setShowPromoteModal(true);
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Promote to Next Class"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(student.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="space-x-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Student"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Muhammad"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Ali"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={newStudent.gender}
                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={newStudent.dob}
                onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class *</label>
              <select
                required
                value={newStudent.classId}
                onChange={(e) => {
                  const selClass = classes.find((c) => String(c.id) === String(e.target.value));
                  setNewStudent({
                    ...newStudent,
                    classId: e.target.value,
                    sectionId: selClass?.sections?.[0]?.id || ''
                  });
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section *</label>
              <select
                required
                value={newStudent.sectionId}
                onChange={(e) => setNewStudent({ ...newStudent, sectionId: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                {classes.find((c) => String(c.id) === String(newStudent.classId))?.sections?.map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">B-Form No (NADRA)</label>
              <input
                type="text"
                value={newStudent.bFormNo}
                onChange={(e) => setNewStudent({ ...newStudent, bFormNo: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="35201-1234567-1"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="9A-15"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-800 text-xs mb-2">Father / Guardian Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Father Name *</label>
                <input
                  type="text"
                  required
                  value={newStudent.fatherName}
                  onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Tariq Mahmood"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Father CNIC</label>
                <input
                  type="text"
                  value={newStudent.fatherCnic}
                  onChange={(e) => setNewStudent({ ...newStudent, fatherCnic: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="35201-7654321-1"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={newStudent.fatherPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, fatherPhone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} loading={submitting}>
              {submitting ? 'Registering...' : 'Complete Admission'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Promote Student Modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        title={`Promote Student: ${promoteTarget?.firstName} ${promoteTarget?.lastName}`}
      >
        <form onSubmit={handlePromoteStudent} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Promoting student from current class ({promoteTarget?.currentClass?.name}) to the next academic level without losing historical records.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Promote To Class *</label>
            <select
              required
              value={promoteData.newClassId}
              onChange={(e) => {
                const targetCls = classes.find((c) => String(c.id) === String(e.target.value));
                setPromoteData({
                  ...promoteData,
                  newClassId: e.target.value,
                  newSectionId: targetCls?.sections?.[0]?.id || 1
                });
              }}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">Select Target Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Section *</label>
            <select
              required
              value={promoteData.newSectionId}
              onChange={(e) => setPromoteData({ ...promoteData, newSectionId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              {classes.find((c) => String(c.id) === String(promoteData.newClassId))?.sections?.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowPromoteModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Promotion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsList;


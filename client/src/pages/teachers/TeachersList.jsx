import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, UserPlus, Search, Phone, Mail, Award, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { ListItemSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import useDebounce from '../../hooks/useDebounce';
import { formatPKR, formatDate } from '../../utils/formatters';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: '1988-06-15',
    cnic: '35201-9988776-1',
    phone: '+92 300 9988776',
    email: '',
    qualification: 'M.Sc. Physics (PU)',
    experienceYears: 5,
    joiningDate: '2023-01-10',
    department: 'Science & Mathematics',
    designation: 'Senior Teacher',
    basicSalary: 85000,
    address: 'Johar Town, Lahore'
  });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/teachers', { params: { search: debouncedSearch } });
      if (res.data?.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      setError({
        message: !err.response ? 'Unable to reach the server. Check your connection.' : (err.response?.data?.message || 'Failed to load teachers'),
        isNetwork: !err.response,
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading('Registering teacher...');
    try {
      const res = await api.post('/teachers', newTeacher);
      if (res.data?.success) {
        toast.success('Teacher registered successfully!', { id: toastId });
        setShowAddModal(false);
        fetchTeachers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add teacher', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty & Teachers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching faculty staff, designations, subject assignments, and qualifications
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>
          Register New Teacher
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher name, employee ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="p-6">
          <ListItemSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load teachers"
          description={error.message}
          isNetwork={error.isNetwork}
          onRetry={fetchTeachers}
        />
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={debouncedSearch ? 'No teachers match your search' : 'No teachers registered yet'}
          description={debouncedSearch ? 'Try a different name or employee ID.' : 'Register the first teacher to get started.'}
          action={<Button icon={UserPlus} onClick={() => setShowAddModal(true)} size="sm">Register First Teacher</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-base">
                      {teacher.firstName[0]}{teacher.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <span className="text-[11px] font-mono text-blue-600 font-semibold">{teacher.employeeId}</span>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.designation} • {teacher.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Basic Salary: <strong className="text-slate-800">{formatPKR(teacher.basicSalary)}</strong></span>
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Subjects
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(teacher.assignedSubjects || []).map((cs) => (
                      <span
                        key={cs.id}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                      >
                        {cs.class?.name} - {cs.subject?.name}
                      </span>
                    ))}
                    {(teacher.assignedSubjects || []).length === 0 && (
                      <span className="text-[10px] text-slate-400">No classes assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Faculty Member"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newTeacher.firstName}
                onChange={(e) => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Muhammad"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newTeacher.lastName}
                onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Naveed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="teacher@school.edu.pk"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="+92 300 1234567"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CNIC (National ID)</label>
              <input
                type="text"
                value={newTeacher.cnic}
                onChange={(e) => setNewTeacher({ ...newTeacher, cnic: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="35201-1234567-1"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Joining Date *</label>
              <input
                type="date"
                required
                value={newTeacher.joiningDate}
                onChange={(e) => setNewTeacher({ ...newTeacher, joiningDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={newTeacher.department}
                onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Science / Mathematics / English"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Basic Salary (PKR)</label>
              <input
                type="number"
                value={newTeacher.basicSalary}
                onChange={(e) => setNewTeacher({ ...newTeacher, basicSalary: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="75000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeachersList;


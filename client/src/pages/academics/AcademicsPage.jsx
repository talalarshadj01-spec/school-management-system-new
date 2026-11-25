import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Layers, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

const AcademicsPage = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Class modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', numericValue: 1, description: '' });

  // New Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'theory' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, subjRes, sessRes] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/subjects'),
        api.get('/academics/sessions')
      ]);
      if (classRes.data?.success) setClasses(classRes.data.classes);
      if (subjRes.data?.success) setSubjects(subjRes.data.subjects);
      if (sessRes.data?.success) setSessions(sessRes.data.sessions);
    } catch (err) {
      console.error('Failed to load academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academics/classes', newClass);
      if (res.data?.success) {
        toast.success('Class created successfully');
        setShowClassModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academics/subjects', newSubject);
      if (res.data?.success) {
        toast.success('Subject created successfully');
        setShowSubjectModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Structure</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic sessions, grade levels, sections, and curriculum subjects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button icon={PlusCircle} size="sm" onClick={() => setShowClassModal(true)}>
            Add Class
          </Button>
          <Button icon={PlusCircle} size="sm" variant="secondary" onClick={() => setShowSubjectModal(true)}>
            Add Subject
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading academic structures..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classes & Sections */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Classes & Sections</span>
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {classes.map((cls) => (
                <div key={cls.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{cls.name}</h4>
                    <div className="flex items-center space-x-1.5 mt-1">
                      {(cls.sections || []).map((sec) => (
                        <span key={sec.id} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                          Sec {sec.name} ({sec.roomNo || 'Room'})
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Numeric: {cls.numericValue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Directory */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Curriculum Subjects</span>
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {subjects.map((subj) => (
                <div key={subj.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{subj.name}</h4>
                    <span className="font-mono text-slate-500 text-[11px]">{subj.code}</span>
                  </div>
                  <Badge variant={subj.type === 'both' ? 'purple' : 'primary'}>
                    {subj.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={showClassModal} onClose={() => setShowClassModal(false)} title="Create New Class">
        <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              value={newClass.name}
              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. Class 11 / Pre-Medical"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Numeric Order (1-12) *</label>
            <input
              type="number"
              required
              value={newClass.numericValue}
              onChange={(e) => setNewClass({ ...newClass, numericValue: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowClassModal(false)}>Cancel</Button>
            <Button type="submit">Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Add New Subject">
        <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. Pakistan Studies"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
            <input
              type="text"
              required
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="PST-101"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Type</label>
            <select
              value={newSubject.type}
              onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="theory">Theory Only</option>
              <option value="practical">Practical Only</option>
              <option value="both">Theory & Practical</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowSubjectModal(false)}>Cancel</Button>
            <Button type="submit">Add Subject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicsPage;


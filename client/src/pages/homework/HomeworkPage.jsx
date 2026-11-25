import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const HomeworkPage = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHomework, setNewHomework] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hwRes, clsRes, subRes] = await Promise.all([
        api.get('/homework'),
        api.get('/academics/classes'),
        api.get('/academics/subjects')
      ]);
      if (hwRes.data?.success) setHomeworkList(hwRes.data.homework);
      if (clsRes.data?.success && clsRes.data.classes.length > 0) {
        setClasses(clsRes.data.classes);
        setNewHomework((prev) => ({
          ...prev,
          classId: clsRes.data.classes[0].id,
          sectionId: clsRes.data.classes[0].sections?.[0]?.id || 1
        }));
      }
      if (subRes.data?.success && subRes.data.subjects.length > 0) {
        setSubjects(subRes.data.subjects);
        setNewHomework((prev) => ({ ...prev, subjectId: subRes.data.subjects[0].id }));
      }
    } catch (err) {
      console.error('Failed to load homework:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/homework', newHomework);
      if (res.data?.success) {
        toast.success('Homework assigned successfully');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign homework');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Homework & Assignments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign class homework, set submission due dates, and track student submissions
          </p>
        </div>
        <Button icon={PlusCircle} onClick={() => setShowAddModal(true)}>
          Assign New Homework
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading homework records..." />
      ) : homeworkList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          No homework assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworkList.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-2">
                  <span>{hw.class?.name} - {hw.section?.name}</span>
                  <span className="text-slate-500">{hw.subject?.name}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{hw.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{hw.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Teacher: {hw.teacher?.firstName} {hw.teacher?.lastName}</span>
                <span className="font-semibold text-rose-600">Due: {formatDate(hw.dueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Homework Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Assign New Homework">
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class *</label>
            <select
              value={newHomework.classId}
              onChange={(e) => {
                const c = classes.find((cls) => String(cls.id) === String(e.target.value));
                setNewHomework({
                  ...newHomework,
                  classId: e.target.value,
                  sectionId: c?.sections?.[0]?.id || 1
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
            <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
            <select
              value={newHomework.subjectId}
              onChange={(e) => setNewHomework({ ...newHomework, subjectId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={newHomework.title}
              onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. Exercise 4.1 Questions 1 to 5"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Instructions *</label>
            <textarea
              required
              rows={3}
              value={newHomework.description}
              onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="Provide assignment directions..."
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Submission Due Date *</label>
            <input
              type="date"
              required
              value={newHomework.dueDate}
              onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Assign Homework</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeworkPage;


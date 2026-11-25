import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, PlusCircle, CheckCircle, Eye, Printer, Award, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const ExaminationsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Marks Entry Modal
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedExamSubject, setSelectedExamSubject] = useState(null);
  const [marksSheet, setMarksSheet] = useState([]);
  const [savingMarks, setSavingMarks] = useState(false);

  // Report Card Viewer Modal
  const [showReportCard, setShowReportCard] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams');
      if (res.data?.success) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error('Failed to load examinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students', { params: { limit: 100 } });
      if (res.data?.success && res.data.students?.length > 0) {
        setStudentsList(res.data.students);
        setSelectedStudentId(res.data.students[0].id);
      }
    } catch (err) {
      console.error('Failed to load students for report card generator:', err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);

  const openMarksEntry = async (examSubject) => {
    setSelectedExamSubject(examSubject);
    setShowMarksModal(true);
    try {
      const res = await api.get(`/exams/marks-sheet/${examSubject.id}`);
      if (res.data?.success) {
        setMarksSheet(res.data.students || []);
      }
    } catch (err) {
      toast.error('Failed to load marks sheet');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExamSubject) return;
    setSavingMarks(true);
    const toastId = toast.loading('Saving examination marks...');
    try {
      const res = await api.post(`/exams/marks-sheet/${selectedExamSubject.id}`, {
        marks: marksSheet
      });
      if (res.data?.success) {
        toast.success('Marks saved successfully!', { id: toastId });
        setShowMarksModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks', { id: toastId });
    } finally {
      setSavingMarks(false);
    }
  };

  const togglePublish = async (examId) => {
    const toastId = toast.loading('Updating publish status...');
    try {
      const res = await api.put(`/exams/${examId}/publish`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Result status updated successfully', { id: toastId });
        fetchExams();
      }
    } catch (err) {
      toast.error('Failed to update result publish status', { id: toastId });
    }
  };

  const viewReportCard = async (examId, studentId) => {
    setLoadingReport(true);
    setShowReportCard(true);
    try {
      const res = await api.get(`/exams/${examId}/report-card/${studentId}`);
      if (res.data?.success) {
        setReportCardData(res.data.reportCard);
      }
    } catch (err) {
      toast.error('Failed to generate report card for this student');
      setShowReportCard(false);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Examinations & Result Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure terms, enter student marks, publish results, and generate printable A4 report cards
          </p>
        </div>
      </div>

      {/* Examinations List */}
      {loading ? (
        <Loader text="Loading examinations..." />
      ) : exams.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No examinations found.</div>
      ) : (
        <div className="space-y-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">{exam.name}</h3>
                    <Badge variant={exam.isPublished ? 'success' : 'warning'}>
                      {exam.isPublished ? 'RESULTS PUBLISHED' : 'DRAFT / UNPUBLISHED'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Session: {exam.academicSession?.name} • Dates: {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={exam.isPublished ? 'secondary' : 'success'}
                    size="sm"
                    onClick={() => togglePublish(exam.id)}
                  >
                    {exam.isPublished ? 'Unpublish Results' : 'Publish Results to Portal'}
                  </Button>
                </div>
              </div>

              {/* Exam Subjects Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Scheduled Exam Subjects & Marks Entry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(exam.examSubjects || []).map((es) => (
                    <div
                      key={es.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">
                          {es.subject?.name} ({es.class?.name})
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Max Marks: {es.totalMarks} • Passing: {es.passingMarks}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => openMarksEntry(es)}>
                        Marks Sheet
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Report Card Generator */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Generate Official Report Card for:</span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
                  >
                    {studentsList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.firstName} {st.lastName} ({st.admissionNo})
                      </option>
                    ))}
                    {studentsList.length === 0 && <option value="1">Hamza Tariq (9A-01)</option>}
                  </select>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Printer}
                  onClick={() => viewReportCard(exam.id, selectedStudentId || 1)}
                >
                  Print Report Card
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marks Entry Modal */}
      <Modal
        isOpen={showMarksModal}
        onClose={() => setShowMarksModal(false)}
        title={`Marks Entry: ${selectedExamSubject?.subject?.name} (${selectedExamSubject?.class?.name})`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Total Marks: <strong>{selectedExamSubject?.totalMarks}</strong> • Passing Marks: <strong>{selectedExamSubject?.passingMarks}</strong>
          </p>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 uppercase text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="p-2">Roll No</th>
                  <th className="p-2">Student Name</th>
                  <th className="p-2">Marks Obtained</th>
                  <th className="p-2">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksSheet.map((item, idx) => (
                  <tr key={item.studentId}>
                    <td className="p-2 font-semibold">{item.rollNo}</td>
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max={selectedExamSubject?.totalMarks}
                        value={item.marksObtained}
                        disabled={item.isAbsent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMarksSheet((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, marksObtained: val } : s))
                          );
                        }}
                        className="w-24 p-1.5 border border-slate-300 rounded font-bold text-blue-700"
                        placeholder="0 - 100"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={item.isAbsent}
                        onChange={(e) => {
                          const chk = e.target.checked;
                          setMarksSheet((prev) =>
                            prev.map((s, i) =>
                              i === idx ? { ...s, isAbsent: chk, marksObtained: chk ? 0 : s.marksObtained } : s
                            )
                          );
                        }}
                        className="rounded text-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowMarksModal(false)}>Cancel</Button>
            <Button loading={savingMarks} onClick={handleSaveMarks}>Save Marks</Button>
          </div>
        </div>
      </Modal>

      {/* Printable A4 Report Card Modal */}
      <Modal
        isOpen={showReportCard}
        onClose={() => setShowReportCard(false)}
        title="Official Student Progress Report Card"
        maxWidth="max-w-3xl"
      >
        {loadingReport || !reportCardData ? (
          <Loader text="Generating printable report card..." />
        ) : (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-end no-print">
              <Button icon={Printer} onClick={() => window.print()}>
                Print Report Card
              </Button>
            </div>

            {/* A4 Printable Layout */}
            <div className="p-8 border-2 border-slate-800 rounded-xl bg-white text-slate-900 space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-xl font-extrabold uppercase tracking-wide">
                  {reportCardData.schoolName}
                </h2>
                <p className="text-xs text-slate-600">{reportCardData.campus}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded">
                  {reportCardData.examName} ({reportCardData.academicSession})
                </div>
              </div>

              {/* Student Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-300">
                <div>
                  <p><strong>Student Name:</strong> {reportCardData.student.name}</p>
                  <p className="mt-1"><strong>Admission No:</strong> {reportCardData.student.admissionNo}</p>
                </div>
                <div>
                  <p><strong>Class & Section:</strong> {reportCardData.student.className} - {reportCardData.student.sectionName}</p>
                  <p className="mt-1"><strong>Roll No:</strong> {reportCardData.student.rollNo}</p>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full text-xs text-left border border-slate-800">
                <thead className="bg-slate-200 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-800">Subject</th>
                    <th className="p-2 border-r border-slate-800 text-center">Max Marks</th>
                    <th className="p-2 border-r border-slate-800 text-center">Passing</th>
                    <th className="p-2 border-r border-slate-800 text-center">Obtained</th>
                    <th className="p-2 border-r border-slate-800 text-center">Percentage</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {reportCardData.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-slate-800 font-semibold">{sub.subjectName}</td>
                      <td className="p-2 border-r border-slate-800 text-center">{sub.totalMarks}</td>
                      <td className="p-2 border-r border-slate-800 text-center">{sub.passingMarks}</td>
                      <td className="p-2 border-r border-slate-800 text-center font-bold">{sub.marksObtained}</td>
                      <td className="p-2 border-r border-slate-800 text-center">{sub.percentage}%</td>
                      <td className="p-2 text-center font-bold text-blue-700">{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Results */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs border border-slate-800 p-3 bg-slate-50 rounded">
                <div>
                  <span className="block text-slate-500 font-medium">Total Marks</span>
                  <strong className="text-sm">{reportCardData.totalObtainedMarks} / {reportCardData.totalMaxMarks}</strong>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Overall Percentage</span>
                  <strong className="text-sm">{reportCardData.overallPercentage}%</strong>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Grade & Status</span>
                  <strong className="text-sm text-emerald-700">{reportCardData.overallGrade} ({reportCardData.resultStatus})</strong>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between text-xs border-t border-slate-300">
                <div className="text-center w-36 border-t border-slate-600 pt-1">Class Teacher</div>
                <div className="text-center w-36 border-t border-slate-600 pt-1">Examination Controller</div>
                <div className="text-center w-36 border-t border-slate-600 pt-1">Principal / Stamp</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExaminationsPage;


const { Op } = require('sequelize');
const {
  sequelize,
  Examination,
  ExamSubject,
  StudentMark,
  Grade,
  Class,
  Section,
  Subject,
  Student,
  AcademicSession
} = require('../models');
const { logAction } = require('../services/auditService');

// Get all examinations
const getExams = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const where = {};
    if (sessionId) where.academicSessionId = sessionId;

    const exams = await Examination.findAll({
      where,
      order: [['startDate', 'DESC']],
      include: [
        { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] },
        {
          model: ExamSubject,
          as: 'examSubjects',
          include: [
            { model: Class, as: 'class', attributes: ['id', 'name'] },
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
          ]
        }
      ]
    });

    return res.status(200).json({ success: true, exams });
  } catch (error) {
    next(error);
  }
};

// Create examination
const createExam = async (req, res, next) => {
  try {
    const { academicSessionId, name, examType, startDate, endDate, description } = req.body;
    const exam = await Examination.create({
      academicSessionId,
      name,
      examType,
      startDate,
      endDate,
      description,
      isPublished: false
    });
    return res.status(201).json({ success: true, exam });
  } catch (error) {
    next(error);
  }
};

// Add subject to examination
const addExamSubject = async (req, res, next) => {
  try {
    const { examinationId, classId, subjectId, examDate, totalMarks = 100, passingMarks = 33 } = req.body;
    const examSubject = await ExamSubject.create({
      examinationId,
      classId,
      subjectId,
      examDate,
      totalMarks,
      passingMarks
    });
    return res.status(201).json({ success: true, examSubject });
  } catch (error) {
    next(error);
  }
};

// Get Marks Entry Sheet for Exam Subject
const getMarksSheet = async (req, res, next) => {
  try {
    const { examSubjectId } = req.params;
    const examSubject = await ExamSubject.findByPk(examSubjectId, {
      include: [
        { model: Examination, as: 'examination' },
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });

    if (!examSubject) {
      return res.status(404).json({ success: false, message: 'Exam subject not found.' });
    }

    // Get all students of this class
    const students = await Student.findAll({
      where: { currentClassId: examSubject.classId, status: 'active' },
      order: [['rollNo', 'ASC'], ['firstName', 'ASC']],
      attributes: ['id', 'admissionNo', 'rollNo', 'firstName', 'lastName']
    });

    // Get existing marks
    const existingMarks = await StudentMark.findAll({ where: { examSubjectId } });
    const marksMap = {};
    existingMarks.forEach((m) => {
      marksMap[m.studentId] = m;
    });

    const list = students.map((stu) => ({
      studentId: stu.id,
      admissionNo: stu.admissionNo,
      rollNo: stu.rollNo,
      name: `${stu.firstName} ${stu.lastName}`,
      marksObtained: marksMap[stu.id]?.marksObtained ?? '',
      isAbsent: marksMap[stu.id]?.isAbsent ?? false,
      remarks: marksMap[stu.id]?.remarks || ''
    }));

    return res.status(200).json({
      success: true,
      examSubject,
      students: list
    });
  } catch (error) {
    next(error);
  }
};

// Save Marks
const saveMarks = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { examSubjectId } = req.params;
    const { marks } = req.body; // array of { studentId, marksObtained, isAbsent, remarks }

    if (!Array.isArray(marks)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Marks array is required.' });
    }

    for (const item of marks) {
      const [markRec, created] = await StudentMark.findOrCreate({
        where: { examSubjectId, studentId: item.studentId },
        defaults: {
          examSubjectId,
          studentId: item.studentId,
          marksObtained: item.isAbsent ? 0.00 : parseFloat(item.marksObtained || 0),
          isAbsent: !!item.isAbsent,
          remarks: item.remarks || null
        },
        transaction
      });

      if (!created) {
        await markRec.update({
          marksObtained: item.isAbsent ? 0.00 : parseFloat(item.marksObtained || 0),
          isAbsent: !!item.isAbsent,
          remarks: item.remarks || null
        }, { transaction });
      }
    }

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'ENTER_MARKS',
      entity: 'StudentMark',
      details: { examSubjectId, count: marks.length },
      req
    });

    return res.status(200).json({ success: true, message: 'Exam marks saved successfully.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Publish / Unpublish Examination Results
const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Examination.findByPk(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const newStatus = !exam.isPublished;
    await exam.update({ isPublished: newStatus });

    await logAction({
      userId: req.user?.id,
      action: newStatus ? 'PUBLISH_RESULTS' : 'UNPUBLISH_RESULTS',
      entity: 'Examination',
      entityId: exam.id,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Results ${newStatus ? 'published' : 'hidden'} successfully.`,
      isPublished: newStatus
    });
  } catch (error) {
    next(error);
  }
};

// Generate Student Report Card Data
const getStudentReportCard = async (req, res, next) => {
  try {
    const { examinationId, studentId } = req.params;

    const [exam, student, grades] = await Promise.all([
      Examination.findByPk(examinationId, {
        include: [{ model: AcademicSession, as: 'academicSession' }]
      }),
      Student.findByPk(studentId, {
        include: [
          { model: Class, as: 'currentClass' },
          { model: Section, as: 'currentSection' }
        ]
      }),
      Grade.findAll({ order: [['minPercentage', 'DESC']] })
    ]);

    if (!exam || !student) {
      return res.status(404).json({ success: false, message: 'Exam or Student not found.' });
    }

    // Get marks for all exam subjects in this exam for the student's class
    const examSubjects = await ExamSubject.findAll({
      where: { examinationId, classId: student.currentClassId },
      include: [
        { model: Subject, as: 'subject' },
        {
          model: StudentMark,
          as: 'marks',
          where: { studentId },
          required: false
        }
      ]
    });

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;
    let passedAll = true;

    const subjectResults = examSubjects.map((es) => {
      const markRecord = es.marks?.[0];
      const obtained = markRecord ? parseFloat(markRecord.marksObtained || 0) : 0;
      const total = parseFloat(es.totalMarks);
      const passing = parseFloat(es.passingMarks);
      const isAbsent = markRecord?.isAbsent || false;
      const isPass = !isAbsent && obtained >= passing;

      if (!isPass) passedAll = false;

      totalMaxMarks += total;
      totalObtainedMarks += obtained;

      const pct = total > 0 ? (obtained / total) * 100 : 0;
      const matchingGrade = grades.find((g) => pct >= parseFloat(g.minPercentage)) || { name: 'F', remarks: 'Fail' };

      return {
        subjectName: es.subject?.name,
        subjectCode: es.subject?.code,
        totalMarks: total,
        passingMarks: passing,
        marksObtained: isAbsent ? 'Absent' : obtained,
        percentage: pct.toFixed(1),
        grade: isAbsent ? 'F' : matchingGrade.name,
        remarks: isAbsent ? 'Absent' : matchingGrade.remarks,
        isPass
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2) : 0;
    const overallGrade = grades.find((g) => parseFloat(overallPercentage) >= parseFloat(g.minPercentage)) || { name: 'F', remarks: 'Fail' };

    return res.status(200).json({
      success: true,
      reportCard: {
        schoolName: 'Iqbal Memorial Public School & College',
        campus: 'Johar Town Campus, Lahore',
        examName: exam.name,
        academicSession: exam.academicSession?.name,
        student: {
          id: student.id,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo,
          name: `${student.firstName} ${student.lastName}`,
          className: student.currentClass?.name,
          sectionName: student.currentSection?.name,
          bFormNo: student.bFormNo
        },
        subjects: subjectResults,
        totalMaxMarks,
        totalObtainedMarks,
        overallPercentage,
        overallGrade: overallGrade.name,
        resultStatus: passedAll ? 'PASSED' : 'COMPARTMENT / FAILED',
        remarks: overallGrade.remarks
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExams,
  createExam,
  addExamSubject,
  getMarksSheet,
  saveMarks,
  togglePublish,
  getStudentReportCard
};


const { Op } = require('sequelize');
const {
  sequelize,
  Student,
  Parent,
  StudentParent,
  Class,
  Section,
  AcademicSession,
  Enrollment,
  StudentAttendance,
  FeeVoucher,
  StudentMark,
  ExamSubject,
  Examination,
  Subject,
  User,
  Role
} = require('../models');
const { logAction } = require('../services/auditService');

// Generate unique Admission Number
const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Student.count();
  const seq = String(count + 1).padStart(4, '0');
  let candidate = `IMPS-${year}-${seq}`;
  let exists = await Student.findOne({ where: { admissionNo: candidate } });
  let offset = 1;
  while (exists) {
    candidate = `IMPS-${year}-${String(count + 1 + offset).padStart(4, '0')}`;
    exists = await Student.findOne({ where: { admissionNo: candidate } });
    offset++;
  }
  return candidate;
};

// Get All Students with filters & pagination
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      classId,
      sectionId,
      status = 'active'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (classId) {
      whereClause.currentClassId = classId;
    }

    if (sectionId) {
      whereClause.currentSectionId = sectionId;
    }

    if (search) {
      whereClause[Op.or] = [
        { admissionNo: { [Op.iLike]: `%${search}%` } },
        { rollNo: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { bFormNo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['currentClassId', 'ASC'], ['admissionNo', 'ASC']],
      include: [
        { model: Class, as: 'currentClass', attributes: ['id', 'name'] },
        { model: Section, as: 'currentSection', attributes: ['id', 'name'] },
        { model: AcademicSession, as: 'currentSession', attributes: ['id', 'name'] },
        {
          model: Parent,
          as: 'parents',
          attributes: ['id', 'fatherName', 'fatherPhone', 'fatherCnic']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      students: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Student Full Profile
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        { model: Class, as: 'currentClass' },
        { model: Section, as: 'currentSection' },
        { model: AcademicSession, as: 'currentSession' },
        { model: Parent, as: 'parents' },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            { model: Class, as: 'class' },
            { model: Section, as: 'section' },
            { model: AcademicSession, as: 'academicSession' }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Recent Attendance (Last 30 records)
    const attendances = await StudentAttendance.findAll({
      where: { studentId: id },
      limit: 30,
      order: [['date', 'DESC']]
    });

    // Fee Vouchers & Payments
    const vouchers = await FeeVoucher.findAll({
      where: { studentId: id },
      order: [['year', 'DESC'], ['month', 'DESC']],
      include: [{ model: Class, as: 'class', attributes: ['name'] }]
    });

    // Exam Results
    const examMarks = await StudentMark.findAll({
      where: { studentId: id },
      include: [
        {
          model: ExamSubject,
          as: 'examSubject',
          include: [
            { model: Examination, as: 'examination' },
            { model: Subject, as: 'subject' }
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      student,
      attendance: attendances,
      vouchers,
      examMarks
    });
  } catch (error) {
    next(error);
  }
};

// Create Student
const createStudent = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      firstName,
      lastName,
      gender,
      dob,
      bloodGroup,
      bFormNo,
      religion = 'Islam',
      nationality = 'Pakistani',
      admissionDate,
      previousSchool,
      classId,
      sectionId,
      sessionId,
      emergencyContactName,
      emergencyContactPhone,
      address,
      city = 'Lahore',
      state = 'Punjab',
      rollNo,
      // Parent Information
      fatherName,
      fatherCnic,
      fatherOccupation,
      fatherPhone,
      fatherEmail
    } = req.body;

    if (!firstName || !lastName || !gender || !dob || !classId || !sectionId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'First name, last name, gender, dob, class, and section are required.'
      });
    }

    // Active session if not provided
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const activeSession = await AcademicSession.findOne({ where: { isCurrent: true } });
      activeSessionId = activeSession ? activeSession.id : 1;
    }

    const admissionNo = await generateAdmissionNumber();

    // 1. Create or Find Parent
    let parent = null;
    if (fatherName && (fatherPhone || fatherCnic)) {
      if (fatherCnic) {
        parent = await Parent.findOne({ where: { fatherCnic } });
      }
      if (!parent) {
        parent = await Parent.create({
          fatherName,
          fatherCnic,
          fatherOccupation,
          fatherPhone: fatherPhone || emergencyContactPhone,
          fatherEmail,
          address
        }, { transaction });
      }
    }

    // 2. Create Student
    const student = await Student.create({
      admissionNo,
      rollNo,
      firstName,
      lastName,
      gender,
      dob,
      bloodGroup,
      bFormNo: bFormNo || null,
      religion,
      nationality,
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
      previousSchool,
      currentClassId: classId,
      currentSectionId: sectionId,
      currentSessionId: activeSessionId,
      emergencyContactName: emergencyContactName || fatherName,
      emergencyContactPhone: emergencyContactPhone || fatherPhone,
      address,
      city,
      state,
      status: 'active'
    }, { transaction });

    // 3. Link Parent
    if (parent) {
      await StudentParent.create({
        studentId: student.id,
        parentId: parent.id,
        relationship: 'father'
      }, { transaction });
    }

    // 4. Create Enrollment
    await Enrollment.create({
      studentId: student.id,
      academicSessionId: activeSessionId,
      classId,
      sectionId,
      rollNo,
      enrollmentDate: admissionDate || new Date().toISOString().split('T')[0],
      status: 'enrolled'
    }, { transaction });

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: student.id,
      details: { admissionNo, name: `${firstName} ${lastName}`, classId },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update Student
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const {
      firstName,
      lastName,
      gender,
      dob,
      bloodGroup,
      bFormNo,
      religion,
      nationality,
      previousSchool,
      currentClassId,
      currentSectionId,
      rollNo,
      status,
      address,
      city,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    await student.update({
      firstName: firstName || student.firstName,
      lastName: lastName || student.lastName,
      gender: gender || student.gender,
      dob: dob || student.dob,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : student.bloodGroup,
      bFormNo: bFormNo !== undefined ? bFormNo : student.bFormNo,
      religion: religion || student.religion,
      nationality: nationality || student.nationality,
      previousSchool: previousSchool !== undefined ? previousSchool : student.previousSchool,
      currentClassId: currentClassId || student.currentClassId,
      currentSectionId: currentSectionId || student.currentSectionId,
      rollNo: rollNo !== undefined ? rollNo : student.rollNo,
      status: status || student.status,
      address: address !== undefined ? address : student.address,
      city: city || student.city,
      emergencyContactName: emergencyContactName || student.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone || student.emergencyContactPhone
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: student.id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Student details updated successfully',
      student
    });
  } catch (error) {
    next(error);
  }
};

// Safe Archive/Delete Student
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Soft archive by marking status as alumni or transferred
    await student.update({ status: 'transferred' });

    await logAction({
      userId: req.user?.id,
      action: 'ARCHIVE_STUDENT',
      entity: 'Student',
      entityId: student.id,
      details: { admissionNo: student.admissionNo },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Student archived safely (status set to transferred).'
    });
  } catch (error) {
    next(error);
  }
};

// Promote Student to Next Class/Session
const promoteStudent = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { newClassId, newSectionId, newSessionId, rollNo } = req.body;

    if (!newClassId || !newSectionId || !newSessionId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'New Class, Section, and Academic Session are required for promotion.'
      });
    }

    const student = await Student.findByPk(id, { transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Mark previous enrollment as promoted
    await Enrollment.update(
      { status: 'promoted' },
      { where: { studentId: id, academicSessionId: student.currentSessionId }, transaction }
    );

    // Create new enrollment
    await Enrollment.create({
      studentId: id,
      academicSessionId: newSessionId,
      classId: newClassId,
      sectionId: newSectionId,
      rollNo: rollNo || student.rollNo,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'enrolled'
    }, { transaction });

    // Update Student current class/section/session
    await student.update({
      currentClassId: newClassId,
      currentSectionId: newSectionId,
      currentSessionId: newSessionId,
      rollNo: rollNo || student.rollNo
    }, { transaction });

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'PROMOTE_STUDENT',
      entity: 'Student',
      entityId: student.id,
      details: { newClassId, newSectionId, newSessionId },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Student promoted successfully to next class and session.',
      student
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  promoteStudent,
  generateAdmissionNumber
};


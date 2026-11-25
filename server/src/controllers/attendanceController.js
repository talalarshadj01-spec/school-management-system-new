const { Op } = require('sequelize');
const { sequelize, StudentAttendance, Student, Class, Section, TeacherAttendance, Teacher } = require('../models');
const { logAction } = require('../services/auditService');

// Get Class Attendance for a Date
const getClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    if (!classId || !sectionId || !date) {
      return res.status(400).json({ success: false, message: 'Class, Section and Date are required.' });
    }

    // Get all active students enrolled in this class & section
    const students = await Student.findAll({
      where: { currentClassId: classId, currentSectionId: sectionId, status: 'active' },
      order: [['rollNo', 'ASC'], ['firstName', 'ASC']],
      attributes: ['id', 'admissionNo', 'rollNo', 'firstName', 'lastName']
    });

    // Get existing marked attendance for this date
    const markedRecords = await StudentAttendance.findAll({
      where: { classId, sectionId, date }
    });

    const attendanceMap = {};
    markedRecords.forEach((rec) => {
      attendanceMap[rec.studentId] = rec;
    });

    const result = students.map((stu) => ({
      studentId: stu.id,
      admissionNo: stu.admissionNo,
      rollNo: stu.rollNo,
      name: `${stu.firstName} ${stu.lastName}`,
      status: attendanceMap[stu.id]?.status || 'present',
      remarks: attendanceMap[stu.id]?.remarks || '',
      attendanceId: attendanceMap[stu.id]?.id || null
    }));

    return res.status(200).json({
      success: true,
      date,
      classId,
      sectionId,
      isMarked: markedRecords.length > 0,
      students: result
    });
  } catch (error) {
    next(error);
  }
};

// Save / Mark Bulk Attendance
const saveBulkAttendance = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { classId, sectionId, date, records } = req.body;
    if (!classId || !sectionId || !date || !Array.isArray(records)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Class, Section, Date, and Records array are required.' });
    }

    for (const item of records) {
      const [rec, created] = await StudentAttendance.findOrCreate({
        where: { studentId: item.studentId, date },
        defaults: {
          studentId: item.studentId,
          classId,
          sectionId,
          date,
          status: item.status || 'present',
          remarks: item.remarks || null,
          markedById: req.user?.id
        },
        transaction
      });

      if (!created) {
        await rec.update({
          status: item.status || rec.status,
          remarks: item.remarks !== undefined ? item.remarks : rec.remarks,
          markedById: req.user?.id
        }, { transaction });
      }
    }

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'MARK_ATTENDANCE',
      entity: 'StudentAttendance',
      details: { classId, sectionId, date, totalMarked: records.length },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance saved successfully.'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Monthly Attendance Summary Report
const getMonthlyReport = async (req, res, next) => {
  try {
    const { classId, sectionId, month, year } = req.query;
    if (!classId || !sectionId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Class, Section, Month, and Year are required.' });
    }

    const students = await Student.findAll({
      where: { currentClassId: classId, currentSectionId: sectionId, status: 'active' },
      order: [['rollNo', 'ASC']],
      attributes: ['id', 'admissionNo', 'rollNo', 'firstName', 'lastName']
    });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const attendances = await StudentAttendance.findAll({
      where: {
        classId,
        sectionId,
        date: { [Op.between]: [startDate, endDate] }
      }
    });

    const summary = students.map((stu) => {
      const stuAtts = attendances.filter((a) => a.studentId === stu.id);
      const presentCount = stuAtts.filter((a) => a.status === 'present').length;
      const lateCount = stuAtts.filter((a) => a.status === 'late').length;
      const absentCount = stuAtts.filter((a) => a.status === 'absent').length;
      const leaveCount = stuAtts.filter((a) => a.status === 'leave').length;
      const totalMarked = stuAtts.length;
      const percentage = totalMarked > 0 ? (((presentCount + lateCount) / totalMarked) * 100).toFixed(1) : '100.0';

      return {
        studentId: stu.id,
        admissionNo: stu.admissionNo,
        rollNo: stu.rollNo,
        name: `${stu.firstName} ${stu.lastName}`,
        presentCount,
        lateCount,
        absentCount,
        leaveCount,
        totalMarked,
        percentage
      };
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClassAttendance,
  saveBulkAttendance,
  getMonthlyReport
};


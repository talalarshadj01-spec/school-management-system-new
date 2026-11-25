const { Timetable, Class, Section, Subject, Teacher, AcademicSession } = require('../models');

const getTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId, teacherId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;

    const schedule = await Timetable.findAll({
      where,
      order: [['dayOfWeek', 'ASC'], ['periodNo', 'ASC']],
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: Section, as: 'section', attributes: ['id', 'name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
        { model: Teacher, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};

const createTimetableSlot = async (req, res, next) => {
  try {
    const {
      academicSessionId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      periodNo,
      startTime,
      endTime,
      roomNo
    } = req.body;

    // Check teacher collision
    const teacherCollision = await Timetable.findOne({
      where: { teacherId, dayOfWeek, periodNo }
    });
    if (teacherCollision) {
      return res.status(400).json({
        success: false,
        message: 'Collision detected: Teacher already has a period assigned at this time slot.'
      });
    }

    // Check class room collision
    const classCollision = await Timetable.findOne({
      where: { classId, sectionId, dayOfWeek, periodNo }
    });
    if (classCollision) {
      return res.status(400).json({
        success: false,
        message: 'Collision detected: This class section already has a subject scheduled for this period.'
      });
    }

    const slot = await Timetable.create({
      academicSessionId: academicSessionId || 1,
      classId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      periodNo,
      startTime,
      endTime,
      roomNo
    });

    return res.status(201).json({ success: true, slot });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTimetable, createTimetableSlot };


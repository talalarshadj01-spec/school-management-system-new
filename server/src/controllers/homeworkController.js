const { Homework, HomeworkSubmission, Class, Section, Subject, Teacher, Student } = require('../models');

const getHomework = async (req, res, next) => {
  try {
    const { classId, sectionId, teacherId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;

    const list = await Homework.findAll({
      where,
      order: [['dueDate', 'DESC']],
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: Section, as: 'section', attributes: ['id', 'name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
        { model: Teacher, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    return res.status(200).json({ success: true, homework: list });
  } catch (error) {
    next(error);
  }
};

const createHomework = async (req, res, next) => {
  try {
    const { classId, sectionId, subjectId, teacherId, title, description, assignedDate, dueDate } = req.body;
    const effectiveTeacherId = teacherId || req.user.linkedProfile?.id;

    const homework = await Homework.create({
      classId,
      sectionId,
      subjectId,
      teacherId: effectiveTeacherId,
      title,
      description,
      assignedDate: assignedDate || new Date().toISOString().split('T')[0],
      dueDate
    });

    return res.status(201).json({ success: true, homework });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHomework, createHomework };


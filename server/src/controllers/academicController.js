const { AcademicSession, Class, Section, Subject, ClassSubject, Teacher } = require('../models');
const { logAction } = require('../services/auditService');

// SESSIONS
const getSessions = async (req, res, next) => {
  try {
    const sessions = await AcademicSession.findAll({ order: [['startDate', 'DESC']] });
    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const { name, startDate, endDate, isCurrent = false } = req.body;
    if (isCurrent) {
      await AcademicSession.update({ isCurrent: false }, { where: {} });
    }
    const session = await AcademicSession.create({
      name,
      startDate,
      endDate,
      isCurrent,
      status: isCurrent ? 'active' : 'upcoming'
    });
    return res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

const setActiveSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AcademicSession.update({ isCurrent: false, status: 'completed' }, { where: {} });
    await AcademicSession.update({ isCurrent: true, status: 'active' }, { where: { id } });
    return res.status(200).json({ success: true, message: 'Academic session marked as active.' });
  } catch (error) {
    next(error);
  }
};

// CLASSES & SECTIONS
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.findAll({
      order: [['numericValue', 'ASC']],
      include: [
        { model: Section, as: 'sections' },
        {
          model: ClassSubject,
          as: 'classSubjects',
          include: [
            { model: Subject, as: 'subject' },
            { model: Teacher, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
          ]
        }
      ]
    });
    return res.status(200).json({ success: true, classes });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, numericValue, description, sections = ['A'] } = req.body;
    const newClass = await Class.create({ name, numericValue, description });

    for (const secName of sections) {
      await Section.create({
        classId: newClass.id,
        name: secName,
        maxCapacity: 40
      });
    }

    return res.status(201).json({ success: true, class: newClass });
  } catch (error) {
    next(error);
  }
};

// SUBJECTS
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, type, description } = req.body;
    const subject = await Subject.create({ name, code, type, description });
    return res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// ASSIGN SUBJECT TO CLASS & TEACHER
const assignSubject = async (req, res, next) => {
  try {
    const { classId, subjectId, teacherId } = req.body;
    const [assignment, created] = await ClassSubject.findOrCreate({
      where: { classId, subjectId },
      defaults: { classId, subjectId, teacherId }
    });

    if (!created && teacherId) {
      await assignment.update({ teacherId });
    }

    return res.status(200).json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  createSession,
  setActiveSession,
  getClasses,
  createClass,
  getSubjects,
  createSubject,
  assignSubject
};


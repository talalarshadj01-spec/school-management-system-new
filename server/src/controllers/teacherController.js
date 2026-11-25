const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, Teacher, User, Role, ClassSubject, Class, Subject, Timetable, TeacherAttendance } = require('../models');
const { ROLES } = require('../constants/roles');
const { logAction } = require('../services/auditService');

// Get all teachers
const getTeachers = async (req, res, next) => {
  try {
    const { department, status = 'active', search } = req.query;
    const where = {};

    if (department) where.department = department;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const teachers = await Teacher.findAll({
      where,
      order: [['employeeId', 'ASC']],
      include: [
        {
          model: ClassSubject,
          as: 'assignedSubjects',
          include: [
            { model: Class, as: 'class', attributes: ['id', 'name'] },
            { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
          ]
        }
      ]
    });

    return res.status(200).json({ success: true, teachers });
  } catch (error) {
    next(error);
  }
};

// Get single teacher details
const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: ClassSubject,
          as: 'assignedSubjects',
          include: [
            { model: Class, as: 'class' },
            { model: Subject, as: 'subject' }
          ]
        }
      ]
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    // Timetable
    const timetable = await Timetable.findAll({
      where: { teacherId: id },
      order: [['dayOfWeek', 'ASC'], ['periodNo', 'ASC']],
      include: [
        { model: Class, as: 'class', attributes: ['name'] },
        { model: Subject, as: 'subject', attributes: ['name'] }
      ]
    });

    // Recent Attendance
    const attendances = await TeacherAttendance.findAll({
      where: { teacherId: id },
      limit: 30,
      order: [['date', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      teacher,
      timetable,
      attendances
    });
  } catch (error) {
    next(error);
  }
};

// Create Teacher (with system login user account)
const createTeacher = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      firstName,
      lastName,
      gender,
      dob,
      cnic,
      phone,
      email,
      qualification,
      experienceYears = 0,
      joiningDate,
      department,
      designation,
      basicSalary = 0,
      address,
      password = 'Teacher@123'
    } = req.body;

    if (!firstName || !lastName || !gender || !phone || !email || !joiningDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, gender, phone, email, and joining date are required.'
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Get Teacher role
    const teacherRole = await Role.findOne({ where: { name: ROLES.TEACHER } });

    // 1. Create User account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId: teacherRole ? teacherRole.id : 4,
      status: 'active'
    }, { transaction });

    // Generate Teacher employee ID
    const count = await Teacher.count();
    const employeeId = `TCH-${String(count + 101).padStart(3, '0')}`;

    // 2. Create Teacher record
    const teacher = await Teacher.create({
      userId: user.id,
      employeeId,
      firstName,
      lastName,
      gender,
      dob: dob || null,
      cnic: cnic || null,
      phone,
      email,
      qualification,
      experienceYears,
      joiningDate,
      department: department || 'General Academics',
      designation: designation || 'Subject Teacher',
      basicSalary,
      status: 'active',
      address
    }, { transaction });

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'CREATE_TEACHER',
      entity: 'Teacher',
      entityId: teacher.id,
      details: { employeeId, name: `${firstName} ${lastName}` },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      teacher
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update Teacher
const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const {
      firstName,
      lastName,
      gender,
      dob,
      cnic,
      phone,
      qualification,
      experienceYears,
      department,
      designation,
      basicSalary,
      status,
      address
    } = req.body;

    await teacher.update({
      firstName: firstName || teacher.firstName,
      lastName: lastName || teacher.lastName,
      gender: gender || teacher.gender,
      dob: dob || teacher.dob,
      cnic: cnic || teacher.cnic,
      phone: phone || teacher.phone,
      qualification: qualification !== undefined ? qualification : teacher.qualification,
      experienceYears: experienceYears !== undefined ? experienceYears : teacher.experienceYears,
      department: department || teacher.department,
      designation: designation || teacher.designation,
      basicSalary: basicSalary !== undefined ? basicSalary : teacher.basicSalary,
      status: status || teacher.status,
      address: address !== undefined ? address : teacher.address
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE_TEACHER',
      entity: 'Teacher',
      entityId: teacher.id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher
};


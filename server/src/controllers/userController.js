const bcrypt = require('bcryptjs');
const { User, Role, Permission } = require('../models');
const { logAction } = require('../services/auditService');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'refreshToken'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const roles = await Role.findAll();

    return res.status(200).json({ success: true, users, roles });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, roleId } = req.body;
    if (!email || !password || !firstName || !lastName || !roleId) {
      return res.status(400).json({ success: false, message: 'Email, password, names, and role are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId,
      status: 'active'
    });

    await logAction({
      userId: req.user?.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: user.id,
      details: { email, roleId },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, roleId } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({
      status: status || user.status,
      roleId: roleId || user.roleId
    });

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE_USER_STATUS',
      entity: 'User',
      entityId: user.id,
      details: { status, roleId },
      req
    });

    return res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUserStatus };


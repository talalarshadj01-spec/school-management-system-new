const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role, Permission, Teacher, Staff, Student, Parent } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { logAction } = require('../services/auditService');

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the administration.`
      });
    }

    // Check account lock
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account locked due to 5 failed login attempts. Try again in ${minutesRemaining} minutes.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates = { failedLoginAttempts: newAttempts };

      if (newAttempts >= 5) {
        updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await user.update(updates);

      await logAction({
        userId: user.id,
        action: 'FAILED_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: { attempts: newAttempts },
        req
      });

      return res.status(401).json({
        success: false,
        message: newAttempts >= 5 ? 'Account locked for 15 minutes due to 5 failed attempts.' : 'Invalid email or password.'
      });
    }

    // Password valid: reset lock/attempts and update last login
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role?.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await user.update({
      failedLoginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
      refreshToken
    });

    // Set secure cookie for refreshToken
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Fetch linked entity profile
    let linkedProfile = null;
    const roleName = user.role?.name;
    if (roleName === 'teacher') {
      linkedProfile = await Teacher.findOne({ where: { userId: user.id } });
    } else if (roleName === 'student') {
      linkedProfile = await Student.findOne({ where: { userId: user.id } });
    } else if (roleName === 'parent') {
      linkedProfile = await Parent.findOne({ where: { userId: user.id } });
    } else if (['accountant', 'receptionist', 'librarian'].includes(roleName)) {
      linkedProfile = await Staff.findOne({ where: { userId: user.id } });
    }

    await logAction({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role?.name,
        roleDisplayName: user.role?.displayName,
        permissions: user.role?.permissions?.map((p) => p.name) || [],
        linkedProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid session or revoked token.' });
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role?.name
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await User.update({ refreshToken: null }, { where: { id: req.user.id } });
      await logAction({
        userId: req.user.id,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user.id,
        req
      });
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User Profile
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshToken', 'resetPasswordToken', 'resetPasswordExpires'] },
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions', attributes: ['name'] }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let linkedProfile = null;
    const roleName = user.role?.name;
    if (roleName === 'teacher') {
      linkedProfile = await Teacher.findOne({ where: { userId: user.id } });
    } else if (roleName === 'student') {
      linkedProfile = await Student.findOne({ where: { userId: user.id } });
    } else if (roleName === 'parent') {
      linkedProfile = await Parent.findOne({
        where: { userId: user.id },
        include: [{ model: Student, as: 'students' }]
      });
    } else if (['accountant', 'receptionist', 'librarian'].includes(roleName)) {
      linkedProfile = await Staff.findOne({ where: { userId: user.id } });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role?.name,
        roleDisplayName: user.role?.displayName,
        permissions: user.role?.permissions?.map((p) => p.name) || [],
        linkedProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: newHashed });

    await logAction({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: user.id,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};


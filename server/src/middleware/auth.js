const { User, Role, Permission, Teacher, Staff, Student, Parent } = require('../models');
const { verifyAccessToken } = require('../utils/token');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token.'
      });
    }

    const user = await User.findByPk(decoded.id, {
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
        message: 'User account no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the school administrator.`
      });
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Role permissions list
    const permissions = user.role?.permissions?.map((p) => p.name) || [];

    // Find linked entity profiles
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

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name,
      roleDisplayName: user.role?.displayName,
      permissions,
      linkedProfile
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;


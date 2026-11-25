const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (req.user.role === 'super_admin' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${roles.join(', ')}].`
    });
  };
};

const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (req.user.role === 'super_admin' || req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Permission denied. Missing '${permission}'.`
    });
  };
};

module.exports = {
  authorizeRoles,
  authorizePermission
};


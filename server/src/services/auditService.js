const { AuditLog } = require('../models');

const logAction = async ({ userId = null, action, entity, entityId = null, details = null, req = null }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    await AuditLog.create({
      userId,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    // Non-blocking error for audit logging
    console.error('Audit log failed:', error.message);
  }
};

module.exports = { logAction };


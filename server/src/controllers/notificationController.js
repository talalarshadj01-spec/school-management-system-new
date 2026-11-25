const { Notification, User } = require('../models');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'announcement', targetRole = 'all' } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type,
      targetRole,
      createdById: req.user?.id
    });
    return res.status(201).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, createNotification };


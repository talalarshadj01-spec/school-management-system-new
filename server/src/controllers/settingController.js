const { SchoolSetting } = require('../models');
const { logAction } = require('../services/auditService');

const getSettings = async (req, res, next) => {
  try {
    const settingsList = await SchoolSetting.findAll();
    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      settings: settingsMap,
      raw: settingsList
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // key-value object
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      const [record] = await SchoolSetting.findOrCreate({
        where: { key },
        defaults: { key, value: String(value), group: 'general' }
      });
      await record.update({ value: String(value) });
    }

    await logAction({
      userId: req.user?.id,
      action: 'UPDATE_SETTINGS',
      entity: 'SchoolSetting',
      details: settings,
      req
    });

    return res.status(200).json({ success: true, message: 'School settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };


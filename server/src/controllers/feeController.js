const { Op } = require('sequelize');
const {
  sequelize,
  FeeCategory,
  FeeStructure,
  FeeVoucher,
  FeePayment,
  FeeAdjustment,
  Student,
  Class,
  AcademicSession,
  User
} = require('../models');
const { logAction } = require('../services/auditService');

// Fee Categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await FeeCategory.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, frequency, description } = req.body;
    const category = await FeeCategory.create({ name, frequency, description });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// Fee Structures
const getStructures = async (req, res, next) => {
  try {
    const { classId, sessionId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (sessionId) where.academicSessionId = sessionId;

    const structures = await FeeStructure.findAll({
      where,
      include: [
        { model: FeeCategory, as: 'category' },
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] }
      ]
    });
    return res.status(200).json({ success: true, structures });
  } catch (error) {
    next(error);
  }
};

const createStructure = async (req, res, next) => {
  try {
    const { academicSessionId, classId, feeCategoryId, amount, dueDateDay = 10 } = req.body;
    const structure = await FeeStructure.create({
      academicSessionId,
      classId,
      feeCategoryId,
      amount,
      dueDateDay
    });
    return res.status(201).json({ success: true, structure });
  } catch (error) {
    next(error);
  }
};

// Fee Vouchers List
const getVouchers = async (req, res, next) => {
  try {
    const { status, classId, month, year, search, page = 1, limit = 20 } = req.query;
    const where = {};
    const offset = (page - 1) * limit;

    if (status && status !== 'all') where.status = status;
    if (classId) where.classId = classId;
    if (month) where.month = parseInt(month, 10);
    if (year) where.year = parseInt(year, 10);

    const studentWhere = {};
    if (search) {
      studentWhere[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { admissionNo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await FeeVoucher.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['dueDate', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: Student,
          as: 'student',
          where: Object.keys(studentWhere).length ? studentWhere : undefined,
          attributes: ['id', 'admissionNo', 'rollNo', 'firstName', 'lastName']
        },
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: FeePayment, as: 'payments' }
      ]
    });

    return res.status(200).json({
      success: true,
      vouchers: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    next(error);
  }
};

// Generate Monthly Vouchers in Bulk for Class or All Students
const generateMonthlyVouchers = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { month, year, classId, issueDate, dueDate } = req.body;
    if (!month || !year || !issueDate || !dueDate) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Month, Year, Issue Date and Due Date are required.' });
    }

    const studentWhere = { status: 'active' };
    if (classId) studentWhere.currentClassId = classId;

    const students = await Student.findAll({ where: studentWhere, transaction });
    const structures = await FeeStructure.findAll({ transaction });

    let generatedCount = 0;
    const yearMonth = `${year}${String(month).padStart(2, '0')}`;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      // Check if voucher already exists
      const existing = await FeeVoucher.findOne({
        where: {
          studentId: student.id,
          month: parseInt(month, 10),
          year: parseInt(year, 10)
        },
        transaction
      });

      if (!existing) {
        // Calculate tuition fee from fee structure
        const matchingStructure = structures.find((s) => s.classId === student.currentClassId);
        const tuitionFee = matchingStructure ? parseFloat(matchingStructure.amount) : 5000.00;
        const voucherNo = `VCH-${yearMonth}-${String(student.id).padStart(4, '0')}-${Math.floor(100 + Math.random() * 900)}`;

        await FeeVoucher.create({
          voucherNo,
          studentId: student.id,
          academicSessionId: student.currentSessionId,
          classId: student.currentClassId,
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          issueDate,
          dueDate,
          tuitionFee,
          otherFees: 0.00,
          discountAmount: 0.00,
          fineAmount: 0.00,
          totalPayable: tuitionFee,
          paidAmount: 0.00,
          remainingAmount: tuitionFee,
          status: 'unpaid'
        }, { transaction });

        generatedCount++;
      }
    }

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'GENERATE_VOUCHERS',
      entity: 'FeeVoucher',
      details: { month, year, classId, generatedCount },
      req
    });

    return res.status(201).json({
      success: true,
      message: `Successfully generated ${generatedCount} vouchers for ${month}/${year}.`,
      generatedCount
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Collect / Record Fee Payment
const recordPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      feeVoucherId,
      amount,
      paymentMethod = 'cash',
      transactionReference,
      paymentDate,
      remarks
    } = req.body;

    if (!feeVoucherId || !amount || parseFloat(amount) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Valid voucher and payment amount required.' });
    }

    const voucher = await FeeVoucher.findByPk(feeVoucherId, { transaction });
    if (!voucher) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Fee voucher not found.' });
    }

    const payAmount = parseFloat(amount);
    const currentRemaining = parseFloat(voucher.remainingAmount);

    // Never allow overpayment
    if (payAmount > currentRemaining) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment amount (PKR ${payAmount}) exceeds remaining balance of PKR ${currentRemaining}.`
      });
    }

    const receiptNo = `REC-${voucher.voucherNo}-${Date.now().toString().slice(-4)}`;

    // Create Payment Record
    const payment = await FeePayment.create({
      receiptNo,
      feeVoucherId: voucher.id,
      studentId: voucher.studentId,
      amount: payAmount,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionReference: transactionReference || null,
      collectedById: req.user?.id,
      remarks: remarks || 'Fee received'
    }, { transaction });

    // Update Voucher Balances
    const newPaidAmount = parseFloat(voucher.paidAmount) + payAmount;
    const newRemainingAmount = currentRemaining - payAmount;
    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partially_paid';

    await voucher.update({
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus
    }, { transaction });

    await transaction.commit();

    await logAction({
      userId: req.user?.id,
      action: 'COLLECT_FEE',
      entity: 'FeePayment',
      entityId: payment.id,
      details: { voucherNo: voucher.voucherNo, amount: payAmount, receiptNo },
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      receiptNo,
      payment,
      voucher
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Fee Defaulters List
const getDefaulters = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const where = {
      status: { [Op.in]: ['unpaid', 'partially_paid'] },
      dueDate: { [Op.lt]: new Date().toISOString().split('T')[0] }
    };
    if (classId) where.classId = classId;

    const defaulters = await FeeVoucher.findAll({
      where,
      order: [['remainingAmount', 'DESC']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'admissionNo', 'rollNo', 'firstName', 'lastName', 'emergencyContactPhone']
        },
        { model: Class, as: 'class', attributes: ['id', 'name'] }
      ]
    });

    const totalOutstanding = defaulters.reduce((sum, item) => sum + parseFloat(item.remainingAmount), 0);

    return res.status(200).json({
      success: true,
      defaulters,
      totalDefaulters: defaulters.length,
      totalOutstanding
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  getStructures,
  createStructure,
  getVouchers,
  generateMonthlyVouchers,
  recordPayment,
  getDefaulters
};


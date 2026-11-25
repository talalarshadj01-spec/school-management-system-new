const { Op, fn, col } = require('sequelize');
const { Expense, Income, SalaryRecord, Teacher, Staff, User, FeePayment } = require('../models');
const { logAction } = require('../services/auditService');

// EXPENSES
const getExpenses = async (req, res, next) => {
  try {
    const { category, month, year, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const expenses = await Expense.findAll({
      where,
      order: [['expenseDate', 'DESC']]
    });

    const totalAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return res.status(200).json({ success: true, expenses, totalAmount });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { category, title, amount, expenseDate, paymentMethod = 'cash', referenceNo, description } = req.body;
    const expense = await Expense.create({
      category,
      title,
      amount,
      expenseDate,
      paymentMethod,
      referenceNo: referenceNo || `EXP-${Date.now().toString().slice(-6)}`,
      description,
      approvedById: req.user?.id
    });

    await logAction({
      userId: req.user?.id,
      action: 'RECORD_EXPENSE',
      entity: 'Expense',
      entityId: expense.id,
      details: { category, amount, title },
      req
    });

    return res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// INCOMES
const getIncomes = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const incomes = await Income.findAll({
      where,
      order: [['incomeDate', 'DESC']]
    });

    const totalAmount = incomes.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return res.status(200).json({ success: true, incomes, totalAmount });
  } catch (error) {
    next(error);
  }
};

const createIncome = async (req, res, next) => {
  try {
    const { category, title, amount, incomeDate, paymentMethod = 'cash', description } = req.body;
    const income = await Income.create({
      category,
      title,
      amount,
      incomeDate,
      paymentMethod,
      description,
      receivedById: req.user?.id
    });

    await logAction({
      userId: req.user?.id,
      action: 'RECORD_INCOME',
      entity: 'Income',
      entityId: income.id,
      details: { category, amount, title },
      req
    });

    return res.status(201).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

// SALARIES
const getSalaries = async (req, res, next) => {
  try {
    const { month, year, status } = req.query;
    const where = {};
    if (month) where.month = month;
    if (year) where.year = year;
    if (status) where.status = status;

    const salaries = await SalaryRecord.findAll({
      where,
      order: [['year', 'DESC'], ['month', 'DESC']],
      include: [
        { model: Teacher, as: 'teacher', attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'] },
        { model: Staff, as: 'staff', attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department'] }
      ]
    });

    return res.status(200).json({ success: true, salaries });
  } catch (error) {
    next(error);
  }
};

const paySalary = async (req, res, next) => {
  try {
    const {
      employeeType, // 'teacher' or 'staff'
      employeeId, // record id
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      paymentMethod = 'bank_transfer',
      transactionReference
    } = req.body;

    const netSalary = parseFloat(basicSalary) + parseFloat(allowances) - parseFloat(deductions);

    const salary = await SalaryRecord.create({
      employeeType,
      teacherId: employeeType === 'teacher' ? employeeId : null,
      staffId: employeeType === 'staff' ? employeeId : null,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionReference,
      paidById: req.user?.id
    });

    // Also record as expense under 'Salaries'
    await Expense.create({
      category: 'Salaries',
      title: `Salary Disbursement for ${employeeType.toUpperCase()} (ID: ${employeeId}) - ${month}/${year}`,
      amount: netSalary,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNo: transactionReference || `SAL-${month}${year}-${employeeId}`,
      approvedById: req.user?.id
    });

    await logAction({
      userId: req.user?.id,
      action: 'PAY_SALARY',
      entity: 'SalaryRecord',
      entityId: salary.id,
      details: { employeeType, employeeId, netSalary },
      req
    });

    return res.status(201).json({ success: true, salary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getIncomes,
  createIncome,
  getSalaries,
  paySalary
};


const ExcelJS = require('exceljs');
const { Student, Class, Section, FeeVoucher, FeePayment, StudentAttendance, Teacher } = require('../models');

// Export Students to Excel
const exportStudentsExcel = async (req, res, next) => {
  try {
    const students = await Student.findAll({
      order: [['currentClassId', 'ASC'], ['admissionNo', 'ASC']],
      include: [
        { model: Class, as: 'currentClass', attributes: ['name'] },
        { model: Section, as: 'currentSection', attributes: ['name'] }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'Admission No', key: 'admissionNo', width: 18 },
      { header: 'Roll No', key: 'rollNo', width: 12 },
      { header: 'First Name', key: 'firstName', width: 18 },
      { header: 'Last Name', key: 'lastName', width: 18 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Class', key: 'class', width: 14 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'B-Form / CNIC', key: 'bForm', width: 20 },
      { header: 'Emergency Contact', key: 'phone', width: 18 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Styling Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A5F' }
    };

    students.forEach((s) => {
      worksheet.addRow({
        admissionNo: s.admissionNo,
        rollNo: s.rollNo || '-',
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        class: s.currentClass?.name || '-',
        section: s.currentSection?.name || '-',
        bForm: s.bFormNo || '-',
        phone: s.emergencyContactPhone || '-',
        status: s.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Students_Directory.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// Export Fees to Excel
const exportFeesExcel = async (req, res, next) => {
  try {
    const vouchers = await FeeVoucher.findAll({
      order: [['dueDate', 'DESC']],
      include: [
        { model: Student, as: 'student', attributes: ['admissionNo', 'firstName', 'lastName'] },
        { model: Class, as: 'class', attributes: ['name'] }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fee Vouchers');

    worksheet.columns = [
      { header: 'Voucher No', key: 'voucherNo', width: 22 },
      { header: 'Admission No', key: 'admissionNo', width: 18 },
      { header: 'Student Name', key: 'studentName', width: 22 },
      { header: 'Class', key: 'class', width: 14 },
      { header: 'Month / Year', key: 'period', width: 15 },
      { header: 'Total (PKR)', key: 'total', width: 14 },
      { header: 'Paid (PKR)', key: 'paid', width: 14 },
      { header: 'Remaining (PKR)', key: 'remaining', width: 16 },
      { header: 'Status', key: 'status', width: 14 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A5F' }
    };

    vouchers.forEach((v) => {
      worksheet.addRow({
        voucherNo: v.voucherNo,
        admissionNo: v.student?.admissionNo || '-',
        studentName: `${v.student?.firstName || ''} ${v.student?.lastName || ''}`.trim(),
        class: v.class?.name || '-',
        period: `${v.month}/${v.year}`,
        total: parseFloat(v.totalPayable),
        paid: parseFloat(v.paidAmount),
        remaining: parseFloat(v.remainingAmount),
        status: v.status.toUpperCase()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Fee_Collection_Report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportStudentsExcel, exportFeesExcel };


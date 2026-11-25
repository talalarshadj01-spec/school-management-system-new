const { sequelize } = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const AcademicSession = require('./AcademicSession');
const Class = require('./Class');
const Section = require('./Section');
const Subject = require('./Subject');
const ClassSubject = require('./ClassSubject');
const Student = require('./Student');
const Parent = require('./Parent');
const StudentParent = require('./StudentParent');
const Teacher = require('./Teacher');
const Staff = require('./Staff');
const Enrollment = require('./Enrollment');
const StudentAttendance = require('./StudentAttendance');
const TeacherAttendance = require('./TeacherAttendance');
const FeeCategory = require('./FeeCategory');
const FeeStructure = require('./FeeStructure');
const FeeVoucher = require('./FeeVoucher');
const FeePayment = require('./FeePayment');
const FeeAdjustment = require('./FeeAdjustment');
const Examination = require('./Examination');
const ExamSubject = require('./ExamSubject');
const StudentMark = require('./StudentMark');
const Grade = require('./Grade');
const Timetable = require('./Timetable');
const Homework = require('./Homework');
const HomeworkSubmission = require('./HomeworkSubmission');
const Expense = require('./Expense');
const Income = require('./Income');
const SalaryRecord = require('./SalaryRecord');
const LeaveRequest = require('./LeaveRequest');
const BookCategory = require('./BookCategory');
const Book = require('./Book');
const LibraryIssue = require('./LibraryIssue');
const Vehicle = require('./Vehicle');
const TransportRoute = require('./TransportRoute');
const RouteStop = require('./RouteStop');
const StudentTransport = require('./StudentTransport');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const SchoolSetting = require('./SchoolSetting');

// 1. Roles & Permissions & Users
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });

// 2. Academics & Classes
Class.hasMany(Section, { foreignKey: 'classId', as: 'sections', onDelete: 'CASCADE' });
Section.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Class.hasMany(ClassSubject, { foreignKey: 'classId', as: 'classSubjects' });
ClassSubject.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Subject.hasMany(ClassSubject, { foreignKey: 'subjectId', as: 'classSubjects' });
ClassSubject.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Teacher.hasMany(ClassSubject, { foreignKey: 'teacherId', as: 'assignedSubjects' });
ClassSubject.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// 3. Students, Parents & Enrollments
Student.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });
Staff.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });
Parent.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });

Student.belongsTo(Class, { foreignKey: 'currentClassId', as: 'currentClass' });
Student.belongsTo(Section, { foreignKey: 'currentSectionId', as: 'currentSection' });
Student.belongsTo(AcademicSession, { foreignKey: 'currentSessionId', as: 'currentSession' });

Student.belongsToMany(Parent, { through: StudentParent, foreignKey: 'studentId', otherKey: 'parentId', as: 'parents' });
Parent.belongsToMany(Student, { through: StudentParent, foreignKey: 'parentId', otherKey: 'studentId', as: 'students' });

Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Enrollment.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Enrollment.belongsTo(AcademicSession, { foreignKey: 'academicSessionId', as: 'academicSession' });

// 4. Attendance
Student.hasMany(StudentAttendance, { foreignKey: 'studentId', as: 'attendances' });
StudentAttendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentAttendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
StudentAttendance.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

Teacher.hasMany(TeacherAttendance, { foreignKey: 'teacherId', as: 'attendances' });
TeacherAttendance.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// 5. Fees & Payments
FeeCategory.hasMany(FeeStructure, { foreignKey: 'feeCategoryId', as: 'structures' });
FeeStructure.belongsTo(FeeCategory, { foreignKey: 'feeCategoryId', as: 'category' });
FeeStructure.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
FeeStructure.belongsTo(AcademicSession, { foreignKey: 'academicSessionId', as: 'academicSession' });

Student.hasMany(FeeVoucher, { foreignKey: 'studentId', as: 'vouchers' });
FeeVoucher.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
FeeVoucher.belongsTo(AcademicSession, { foreignKey: 'academicSessionId', as: 'academicSession' });
FeeVoucher.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

FeeVoucher.hasMany(FeePayment, { foreignKey: 'feeVoucherId', as: 'payments' });
FeePayment.belongsTo(FeeVoucher, { foreignKey: 'feeVoucherId', as: 'voucher' });
FeePayment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
FeePayment.belongsTo(User, { foreignKey: 'collectedById', as: 'collector' });

FeeVoucher.hasMany(FeeAdjustment, { foreignKey: 'feeVoucherId', as: 'adjustments' });
FeeAdjustment.belongsTo(FeeVoucher, { foreignKey: 'feeVoucherId', as: 'voucher' });

// 6. Examinations & Results
Examination.belongsTo(AcademicSession, { foreignKey: 'academicSessionId', as: 'academicSession' });
Examination.hasMany(ExamSubject, { foreignKey: 'examinationId', as: 'examSubjects', onDelete: 'CASCADE' });
ExamSubject.belongsTo(Examination, { foreignKey: 'examinationId', as: 'examination' });
ExamSubject.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
ExamSubject.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

ExamSubject.hasMany(StudentMark, { foreignKey: 'examSubjectId', as: 'marks', onDelete: 'CASCADE' });
StudentMark.belongsTo(ExamSubject, { foreignKey: 'examSubjectId', as: 'examSubject' });
StudentMark.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// 7. Timetable
Timetable.belongsTo(AcademicSession, { foreignKey: 'academicSessionId', as: 'academicSession' });
Timetable.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Timetable.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Timetable.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Timetable.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// 8. Homework
Homework.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Homework.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Homework.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Homework.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Homework.hasMany(HomeworkSubmission, { foreignKey: 'homeworkId', as: 'submissions' });
HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homeworkId', as: 'homework' });
HomeworkSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// 9. Finance & Salaries
SalaryRecord.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
SalaryRecord.belongsTo(Staff, { foreignKey: 'staffId', as: 'staff' });

// 10. Library
BookCategory.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(BookCategory, { foreignKey: 'categoryId', as: 'category' });
Book.hasMany(LibraryIssue, { foreignKey: 'bookId', as: 'issues' });
LibraryIssue.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
LibraryIssue.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
LibraryIssue.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// 11. Transport
Vehicle.hasMany(TransportRoute, { foreignKey: 'vehicleId', as: 'routes' });
TransportRoute.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
TransportRoute.hasMany(RouteStop, { foreignKey: 'routeId', as: 'stops' });
RouteStop.belongsTo(TransportRoute, { foreignKey: 'routeId', as: 'route' });

StudentTransport.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentTransport.belongsTo(TransportRoute, { foreignKey: 'routeId', as: 'route' });
StudentTransport.belongsTo(RouteStop, { foreignKey: 'stopId', as: 'stop' });

// 12. Audit & Notifications
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  AcademicSession,
  Class,
  Section,
  Subject,
  ClassSubject,
  Student,
  Parent,
  StudentParent,
  Teacher,
  Staff,
  Enrollment,
  StudentAttendance,
  TeacherAttendance,
  FeeCategory,
  FeeStructure,
  FeeVoucher,
  FeePayment,
  FeeAdjustment,
  Examination,
  ExamSubject,
  StudentMark,
  Grade,
  Timetable,
  Homework,
  HomeworkSubmission,
  Expense,
  Income,
  SalaryRecord,
  LeaveRequest,
  BookCategory,
  Book,
  LibraryIssue,
  Vehicle,
  TransportRoute,
  RouteStop,
  StudentTransport,
  Notification,
  AuditLog,
  SchoolSetting
};


const PERMISSIONS = {
  // Users & Roles
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',

  // Students
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_EDIT: 'students.edit',
  STUDENTS_DELETE: 'students.delete',
  STUDENTS_PROMOTE: 'students.promote',

  // Teachers & Staff
  TEACHERS_VIEW: 'teachers.view',
  TEACHERS_CREATE: 'teachers.create',
  TEACHERS_EDIT: 'teachers.edit',
  TEACHERS_DELETE: 'teachers.delete',
  STAFF_MANAGE: 'staff.manage',

  // Academics
  ACADEMICS_MANAGE: 'academics.manage',
  CLASSES_MANAGE: 'classes.manage',
  SUBJECTS_MANAGE: 'subjects.manage',
  TIMETABLE_MANAGE: 'timetable.manage',

  // Attendance
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_EDIT: 'attendance.edit',

  // Fees & Finance
  FEES_VIEW: 'fees.view',
  FEES_COLLECT: 'fees.collect',
  FEES_MANAGE_STRUCTURE: 'fees.manage_structure',
  FEES_ADJUST: 'fees.adjust',
  EXPENSES_MANAGE: 'expenses.manage',
  SALARIES_MANAGE: 'salaries.manage',

  // Examinations
  EXAMS_MANAGE: 'exams.manage',
  EXAMS_MARKS_ENTRY: 'exams.marks_entry',
  EXAMS_PUBLISH: 'exams.publish',

  // Homework
  HOMEWORK_CREATE: 'homework.create',
  HOMEWORK_SUBMIT: 'homework.submit',
  HOMEWORK_GRADE: 'homework.grade',

  // Library & Transport
  LIBRARY_MANAGE: 'library.manage',
  TRANSPORT_MANAGE: 'transport.manage',

  // Communication & Reports
  NOTIFICATIONS_SEND: 'notifications.send',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  SETTINGS_MANAGE: 'settings.manage'
};

module.exports = PERMISSIONS;


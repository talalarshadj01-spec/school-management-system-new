const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  RECEPTIONIST: 'receptionist',
  LIBRARIAN: 'librarian',
  STUDENT: 'student',
  PARENT: 'parent'
};

const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'School Administrator',
  [ROLES.PRINCIPAL]: 'Principal',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.LIBRARIAN]: 'Librarian',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent'
};

module.exports = {
  ROLES,
  ROLE_DISPLAY_NAMES,
  ALL_ROLES: Object.values(ROLES)
};


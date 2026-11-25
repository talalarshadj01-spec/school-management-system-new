const bcrypt = require('bcryptjs');
const {
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
  BookCategory,
  Book,
  LibraryIssue,
  Vehicle,
  TransportRoute,
  RouteStop,
  StudentTransport,
  Notification,
  SchoolSetting
} = require('../models');

const { ROLES, ROLE_DISPLAY_NAMES } = require('../constants/roles');
const PERMISSIONS = require('../constants/permissions');

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Roles
  const rolesMap = {};
  for (const roleKey of Object.values(ROLES)) {
    const [role] = await Role.findOrCreate({
      where: { name: roleKey },
      defaults: {
        name: roleKey,
        displayName: ROLE_DISPLAY_NAMES[roleKey] || roleKey,
        description: `Access role for ${ROLE_DISPLAY_NAMES[roleKey]}`,
        isSystem: true
      }
    });
    rolesMap[roleKey] = role;
  }
  console.log('✅ Roles seeded.');

  // 2. Permissions
  const permissionsList = Object.values(PERMISSIONS).map((perm) => ({
    name: perm,
    module: perm.split('.')[0],
    description: `Allows action ${perm}`
  }));

  for (const p of permissionsList) {
    await Permission.findOrCreate({
      where: { name: p.name },
      defaults: p
    });
  }
  const allPermissions = await Permission.findAll();
  console.log(`✅ ${allPermissions.length} Permissions seeded.`);

  // Assign all permissions to Super Admin and Admin
  await rolesMap[ROLES.SUPER_ADMIN].setPermissions(allPermissions);
  await rolesMap[ROLES.ADMIN].setPermissions(allPermissions);
  await rolesMap[ROLES.PRINCIPAL].setPermissions(allPermissions);

  // Teacher permissions
  const teacherPerms = allPermissions.filter((p) =>
    ['students.view', 'attendance.view', 'attendance.mark', 'attendance.edit', 'exams.marks_entry', 'homework.create', 'homework.grade', 'reports.view'].includes(p.name)
  );
  await rolesMap[ROLES.TEACHER].setPermissions(teacherPerms);

  // Accountant permissions
  const accountantPerms = allPermissions.filter((p) =>
    ['fees.view', 'fees.collect', 'fees.manage_structure', 'fees.adjust', 'expenses.manage', 'salaries.manage', 'reports.view', 'reports.export'].includes(p.name)
  );
  await rolesMap[ROLES.ACCOUNTANT].setPermissions(accountantPerms);

  // Receptionist permissions
  const receptionistPerms = allPermissions.filter((p) =>
    ['students.view', 'students.create', 'attendance.view', 'notifications.send', 'reports.view'].includes(p.name)
  );
  await rolesMap[ROLES.RECEPTIONIST].setPermissions(receptionistPerms);

  // Librarian permissions
  const librarianPerms = allPermissions.filter((p) =>
    ['library.manage', 'students.view', 'reports.view'].includes(p.name)
  );
  await rolesMap[ROLES.LIBRARIAN].setPermissions(librarianPerms);

  // Student & Parent permissions
  const studentPerms = allPermissions.filter((p) =>
    ['homework.submit', 'attendance.view', 'reports.view'].includes(p.name)
  );
  await rolesMap[ROLES.STUDENT].setPermissions(studentPerms);
  await rolesMap[ROLES.PARENT].setPermissions(studentPerms);

  // 3. School Settings
  const settings = [
    { key: 'school_name', value: 'Iqbal Memorial Public School & College', group: 'general', description: 'Official School Name' },
    { key: 'school_tagline', value: 'Excellence in Education, Character in Life', group: 'general', description: 'School Motto' },
    { key: 'school_address', value: 'Sector G-4, Phase 2, Johar Town, Lahore, Pakistan', group: 'general', description: 'School Campus Address' },
    { key: 'school_phone', value: '+92 42 35891234', group: 'general', description: 'Office Landline' },
    { key: 'school_email', value: 'info@iqbalmemorial.edu.pk', group: 'general', description: 'Official Email' },
    { key: 'school_currency', value: 'PKR', group: 'finance', description: 'Operating Currency' },
    { key: 'school_currency_symbol', value: '₨', group: 'finance', description: 'Currency Symbol' },
    { key: 'default_fee_due_day', value: '10', group: 'finance', description: 'Day of month fee is due' },
    { key: 'late_fee_fine_amount', value: '300', group: 'finance', description: 'Late fee fine in PKR' },
    { key: 'working_days', value: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', group: 'academics', description: 'Working days' },
    { key: 'default_language', value: 'en', group: 'localization', description: 'Default interface language (en/ur)' },
    { key: 'principal_name', value: 'Prof. Muhammad Tariq Khan (M.Phil, Education)', group: 'general', description: 'Head of Institution' }
  ];

  for (const s of settings) {
    await SchoolSetting.findOrCreate({ where: { key: s.key }, defaults: s });
  }
  console.log('✅ School Settings seeded.');

  // 4. Academic Session
  const [session2526] = await AcademicSession.findOrCreate({
    where: { name: '2025-2026' },
    defaults: {
      name: '2025-2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      isCurrent: true,
      status: 'active'
    }
  });

  const [session2627] = await AcademicSession.findOrCreate({
    where: { name: '2026-2027' },
    defaults: {
      name: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      isCurrent: false,
      status: 'upcoming'
    }
  });
  console.log('✅ Academic Sessions seeded.');

  // 5. Classes & Sections
  const classesData = [
    { name: 'Class 1', numericValue: 1 },
    { name: 'Class 2', numericValue: 2 },
    { name: 'Class 3', numericValue: 3 },
    { name: 'Class 4', numericValue: 4 },
    { name: 'Class 5', numericValue: 5 },
    { name: 'Class 6', numericValue: 6 },
    { name: 'Class 7', numericValue: 7 },
    { name: 'Class 8', numericValue: 8 },
    { name: 'Class 9', numericValue: 9 },
    { name: 'Class 10', numericValue: 10 }
  ];

  const createdClasses = [];
  for (const c of classesData) {
    const [cls] = await Class.findOrCreate({
      where: { name: c.name },
      defaults: c
    });
    createdClasses.push(cls);

    // Create Section A and Section B for each class
    await Section.findOrCreate({
      where: { classId: cls.id, name: 'A' },
      defaults: { classId: cls.id, name: 'A', roomNo: `Room ${cls.numericValue}01`, maxCapacity: 35 }
    });
    await Section.findOrCreate({
      where: { classId: cls.id, name: 'B' },
      defaults: { classId: cls.id, name: 'B', roomNo: `Room ${cls.numericValue}02`, maxCapacity: 35 }
    });
  }
  console.log('✅ Classes and Sections seeded.');

  // 6. Subjects
  const subjectsData = [
    { name: 'English Literature & Grammar', code: 'ENG-101', type: 'theory' },
    { name: 'Urdu Zaban-o-Adab', code: 'URD-101', type: 'theory' },
    { name: 'Mathematics', code: 'MTH-101', type: 'theory' },
    { name: 'General Science', code: 'SCI-101', type: 'theory' },
    { name: 'Islamiat Compulsory', code: 'ISL-101', type: 'theory' },
    { name: 'Pakistan Studies', code: 'PST-101', type: 'theory' },
    { name: 'Computer Science', code: 'CS-101', type: 'both' },
    { name: 'Physics', code: 'PHY-101', type: 'both' },
    { name: 'Chemistry', code: 'CHM-101', type: 'both' },
    { name: 'Biology', code: 'BIO-101', type: 'both' }
  ];

  const createdSubjects = [];
  for (const s of subjectsData) {
    const [subj] = await Subject.findOrCreate({
      where: { code: s.code },
      defaults: s
    });
    createdSubjects.push(subj);
  }
  console.log('✅ Subjects seeded.');

  // 7. Users (Accounts for each role)
  const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const teacherPasswordHash = await bcrypt.hash('Teacher@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const parentPasswordHash = await bcrypt.hash('Parent@123', 10);

  // Super Admin
  const [adminUser] = await User.findOrCreate({
    where: { email: 'admin@school.edu.pk' },
    defaults: {
      email: 'admin@school.edu.pk',
      password: defaultPasswordHash,
      firstName: 'Syed',
      lastName: 'Ahmad Raza',
      phone: '+92 300 1234567',
      roleId: rolesMap[ROLES.SUPER_ADMIN].id,
      status: 'active'
    }
  });

  // Principal
  const [principalUser] = await User.findOrCreate({
    where: { email: 'principal@school.edu.pk' },
    defaults: {
      email: 'principal@school.edu.pk',
      password: defaultPasswordHash,
      firstName: 'Tariq',
      lastName: 'Khan',
      phone: '+92 321 9876543',
      roleId: rolesMap[ROLES.PRINCIPAL].id,
      status: 'active'
    }
  });

  // Accountant
  const [accountantUser] = await User.findOrCreate({
    where: { email: 'accountant@school.edu.pk' },
    defaults: {
      email: 'accountant@school.edu.pk',
      password: staffPasswordHash,
      firstName: 'Abdul',
      lastName: 'Wahab',
      phone: '+92 333 4567890',
      roleId: rolesMap[ROLES.ACCOUNTANT].id,
      status: 'active'
    }
  });
  await Staff.findOrCreate({
    where: { employeeId: 'STF-ACC-01' },
    defaults: {
      userId: accountantUser.id,
      employeeId: 'STF-ACC-01',
      firstName: 'Abdul',
      lastName: 'Wahab',
      gender: 'male',
      phone: '+92 333 4567890',
      email: 'accountant@school.edu.pk',
      cnic: '35201-1122334-1',
      department: 'Finance & Accounts',
      designation: 'Senior Accountant',
      joiningDate: '2020-03-01',
      basicSalary: 85000.00,
      status: 'active',
      address: 'Model Town, Lahore'
    }
  });

  // Receptionist
  const [receptionistUser] = await User.findOrCreate({
    where: { email: 'receptionist@school.edu.pk' },
    defaults: {
      email: 'receptionist@school.edu.pk',
      password: staffPasswordHash,
      firstName: 'Maryam',
      lastName: 'Saeed',
      phone: '+92 345 1122334',
      roleId: rolesMap[ROLES.RECEPTIONIST].id,
      status: 'active'
    }
  });
  await Staff.findOrCreate({
    where: { employeeId: 'STF-REC-01' },
    defaults: {
      userId: receptionistUser.id,
      employeeId: 'STF-REC-01',
      firstName: 'Maryam',
      lastName: 'Saeed',
      gender: 'female',
      phone: '+92 345 1122334',
      email: 'receptionist@school.edu.pk',
      cnic: '35201-5566778-2',
      department: 'Administration',
      designation: 'Front Desk Receptionist',
      joiningDate: '2022-01-15',
      basicSalary: 55000.00,
      status: 'active',
      address: 'Faisal Town, Lahore'
    }
  });

  // Librarian
  const [librarianUser] = await User.findOrCreate({
    where: { email: 'librarian@school.edu.pk' },
    defaults: {
      email: 'librarian@school.edu.pk',
      password: staffPasswordHash,
      firstName: 'Rashid',
      lastName: 'Mehmood',
      phone: '+92 312 9988776',
      roleId: rolesMap[ROLES.LIBRARIAN].id,
      status: 'active'
    }
  });
  await Staff.findOrCreate({
    where: { employeeId: 'STF-LIB-01' },
    defaults: {
      userId: librarianUser.id,
      employeeId: 'STF-LIB-01',
      firstName: 'Rashid',
      lastName: 'Mehmood',
      gender: 'male',
      phone: '+92 312 9988776',
      email: 'librarian@school.edu.pk',
      cnic: '35201-9988776-5',
      department: 'Library',
      designation: 'Head Librarian',
      joiningDate: '2021-08-01',
      basicSalary: 60000.00,
      status: 'active',
      address: 'Iqbal Town, Lahore'
    }
  });

  // 8. Teachers
  const teachersSeed = [
    {
      email: 'asif.math@school.edu.pk',
      firstName: 'Muhammad',
      lastName: 'Asif',
      gender: 'male',
      phone: '+92 301 2345678',
      cnic: '35201-1234567-1',
      qualification: 'M.Sc. Mathematics (PU), B.Ed.',
      experienceYears: 8,
      joiningDate: '2019-02-15',
      department: 'Mathematics & Science',
      designation: 'Senior Mathematics Teacher',
      basicSalary: 95000.00,
      subjectCode: 'MTH-101'
    },
    {
      email: 'samina.eng@school.edu.pk',
      firstName: 'Samina',
      lastName: 'Parveen',
      gender: 'female',
      phone: '+92 302 3456789',
      cnic: '35202-2345678-2',
      qualification: 'M.A. English Literature (Kinnaird), M.Ed.',
      experienceYears: 10,
      joiningDate: '2018-09-01',
      department: 'Languages',
      designation: 'Head of English Dept',
      basicSalary: 110000.00,
      subjectCode: 'ENG-101'
    },
    {
      email: 'khalid.urdu@school.edu.pk',
      firstName: 'Khalid',
      lastName: 'Hussain',
      gender: 'male',
      phone: '+92 303 4567890',
      cnic: '35201-3456789-3',
      qualification: 'M.A. Urdu & Islamic Studies (GCU)',
      experienceYears: 6,
      joiningDate: '2021-03-10',
      department: 'Languages',
      designation: 'Urdu & Islamiat Lecturer',
      basicSalary: 80000.00,
      subjectCode: 'URD-101'
    },
    {
      email: 'bilal.phy@school.edu.pk',
      firstName: 'Bilal',
      lastName: 'Akram',
      gender: 'male',
      phone: '+92 304 5678901',
      cnic: '35201-4567890-4',
      qualification: 'M.Phil Physics (UET Lahore)',
      experienceYears: 5,
      joiningDate: '2022-04-01',
      department: 'Science',
      designation: 'Physics & Computer Specialist',
      basicSalary: 85000.00,
      subjectCode: 'PHY-101'
    }
  ];

  const createdTeachers = [];
  for (let i = 0; i < teachersSeed.length; i++) {
    const tData = teachersSeed[i];
    const [tUser] = await User.findOrCreate({
      where: { email: tData.email },
      defaults: {
        email: tData.email,
        password: teacherPasswordHash,
        firstName: tData.firstName,
        lastName: tData.lastName,
        phone: tData.phone,
        roleId: rolesMap[ROLES.TEACHER].id,
        status: 'active'
      }
    });

    const [teacher] = await Teacher.findOrCreate({
      where: { employeeId: `TCH-${100 + i + 1}` },
      defaults: {
        userId: tUser.id,
        employeeId: `TCH-${100 + i + 1}`,
        firstName: tData.firstName,
        lastName: tData.lastName,
        gender: tData.gender,
        phone: tData.phone,
        email: tData.email,
        cnic: tData.cnic,
        qualification: tData.qualification,
        experienceYears: tData.experienceYears,
        joiningDate: tData.joiningDate,
        department: tData.department,
        designation: tData.designation,
        basicSalary: tData.basicSalary,
        status: 'active',
        address: 'Wapda Town, Lahore'
      }
    });
    createdTeachers.push(teacher);
  }
  console.log(`✅ ${createdTeachers.length} Teachers seeded.`);

  // 9. Assign Class-Subjects
  const class9 = createdClasses.find((c) => c.numericValue === 9) || createdClasses[0];
  const class10 = createdClasses.find((c) => c.numericValue === 10) || createdClasses[1];
  const mathSubj = createdSubjects.find((s) => s.code === 'MTH-101');
  const engSubj = createdSubjects.find((s) => s.code === 'ENG-101');
  const urduSubj = createdSubjects.find((s) => s.code === 'URD-101');
  const phySubj = createdSubjects.find((s) => s.code === 'PHY-101');

  if (class9 && mathSubj && createdTeachers[0]) {
    await ClassSubject.findOrCreate({
      where: { classId: class9.id, subjectId: mathSubj.id },
      defaults: { classId: class9.id, subjectId: mathSubj.id, teacherId: createdTeachers[0].id }
    });
  }
  if (class9 && engSubj && createdTeachers[1]) {
    await ClassSubject.findOrCreate({
      where: { classId: class9.id, subjectId: engSubj.id },
      defaults: { classId: class9.id, subjectId: engSubj.id, teacherId: createdTeachers[1].id }
    });
  }
  if (class10 && mathSubj && createdTeachers[0]) {
    await ClassSubject.findOrCreate({
      where: { classId: class10.id, subjectId: mathSubj.id },
      defaults: { classId: class10.id, subjectId: mathSubj.id, teacherId: createdTeachers[0].id }
    });
  }
  if (class10 && phySubj && createdTeachers[3]) {
    await ClassSubject.findOrCreate({
      where: { classId: class10.id, subjectId: phySubj.id },
      defaults: { classId: class10.id, subjectId: phySubj.id, teacherId: createdTeachers[3].id }
    });
  }

  // 10. Fee Categories & Fee Structures
  const feeCategoriesData = [
    { name: 'Monthly Tuition Fee', frequency: 'monthly', description: 'Regular monthly school tuition' },
    { name: 'Admission Fee', frequency: 'one_time', description: 'One-time admission registration fee' },
    { name: 'Annual Examination Fee', frequency: 'annual', description: 'Board/Annual examination charges' },
    { name: 'Computer & Science Lab Charges', frequency: 'monthly', description: 'Laboratory utility fee' },
    { name: 'Transport Bus Fare', frequency: 'monthly', description: 'School bus pickup & drop fare' }
  ];

  const createdFeeCategories = [];
  for (const fc of feeCategoriesData) {
    const [cat] = await FeeCategory.findOrCreate({
      where: { name: fc.name },
      defaults: fc
    });
    createdFeeCategories.push(cat);
  }

  // Create standard fee structures for classes
  const tuitionCat = createdFeeCategories.find((c) => c.name === 'Monthly Tuition Fee');
  for (const cls of createdClasses) {
    const tuitionAmount = 4000 + (cls.numericValue * 500); // 4500 to 9000 PKR
    if (tuitionCat) {
      await FeeStructure.findOrCreate({
        where: { academicSessionId: session2526.id, classId: cls.id, feeCategoryId: tuitionCat.id },
        defaults: {
          academicSessionId: session2526.id,
          classId: cls.id,
          feeCategoryId: tuitionCat.id,
          amount: tuitionAmount,
          dueDateDay: 10
        }
      });
    }
  }
  console.log('✅ Fee Categories and Structures seeded.');

  // 11. Grading Scale
  const gradesData = [
    { name: 'A+', minPercentage: 90.00, maxPercentage: 100.00, gradePoint: 4.00, remarks: 'Outstanding / First Position Potential' },
    { name: 'A', minPercentage: 80.00, maxPercentage: 89.99, gradePoint: 3.70, remarks: 'Excellent' },
    { name: 'B', minPercentage: 70.00, maxPercentage: 79.99, gradePoint: 3.00, remarks: 'Very Good' },
    { name: 'C', minPercentage: 60.00, maxPercentage: 69.99, gradePoint: 2.50, remarks: 'Good' },
    { name: 'D', minPercentage: 50.00, maxPercentage: 59.99, gradePoint: 2.00, remarks: 'Satisfactory / Pass' },
    { name: 'E', minPercentage: 33.00, maxPercentage: 49.99, gradePoint: 1.00, remarks: 'Conditional Pass' },
    { name: 'F', minPercentage: 0.00, maxPercentage: 32.99, gradePoint: 0.00, remarks: 'Fail' }
  ];

  for (const g of gradesData) {
    await Grade.findOrCreate({ where: { name: g.name }, defaults: g });
  }
  console.log('✅ Grading scale seeded.');

  // 12. Students, Parents & Enrollments
  const section9A = await Section.findOne({ where: { classId: class9.id, name: 'A' } });
  const section10A = await Section.findOne({ where: { classId: class10.id, name: 'A' } });

  const sampleStudents = [
    {
      admissionNo: 'IMPS-2025-0101',
      rollNo: '9A-01',
      firstName: 'Hamza',
      lastName: 'Bilal',
      gender: 'male',
      dob: '2010-05-14',
      bFormNo: '35201-8899001-1',
      bloodGroup: 'B+',
      admissionDate: '2025-04-05',
      classId: class9.id,
      sectionId: section9A ? section9A.id : 1,
      fatherName: 'Bilal Farooq',
      fatherCnic: '35201-1122334-1',
      fatherOccupation: 'Civil Engineer',
      fatherPhone: '+92 300 7766554',
      fatherEmail: 'bilal.farooq@gmail.com',
      address: 'House 45, Street 8, Johar Town, Lahore',
      userEmail: 'student.hamza@school.edu.pk',
      parentEmail: 'parent.hamza@school.edu.pk'
    },
    {
      admissionNo: 'IMPS-2025-0102',
      rollNo: '9A-02',
      firstName: 'Fatima',
      lastName: 'Zahra',
      gender: 'female',
      dob: '2010-08-22',
      bFormNo: '35201-7788992-2',
      bloodGroup: 'O+',
      admissionDate: '2025-04-06',
      classId: class9.id,
      sectionId: section9A ? section9A.id : 1,
      fatherName: 'Dr. Tariq Mahmood',
      fatherCnic: '35201-2233445-1',
      fatherOccupation: 'Medical Specialist',
      fatherPhone: '+92 321 8899001',
      fatherEmail: 'dr.tariq@gmail.com',
      address: 'House 12-B, Judicial Colony, Lahore',
      userEmail: 'student.fatima@school.edu.pk',
      parentEmail: 'parent.fatima@school.edu.pk'
    },
    {
      admissionNo: 'IMPS-2025-0103',
      rollNo: '9A-03',
      firstName: 'Usman',
      lastName: 'Ali',
      gender: 'male',
      dob: '2010-02-10',
      bFormNo: '35201-6677883-3',
      bloodGroup: 'A+',
      admissionDate: '2025-04-08',
      classId: class9.id,
      sectionId: section9A ? section9A.id : 1,
      fatherName: 'Muhammad Ali Khan',
      fatherCnic: '35201-3344556-3',
      fatherOccupation: 'Bank Manager',
      fatherPhone: '+92 333 9988776',
      fatherEmail: 'ali.khan@gmail.com',
      address: 'Plaza 4, Main Boulevard, Faisal Town, Lahore',
      userEmail: 'student.usman@school.edu.pk',
      parentEmail: 'parent.usman@school.edu.pk'
    },
    {
      admissionNo: 'IMPS-2025-0201',
      rollNo: '10A-01',
      firstName: 'Zainab',
      lastName: 'Malik',
      gender: 'female',
      dob: '2009-11-19',
      bFormNo: '35201-5566774-4',
      bloodGroup: 'AB+',
      admissionDate: '2024-04-10',
      classId: class10.id,
      sectionId: section10A ? section10A.id : 2,
      fatherName: 'Malik Asghar',
      fatherCnic: '35201-4455667-5',
      fatherOccupation: 'Businessman',
      fatherPhone: '+92 300 4455667',
      fatherEmail: 'malik.asghar@gmail.com',
      address: 'Bungalow 78, Phase 5 DHA, Lahore',
      userEmail: 'student.zainab@school.edu.pk',
      parentEmail: 'parent.zainab@school.edu.pk'
    },
    {
      admissionNo: 'IMPS-2025-0202',
      rollNo: '10A-02',
      firstName: 'Abdullah',
      lastName: 'Rehman',
      gender: 'male',
      dob: '2009-04-03',
      bFormNo: '35201-4433221-5',
      bloodGroup: 'O-',
      admissionDate: '2024-04-12',
      classId: class10.id,
      sectionId: section10A ? section10A.id : 2,
      fatherName: 'Abdul Rehman',
      fatherCnic: '35201-5566778-9',
      fatherOccupation: 'Chartered Accountant',
      fatherPhone: '+92 345 6677889',
      fatherEmail: 'rehman.ca@gmail.com',
      address: 'House 90, Gulberg III, Lahore',
      userEmail: 'student.abdullah@school.edu.pk',
      parentEmail: 'parent.abdullah@school.edu.pk'
    }
  ];

  const createdStudents = [];
  for (const s of sampleStudents) {
    // Student User Login
    const [stuUser] = await User.findOrCreate({
      where: { email: s.userEmail },
      defaults: {
        email: s.userEmail,
        password: studentPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.fatherPhone,
        roleId: rolesMap[ROLES.STUDENT].id,
        status: 'active'
      }
    });

    // Parent User Login
    const [prntUser] = await User.findOrCreate({
      where: { email: s.parentEmail },
      defaults: {
        email: s.parentEmail,
        password: parentPasswordHash,
        firstName: s.fatherName.split(' ')[0],
        lastName: s.fatherName.split(' ').slice(1).join(' ') || 'Parent',
        phone: s.fatherPhone,
        roleId: rolesMap[ROLES.PARENT].id,
        status: 'active'
      }
    });

    // Parent Profile
    const [parentRecord] = await Parent.findOrCreate({
      where: { fatherCnic: s.fatherCnic },
      defaults: {
        userId: prntUser.id,
        fatherName: s.fatherName,
        fatherCnic: s.fatherCnic,
        fatherOccupation: s.fatherOccupation,
        fatherPhone: s.fatherPhone,
        fatherEmail: s.fatherEmail,
        address: s.address
      }
    });

    // Student Profile
    const [student] = await Student.findOrCreate({
      where: { admissionNo: s.admissionNo },
      defaults: {
        userId: stuUser.id,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dob: s.dob,
        bloodGroup: s.bloodGroup,
        bFormNo: s.bFormNo,
        religion: 'Islam',
        nationality: 'Pakistani',
        admissionDate: s.admissionDate,
        currentClassId: s.classId,
        currentSectionId: s.sectionId,
        currentSessionId: session2526.id,
        status: 'active',
        emergencyContactName: s.fatherName,
        emergencyContactPhone: s.fatherPhone,
        address: s.address,
        city: 'Lahore',
        state: 'Punjab'
      }
    });
    createdStudents.push(student);

    // Link Student and Parent
    await StudentParent.findOrCreate({
      where: { studentId: student.id, parentId: parentRecord.id },
      defaults: { studentId: student.id, parentId: parentRecord.id, relationship: 'father' }
    });

    // Enrollment
    await Enrollment.findOrCreate({
      where: { studentId: student.id, academicSessionId: session2526.id },
      defaults: {
        studentId: student.id,
        academicSessionId: session2526.id,
        classId: s.classId,
        sectionId: s.sectionId,
        rollNo: s.rollNo,
        enrollmentDate: s.admissionDate,
        status: 'enrolled'
      }
    });
  }
  console.log(`✅ ${createdStudents.length} Students, Parents and Enrollments seeded.`);

  // 13. Attendance (Today & Recent Days)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let idx = 0; idx < createdStudents.length; idx++) {
    const student = createdStudents[idx];
    const status = idx === 2 ? 'absent' : (idx === 4 ? 'late' : 'present');
    await StudentAttendance.findOrCreate({
      where: { studentId: student.id, date: today },
      defaults: {
        studentId: student.id,
        classId: student.currentClassId,
        sectionId: student.currentSectionId,
        date: today,
        status: status,
        remarks: status === 'absent' ? 'Sick leave requested' : (status === 'late' ? 'Traffic delay' : 'On time'),
        markedById: adminUser.id
      }
    });

    await StudentAttendance.findOrCreate({
      where: { studentId: student.id, date: yesterday },
      defaults: {
        studentId: student.id,
        classId: student.currentClassId,
        sectionId: student.currentSectionId,
        date: yesterday,
        status: 'present',
        remarks: 'Present',
        markedById: adminUser.id
      }
    });
  }

  // Teacher Attendance
  for (const teacher of createdTeachers) {
    await TeacherAttendance.findOrCreate({
      where: { teacherId: teacher.id, date: today },
      defaults: {
        teacherId: teacher.id,
        date: today,
        status: 'present',
        checkIn: '07:45:00',
        checkOut: '14:30:00',
        remarks: 'Present on duty'
      }
    });
  }
  console.log('✅ Student and Teacher Attendance seeded.');

  // 14. Fee Vouchers & Payments
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  for (let idx = 0; idx < createdStudents.length; idx++) {
    const student = createdStudents[idx];
    const voucherNo = `VCH-${currentYear}${String(currentMonth).padStart(2, '0')}-${String(idx + 1).padStart(4, '0')}`;
    const tuitionAmount = student.currentClassId === class9.id ? 8500.00 : 9000.00;
    const discount = idx === 1 ? 1500.00 : 0.00; // Merit scholarship discount for Fatima
    const payable = tuitionAmount - discount;
    const isPaid = idx % 2 === 0;
    const paidAmount = isPaid ? payable : 0.00;
    const remaining = payable - paidAmount;

    const [voucher] = await FeeVoucher.findOrCreate({
      where: { voucherNo },
      defaults: {
        voucherNo,
        studentId: student.id,
        academicSessionId: session2526.id,
        classId: student.currentClassId,
        month: currentMonth,
        year: currentYear,
        issueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`,
        tuitionFee: tuitionAmount,
        otherFees: 500.00,
        discountAmount: discount,
        fineAmount: 0.00,
        totalPayable: payable + 500.00,
        paidAmount: isPaid ? payable + 500.00 : 0.00,
        remainingAmount: isPaid ? 0.00 : payable + 500.00,
        status: isPaid ? 'paid' : 'unpaid',
        remarks: discount > 0 ? 'Merit Scholarship Applied' : 'Standard monthly voucher'
      }
    });

    if (isPaid) {
      await FeePayment.findOrCreate({
        where: { receiptNo: `REC-${voucherNo}` },
        defaults: {
          receiptNo: `REC-${voucherNo}`,
          feeVoucherId: voucher.id,
          studentId: student.id,
          amount: payable + 500.00,
          paymentDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
          paymentMethod: idx === 0 ? 'cash' : 'bank_transfer',
          transactionReference: idx === 0 ? 'Cash at counter' : 'HBL-FT-998822',
          collectedById: accountantUser.id,
          remarks: 'Full fee cleared'
        }
      });
    }
  }
  console.log('✅ Fee Vouchers and Payments seeded.');

  // 15. Examinations, Exam Subjects & Marks
  const [midTermExam] = await Examination.findOrCreate({
    where: { name: 'Mid Term Examination 2025-26' },
    defaults: {
      academicSessionId: session2526.id,
      name: 'Mid Term Examination 2025-26',
      examType: 'mid_term',
      startDate: '2025-10-15',
      endDate: '2025-10-30',
      isPublished: true,
      description: 'Comprehensive Mid-Term evaluation covering Term 1 syllabus'
    }
  });

  if (midTermExam && mathSubj) {
    const [examMath9] = await ExamSubject.findOrCreate({
      where: { examinationId: midTermExam.id, classId: class9.id, subjectId: mathSubj.id },
      defaults: {
        examinationId: midTermExam.id,
        classId: class9.id,
        subjectId: mathSubj.id,
        examDate: '2025-10-16',
        totalMarks: 100.00,
        passingMarks: 33.00
      }
    });

    // Enter marks for students of class 9
    const class9Students = createdStudents.filter((s) => s.currentClassId === class9.id);
    const marksData = [94.00, 98.50, 72.00];
    for (let i = 0; i < class9Students.length; i++) {
      await StudentMark.findOrCreate({
        where: { examSubjectId: examMath9.id, studentId: class9Students[i].id },
        defaults: {
          examSubjectId: examMath9.id,
          studentId: class9Students[i].id,
          marksObtained: marksData[i] || 80.00,
          isAbsent: false,
          remarks: marksData[i] >= 90 ? 'Outstanding performance' : 'Good effort'
        }
      });
    }
  }
  console.log('✅ Examinations and Marks seeded.');

  // 16. Timetable
  const periods = [
    { periodNo: 1, startTime: '08:00:00', endTime: '08:45:00', subject: mathSubj, teacher: createdTeachers[0] },
    { periodNo: 2, startTime: '08:45:00', endTime: '09:30:00', subject: engSubj, teacher: createdTeachers[1] },
    { periodNo: 3, startTime: '09:30:00', endTime: '10:15:00', subject: urduSubj, teacher: createdTeachers[2] },
    { periodNo: 4, startTime: '10:45:00', endTime: '11:30:00', subject: phySubj, teacher: createdTeachers[3] }
  ];

  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    for (const p of periods) {
      if (p.subject && p.teacher) {
        await Timetable.findOrCreate({
          where: {
            classId: class9.id,
            sectionId: section9A.id,
            dayOfWeek: day,
            periodNo: p.periodNo
          },
          defaults: {
            academicSessionId: session2526.id,
            classId: class9.id,
            sectionId: section9A.id,
            subjectId: p.subject.id,
            teacherId: p.teacher.id,
            dayOfWeek: day,
            periodNo: p.periodNo,
            startTime: p.startTime,
            endTime: p.endTime,
            roomNo: 'Room 901'
          }
        });
      }
    }
  }
  console.log('✅ Class Timetable seeded.');

  // 17. Homework
  if (mathSubj && createdTeachers[0]) {
    await Homework.findOrCreate({
      where: { title: 'Exercise 3.2 Quadratic Equations' },
      defaults: {
        classId: class9.id,
        sectionId: section9A.id,
        subjectId: mathSubj.id,
        teacherId: createdTeachers[0].id,
        title: 'Exercise 3.2 Quadratic Equations',
        description: 'Complete questions 1 through 10 from Textbook Chapter 3 on your neat registers.',
        assignedDate: today,
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
      }
    });
  }
  console.log('✅ Homework seeded.');

  // 18. Financial Accounts (Income & Expenses)
  const expensesList = [
    { category: 'Utility Bills', title: 'LESCO Electricity Bill - Main Campus', amount: 84500.00, expenseDate: '2026-02-10', paymentMethod: 'bank_transfer', referenceNo: 'LESCO-FEB-2026' },
    { category: 'Utility Bills', title: 'SNGPL Gas Bill - Laboratory & Heating', amount: 16200.00, expenseDate: '2026-02-12', paymentMethod: 'bank_transfer', referenceNo: 'SNGPL-FEB-2026' },
    { category: 'Maintenance', title: 'Generator Diesel & Routine Service', amount: 35000.00, expenseDate: '2026-02-15', paymentMethod: 'cash', referenceNo: 'GEN-SRV-04' },
    { category: 'Stationery', title: 'Answer Sheets & Examination Papers Printing', amount: 48000.00, expenseDate: '2026-02-18', paymentMethod: 'cheque', referenceNo: 'CHQ-889922' }
  ];

  for (const exp of expensesList) {
    await Expense.findOrCreate({
      where: { referenceNo: exp.referenceNo },
      defaults: { ...exp, approvedById: adminUser.id }
    });
  }

  const incomesList = [
    { category: 'Canteen Rent', title: 'Monthly Canteen Lease Contract Payment', amount: 30000.00, incomeDate: '2026-02-01', paymentMethod: 'cash', description: 'Rent for Feb 2026' },
    { category: 'Uniform/Books', title: 'School Badges & Ties Counter Sale', amount: 18500.00, incomeDate: '2026-02-05', paymentMethod: 'cash', description: 'Student shop items' }
  ];

  for (const inc of incomesList) {
    await Income.findOrCreate({
      where: { title: inc.title },
      defaults: { ...inc, receivedById: accountantUser.id }
    });
  }
  console.log('✅ Financial Income & Expenses seeded.');

  // 19. Library Books & Categories
  const [sciCategory] = await BookCategory.findOrCreate({
    where: { name: 'Science & Technology' },
    defaults: { name: 'Science & Technology', description: 'Physics, Chemistry, Biology and Computing books' }
  });
  const [litCategory] = await BookCategory.findOrCreate({
    where: { name: 'Literature & Languages' },
    defaults: { name: 'Literature & Languages', description: 'English and Urdu classic literature and anthologies' }
  });

  const booksSeed = [
    { title: 'Fundamentals of Physics (Extended)', isbn: '978-0470469088', author: 'Halliday, Resnick & Walker', publisher: 'Wiley', categoryId: sciCategory.id, rackNo: 'PHY-04', totalCopies: 10, availableCopies: 9, price: 2500.00 },
    { title: 'Oxford Progressive English Book 9', isbn: '978-0199060012', author: 'Rachel Redford', publisher: 'Oxford University Press', categoryId: litCategory.id, rackNo: 'ENG-02', totalCopies: 15, availableCopies: 14, price: 1200.00 },
    { title: 'Kulliyat-e-Iqbal (Urdu)', isbn: '978-9694160014', author: 'Allama Muhammad Iqbal', publisher: 'Iqbal Academy Pakistan', categoryId: litCategory.id, rackNo: 'URD-01', totalCopies: 8, availableCopies: 7, price: 1500.00 }
  ];

  for (const b of booksSeed) {
    await Book.findOrCreate({ where: { isbn: b.isbn }, defaults: b });
  }
  console.log('✅ Library Books seeded.');

  // 20. Transport (Vehicles & Routes)
  const [bus1] = await Vehicle.findOrCreate({
    where: { vehicleNo: 'LEA-2024-889' },
    defaults: {
      vehicleNo: 'LEA-2024-889',
      model: 'Toyota Coaster 2022',
      capacity: 32,
      driverName: 'Muhammad Ramzan',
      driverPhone: '+92 301 7766112',
      driverLicense: 'LTV-LHR-88771',
      status: 'active'
    }
  });

  const [route1] = await TransportRoute.findOrCreate({
    where: { title: 'Route 1: DHA Phase 5 to School' },
    defaults: {
      title: 'Route 1: DHA Phase 5 to School',
      vehicleId: bus1.id,
      startPoint: 'DHA Phase 5 Commercial',
      endPoint: 'Johar Town Campus',
      fareAmount: 4500.00
    }
  });

  await RouteStop.findOrCreate({
    where: { routeId: route1.id, stopName: 'Lalik Jan Chowk' },
    defaults: { routeId: route1.id, stopName: 'Lalik Jan Chowk', pickupTime: '07:05:00', dropTime: '14:30:00', fare: 4500.00 }
  });
  await RouteStop.findOrCreate({
    where: { routeId: route1.id, stopName: 'Shaukat Khanum Chowk' },
    defaults: { routeId: route1.id, stopName: 'Shaukat Khanum Chowk', pickupTime: '07:35:00', dropTime: '14:00:00', fare: 3500.00 }
  });
  console.log('✅ Transport Vehicles and Routes seeded.');

  // 21. Notifications & Announcements
  const notificationsSeed = [
    {
      title: 'Annual Sports Gala 2026',
      message: 'The Annual Sports Gala will be held on March 5-7, 2026. Students interested in cricket, football, and athletics must register with the sports department.',
      type: 'announcement',
      targetRole: 'all',
      createdById: adminUser.id
    },
    {
      title: 'Monthly Fee Due Reminder',
      message: 'Parents are requested to submit current month school fees by the 10th of the month to avoid late fee surcharge.',
      type: 'fee_reminder',
      targetRole: 'parent',
      createdById: accountantUser.id
    },
    {
      title: 'Mid Term Result Cards Distribution',
      message: 'Parent Teacher Meeting for Mid-Term Exam results distribution is scheduled for this coming Saturday at 9:00 AM.',
      type: 'exam_result',
      targetRole: 'parent',
      createdById: principalUser.id
    }
  ];

  for (const n of notificationsSeed) {
    await Notification.findOrCreate({
      where: { title: n.title },
      defaults: n
    });
  }
  console.log('✅ Announcements and Notifications seeded.');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Default Accounts Created:');
  console.log('1. Super Admin: admin@school.edu.pk / Admin@12345');
  console.log('2. Principal: principal@school.edu.pk / Admin@12345');
  console.log('3. Accountant: accountant@school.edu.pk / Staff@123');
  console.log('4. Receptionist: receptionist@school.edu.pk / Staff@123');
  console.log('5. Librarian: librarian@school.edu.pk / Staff@123');
  console.log('6. Teacher (Math): asif.math@school.edu.pk / Teacher@123');
  console.log('7. Student: student.hamza@school.edu.pk / Student@123');
  console.log('8. Parent: parent.hamza@school.edu.pk / Parent@123');
  console.log('======================================================\n');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;


const request = require('supertest');
const app = require('../src/app');

describe('School Management ERP API Test Suite', () => {
  let adminToken = '';
  let teacherToken = '';

  // 1. Health Check
  test('GET /api/health should return status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  // 2. Auth - Validation error on missing fields
  test('POST /api/v1/auth/login with missing email should return 422 validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'Admin@12345' });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  // 3. Auth - Invalid password
  test('POST /api/v1/auth/login with wrong password should return 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@school.edu.pk', password: 'WrongPassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 4. Auth - Successful Admin Login
  test('POST /api/v1/auth/login with valid admin credentials should return 200 and JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@school.edu.pk', password: 'Admin@12345' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('super_admin');
    adminToken = res.body.accessToken;
  });

  // 5. Auth - Successful Teacher Login
  test('POST /api/v1/auth/login with teacher credentials should return teacher profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asif.math@school.edu.pk', password: 'Teacher@123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('teacher');
    teacherToken = res.body.accessToken;
  });

  // 6. Auth - Current user profile
  test('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('admin@school.edu.pk');
  });

  // 7. Security - Unauthorized Access
  test('GET /api/v1/dashboard/admin without token should be blocked with 401', async () => {
    const res = await request(app).get('/api/v1/dashboard/admin');
    expect(res.statusCode).toBe(401);
  });

  // 8. Security - Role-Based Access Control (Teacher blocked from User Management)
  test('GET /api/v1/users with teacher token should return 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 9. Admin Dashboard Metrics
  test('GET /api/v1/dashboard/admin with admin token should return stats and charts', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalStudents).toBeGreaterThan(0);
    expect(res.body.stats.finances.currency).toBe('PKR');
    expect(res.body.stats.charts).toBeDefined();
  });

  // 10. Teacher Dashboard
  test('GET /api/v1/dashboard/teacher with teacher token should return teacher portal data', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/teacher')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.teacher).toBeDefined();
  });

  // 11. Students Management - List
  test('GET /api/v1/students should list registered students', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.students)).toBe(true);
    expect(res.body.students.length).toBeGreaterThan(0);
  });

  // 12. Students Management - Single Student Profile
  test('GET /api/v1/students/1 should return full 7-tab student record', async () => {
    const res = await request(app)
      .get('/api/v1/students/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.student).toBeDefined();
    expect(res.body.student.admissionNo).toBeDefined();
  });

  // 13. Academics - Classes & Sections
  test('GET /api/v1/academics/classes should return academic classes with sections', async () => {
    const res = await request(app)
      .get('/api/v1/academics/classes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.classes)).toBe(true);
  });

  // 14. Fee Management - Defaulters
  test('GET /api/v1/fees/defaulters should return defaulters list and outstanding total', async () => {
    const res = await request(app)
      .get('/api/v1/fees/defaulters')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.totalOutstanding).toBeDefined();
  });

  // 15. Fee Management - Structures
  test('GET /api/v1/fees/structures should return class fee structures', async () => {
    const res = await request(app)
      .get('/api/v1/fees/structures')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.structures)).toBe(true);
  });

  // 16. Examinations - Exam Terms
  test('GET /api/v1/exams should return scheduled examinations', async () => {
    const res = await request(app)
      .get('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.exams)).toBe(true);
  });

  // 17. Library - Catalog
  test('GET /api/v1/library/books should return library book catalog', async () => {
    const res = await request(app)
      .get('/api/v1/library/books')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  // 18. Transport - Fleet & Routes
  test('GET /api/v1/transport should return school transport fleet & routes', async () => {
    const res = await request(app)
      .get('/api/v1/transport')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  // 19. School Settings
  test('GET /api/v1/settings should return institution profile & configurations', async () => {
    const res = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings).toBeDefined();
  });

  // 20. User Management (Admin only)
  test('GET /api/v1/users with admin token should return user accounts', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

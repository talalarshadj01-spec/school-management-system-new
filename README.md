# Iqbal Memorial Public School & College - School Management ERP System

A production-ready, full-stack School Management System (ERP) built specifically for schools in Pakistan. Built strictly with JavaScript (React.js, Node.js, Express, PostgreSQL, Sequelize, Tailwind CSS).

---

## 🌟 Key Features

- **9 Operational Roles with Dedicated Dashboards**:
  1. **Super Admin**: Complete institution control, user management, policy settings.
  2. **Admin**: Daily operations, student directory, class structures.
  3. **Principal**: Academic KPIs, attendance ratios, faculty supervision.
  4. **Teacher**: Assigned class timetable, daily attendance, homework, marks entry.
  5. **Accountant**: Fee collection, monthly voucher generation, fee defaulters, expenses, salaries.
  6. **Receptionist**: Student registrations, visitor logs, notices.
  7. **Librarian**: Book catalog, lending/return tracking, overdue fines.
  8. **Student**: Personal attendance percentage, timetable, homework, fee status, report cards.
  9. **Parent**: Linked children cards, fee vouchers, academic performance.

- **Pakistani Institutional Standards**:
  - Currency: **Pakistani Rupee (PKR - ₨)** across all vouchers, ledgers, and charts.
  - National Identity: NADRA **B-Form** (students) and **CNIC** (parents & teachers) tracking.
  - Grade 1 through Class 10 (Matriculation) with Section A (Quaid Wing) & Section B (Iqbal Wing).
  - Configurable interface language (English & Urdu).

- **Financial Integrity**:
  - Database transactions on all payment operations.
  - Automatic balance calculations; strict prevention of overpayment.
  - Complete fee voucher generation (`VCH-YYYYMM-XXXX`) and receipts (`REC-XXXX`).
  - Fee Defaulters Tracker with total outstanding calculations.

- **Academic & Examination Engine**:
  - Pakistani Grading Scale (A+, A, B, C, D, E, F).
  - Draft vs. Published results workflow.
  - Printable **A4 Report Cards** with school branding and signature blocks.
  - Student promotion between academic sessions without losing historical records.

- **Security & Reliability**:
  - JWT Access Token (30m) & Refresh Token (7d).
  - Bcrypt password hashing.
  - Rate limiting & 15-minute lockout after 5 failed login attempts.
  - Append-only audit logging for critical administrative and financial actions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally or on server

### 1. Database Configuration
Ensure PostgreSQL is running, then verify credentials in `server/.env` (or copy from `.env.example`):
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=school_management_db
DB_USER=postgres
DB_PASSWORD=newdbs
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 3. Initialize Database & Seed Authentic Records
```bash
# Synchronize 44 database tables and populate sample school data
cd server
node src/database/sync.js
node src/database/seed.js
```

### 4. Run Development Servers
Open two terminal windows:

**Backend API (Port 5000):**
```bash
npm run server
```

**Frontend React Portal (Port 5173):**
```bash
npm run client
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔑 Default Test Accounts (Pre-configured in Seeder)

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@school.edu.pk` | `Admin@12345` |
| **Principal** | `principal@school.edu.pk` | `Admin@12345` |
| **Teacher (Math)**| `asif.math@school.edu.pk`| `Teacher@123` |
| **Accountant** | `accountant@school.edu.pk`| `Staff@123` |
| **Receptionist** | `receptionist@school.edu.pk`| `Staff@123` |
| **Librarian** | `librarian@school.edu.pk` | `Staff@123` |
| **Student** | `student.hamza@school.edu.pk`| `Student@123` |
| **Parent** | `parent.hamza@school.edu.pk` | `Parent@123` |

*(Quick-fill buttons for these accounts are also provided directly on the Login page).*

---

## 🧪 Running Automated Tests

Run backend integration and security test suite:
```bash
cd server
npm test
```
All 9 test suites verify health checks, JWT authentication, failed login rejection, protected route enforcement, database queries, and fee calculations.

---

## 📁 Detailed Documentation
- [System Architecture](file:///d:/working%20videos/Node%20Curse/school-management-system/docs/ARCHITECTURE.md)
- [REST API Reference](file:///d:/working%20videos/Node%20Curse/school-management-system/docs/API_DOCUMENTATION.md)
- [Database Schema & Dictionary](file:///d:/working%20videos/Node%20Curse/school-management-system/docs/DATABASE_SCHEMA.md)
- [Production Deployment Guide](file:///d:/working%20videos/Node%20Curse/school-management-system/docs/DEPLOYMENT_GUIDE.md)


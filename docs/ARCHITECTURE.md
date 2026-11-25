# School Management System (ERP) - Architecture Documentation

## 1. System Overview
The **School Management System** is a full-featured, production-ready ERP designed for educational institutions in Pakistan. It is architected as a clean JavaScript monorepo supporting 9 distinct operational roles:
1. **Super Admin** (Full system control)
2. **Admin** (Operational school management)
3. **Principal** (Academic supervision & institution metrics)
4. **Teacher** (Assigned classes, timetable, attendance, marks, homework)
5. **Accountant** (Fee collection, vouchers, defaulters, expenses, salaries)
6. **Receptionist** (Student admissions, visitor records, notices)
7. **Librarian** (Book inventory, issue and return logs)
8. **Student** (Personal portal: timetable, homework, attendance, results)
9. **Parent** (Linked children overview, fee vouchers, report cards)

---

## 2. Technology Stack & Architectural Principles
- **Language**: JavaScript (ES6+ / Node.js 24)
- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router 7, Axios, Lucide React, Recharts.
- **Backend**: Express.js 4, PostgreSQL 18, Sequelize ORM 6.
- **Security & Authorization**:
  - JWT strategy (30-minute Access Token + 7-day HTTP-only Refresh Token).
  - Bcrypt password hashing (10 salt rounds).
  - Rate limiting (Express Rate Limit) preventing brute-force login attempts (account locks for 15 minutes after 5 consecutive failures).
  - Helmet for secure HTTP headers.
  - CORS with whitelist validation.
  - Append-only Audit Logging (`audit_logs` table) recording every critical financial and administrative action.
- **Financial Integrity**:
  - Currency: Pakistani Rupee (**PKR / ₨**).
  - Database transactions (`sequelize.transaction()`) for all payment recordings, student admissions, and promotions.
  - Strict validation preventing overpayment on fee vouchers.
  - Vouchers maintain non-destructive financial adjustment logs (`fee_adjustments`).

---

## 3. Monorepo Structure

```
school-management-system/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, Navbar, StatCard, Badge, Modal, Loader)
│   │   ├── context/            # AuthContext (JWT session, roles, permissions)
│   │   ├── pages/              # Role-specific dashboards & module views
│   │   │   ├── auth/           # Login screen with quick demo accounts
│   │   │   ├── admin/          # Admin Dashboard & User Management
│   │   │   ├── teachers/       # Teacher directory & Teacher portal
│   │   │   ├── students/       # Admissions, Directory, 7-tab Profile, Promotions
│   │   │   ├── attendance/     # Daily sheet & Monthly percentage report
│   │   │   ├── fees/           # Vouchers, Payment counter, Defaulters, Structures
│   │   │   ├── examinations/   # Exams, Marks entry sheet, Printable A4 report cards
│   │   │   ├── academics/      # Sessions, Classes, Sections, Subjects
│   │   │   ├── timetable/      # Weekly period schedule
│   │   │   ├── homework/       # Homework assignments & submissions
│   │   │   ├── finance/        # Income & Expense ledger, Salary records
│   │   │   ├── library/        # Books & Issue management
│   │   │   ├── transport/      # Bus fleet & Route stops
│   │   │   ├── reports/        # Excel spreadsheet exports
│   │   │   └── settings/       # School policies & Localization
│   │   ├── services/           # Axios API client with token refresh interceptor
│   │   └── utils/              # Currency (formatPKR) & Date helpers
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # Database connection & Sequelize CLI config
│   │   ├── constants/          # Roles and granular permission definitions
│   │   ├── controllers/        # REST controller handlers
│   │   ├── middleware/         # Auth, Authorization, Rate Limit, Error Handler, Upload
│   │   ├── models/             # 44 Normalized Sequelize models & associations
│   │   ├── routes/             # Versioned Express routes (/api/v1/...)
│   │   ├── services/           # Audit logging & utilities
│   │   ├── database/           # Sync runner & realistic Pakistani school seeder
│   │   ├── app.js              # Express application configuration
│   │   └── server.js           # Server bootstrap & graceful shutdown
│   ├── tests/                  # Automated Jest & Supertest API tests
│   └── package.json
├── docs/                       # Technical & Architectural Documentation
├── .env.example                # Environment variable blueprint
└── README.md                   # Quickstart and operations manual
```


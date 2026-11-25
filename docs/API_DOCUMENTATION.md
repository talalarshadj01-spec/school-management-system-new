# School Management System (ERP) - API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require an `Authorization: Bearer <token>` header or `accessToken` cookie.

---

## 1. Authentication (`/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/login` | Login with email and password | Public (Rate-limited) |
| `POST` | `/auth/refresh-token` | Exchange refresh token for new access token | Public |
| `POST` | `/auth/logout` | Revoke session & clear cookie | Authenticated |
| `GET` | `/auth/me` | Fetch active user profile, role & linked entity | Authenticated |
| `POST` | `/auth/change-password` | Update current password | Authenticated |

---

## 2. Dashboard (`/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/dashboard/admin` | Institution KPIs, charts, fee stats | Admin, Principal, Accountant |
| `GET` | `/dashboard/teacher` | Assigned schedule, homework, attendance | Teacher, Admin |
| `GET` | `/dashboard/student` | Personal attendance, vouchers, timetable | Student |
| `GET` | `/dashboard/parent` | Linked children cards, vouchers, results | Parent |

---

## 3. Student Management (`/students`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/students` | List students with search, class filter, pagination | Staff, Teacher, Admin |
| `GET` | `/students/:id` | Full 7-tab student dossier with history | Staff, Teacher, Admin |
| `POST` | `/students` | Register student, parent & enrollment | Admin, Receptionist |
| `PUT` | `/students/:id` | Update student profile information | Admin, Receptionist |
| `DELETE` | `/students/:id` | Soft-archive student record | Admin |
| `POST` | `/students/:id/promote` | Promote student to next class/session | Admin, Principal |

---

## 4. Attendance Management (`/attendance`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/attendance/class` | Daily sheet for class, section, date | Teacher, Admin |
| `POST` | `/attendance/bulk` | Mark bulk attendance with status & remarks | Teacher, Admin |
| `GET` | `/attendance/report` | Monthly attendance report and percentage | Teacher, Admin, Receptionist |

---

## 5. Fees & Tuition (`/fees`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/fees/vouchers` | List vouchers with status & student details | Accountant, Admin |
| `POST` | `/fees/vouchers/generate`| Batch generate monthly vouchers | Accountant, Admin |
| `POST` | `/fees/payments/collect` | Collect payment (strict balance validation) | Accountant, Admin |
| `GET` | `/fees/defaulters` | List overdue fee defaulters with total | Accountant, Principal, Admin |
| `GET` | `/fees/structures` | Class fee amount configurations | Accountant, Admin |

---

## 6. Examinations (`/exams`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/exams` | List exams with subjects & publish status | Staff, Teacher, Admin |
| `POST` | `/exams` | Create new examination term | Admin, Principal |
| `GET` | `/exams/marks-sheet/:id` | Marks entry sheet for exam subject | Teacher, Admin |
| `POST` | `/exams/marks-sheet/:id`| Save student marks & absent flags | Teacher, Admin |
| `PUT` | `/exams/:id/publish` | Toggle publishing results to portals | Admin, Principal |
| `GET` | `/exams/:id/report-card/:stuId` | Generate printable A4 report card data | All authenticated |

---

## 7. Reports & Exports (`/reports`)
| Method | Endpoint | Description | Format |
|---|---|---|---|
| `GET` | `/reports/students/excel` | Full student directory spreadsheet | `.xlsx` |
| `GET` | `/reports/fees/excel` | Fee vouchers and collection ledger | `.xlsx` |


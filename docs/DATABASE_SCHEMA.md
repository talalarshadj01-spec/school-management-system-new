# Database Schema & Data Dictionary

Database: **PostgreSQL** (with Sequelize ORM)

---

## Normalized Entity Models

| Table Name | Entity | Description | Key Fields |
|---|---|---|---|
| `users` | User | System user logins with security attributes | `id (UUID)`, `email`, `password`, `role_id`, `failed_login_attempts`, `lock_until`, `last_login_at` |
| `roles` | Role | 9 Institutional operational roles | `id`, `name`, `display_name`, `is_system` |
| `permissions` | Permission | Fine-grained module permissions | `id`, `name`, `module`, `description` |
| `role_permissions` | RolePermission | Many-to-many junction table | `role_id`, `permission_id` |
| `academic_sessions` | AcademicSession | Academic annual terms (e.g. 2025-2026) | `id`, `name`, `start_date`, `end_date`, `is_current`, `status` |
| `classes` | Class | Academic grades (Class 1 to 10) | `id`, `name`, `numeric_value`, `description` |
| `sections` | Section | Classroom divisions (Sec A, B) | `id`, `name`, `class_id`, `room_no`, `max_capacity` |
| `subjects` | Subject | Curriculum subjects | `id`, `name`, `code`, `type (theory/practical/both)` |
| `class_subjects` | ClassSubject | Class-subject allocations to teachers | `id`, `class_id`, `subject_id`, `teacher_id` |
| `students` | Student | Official student enrollment records | `id`, `admission_no`, `user_id`, `b_form_no`, `first_name`, `last_name`, `dob`, `gender`, `blood_group`, `current_class_id`, `current_section_id`, `current_session_id`, `status` |
| `parents` | Parent | Parents / legal guardians | `id`, `user_id`, `father_name`, `father_cnic`, `father_phone`, `father_occupation`, `address` |
| `student_parents` | StudentParent | Student-parent relations | `student_id`, `parent_id`, `relationship` |
| `teachers` | Teacher | Faculty member profiles | `id`, `user_id`, `employee_id`, `first_name`, `last_name`, `cnic`, `phone`, `email`, `qualification`, `experience_years`, `joining_date`, `department`, `designation`, `basic_salary`, `status` |
| `staff` | Staff | Non-teaching administrative staff | `id`, `user_id`, `employee_id`, `first_name`, `last_name`, `department`, `designation`, `basic_salary`, `status` |
| `enrollments` | Enrollment | Historical academic enrollment ledger | `id`, `student_id`, `academic_session_id`, `class_id`, `section_id`, `roll_no`, `status` |
| `student_attendances`| StudentAttendance| Daily classroom attendance records | `id`, `student_id`, `class_id`, `section_id`, `date`, `status (present/absent/late/leave)`, `remarks`, `marked_by_id` |
| `teacher_attendances`| TeacherAttendance| Faculty daily duty attendance | `id`, `teacher_id`, `date`, `status`, `check_in`, `check_out` |
| `fee_categories` | FeeCategory | Tuition, Exam, Transport fee types | `id`, `name`, `frequency (monthly/one_time/annual)` |
| `fee_structures` | FeeStructure | Class-wise fee schedule | `id`, `academic_session_id`, `class_id`, `fee_category_id`, `amount (PKR)`, `due_date_day` |
| `fee_vouchers` | FeeVoucher | Monthly official fee vouchers | `id`, `voucher_no`, `student_id`, `academic_session_id`, `class_id`, `month`, `year`, `issue_date`, `due_date`, `tuition_fee`, `total_payable`, `paid_amount`, `remaining_amount`, `status` |
| `fee_payments` | FeePayment | Recorded financial transactions | `id`, `receipt_no`, `fee_voucher_id`, `student_id`, `amount`, `payment_date`, `payment_method`, `transaction_reference`, `collected_by_id` |
| `examinations` | Examination | Exam terms (Mid-Term, Final) | `id`, `academic_session_id`, `name`, `exam_type`, `start_date`, `end_date`, `is_published` |
| `exam_subjects` | ExamSubject | Specific exam subject papers | `id`, `examination_id`, `class_id`, `subject_id`, `exam_date`, `total_marks`, `passing_marks` |
| `student_marks` | StudentMark | Student exam marks obtained | `id`, `exam_subject_id`, `student_id`, `marks_obtained`, `is_absent`, `remarks` |
| `grades` | Grade | Official Pakistani grading scale (A+..F)| `id`, `name`, `min_percentage`, `max_percentage`, `grade_point`, `remarks` |
| `timetables` | Timetable | Weekly class period slots | `id`, `academic_session_id`, `class_id`, `section_id`, `subject_id`, `teacher_id`, `day_of_week`, `period_no`, `start_time`, `end_time`, `room_no` |
| `homeworks` | Homework | Assigned homework tasks | `id`, `class_id`, `section_id`, `subject_id`, `teacher_id`, `title`, `description`, `assigned_date`, `due_date` |
| `expenses` | Expense | Campus operational expense ledger | `id`, `category`, `title`, `amount`, `expense_date`, `payment_method`, `reference_no`, `approved_by_id` |
| `incomes` | Income | Auxiliary school revenues | `id`, `category`, `title`, `amount`, `income_date`, `payment_method`, `received_by_id` |
| `salary_records` | SalaryRecord | Monthly salary disbursement logs | `id`, `employee_type`, `teacher_id`, `staff_id`, `month`, `year`, `basic_salary`, `net_salary`, `status`, `payment_date` |
| `books` | Book | Library book catalog | `id`, `title`, `isbn`, `author`, `category_id`, `rack_no`, `total_copies`, `available_copies` |
| `library_issues` | LibraryIssue | Book lending & return logs | `id`, `book_id`, `borrower_type`, `student_id`, `teacher_id`, `issue_date`, `due_date`, `status` |
| `vehicles` | Vehicle | School transport bus fleet | `id`, `vehicle_no`, `model`, `capacity`, `driver_name`, `driver_phone`, `status` |
| `transport_routes` | TransportRoute | Bus routes & fares | `id`, `title`, `vehicle_id`, `start_point`, `end_point`, `fare_amount` |
| `route_stops` | RouteStop | Specific route stops & timings | `id`, `route_id`, `stop_name`, `pickup_time`, `drop_time`, `fare` |
| `notifications` | Notification | School announcements & alerts | `id`, `title`, `message`, `type`, `target_role`, `created_by_id` |
| `audit_logs` | AuditLog | Immutable audit trail | `id`, `user_id`, `action`, `entity`, `entity_id`, `details (JSONB)`, `ip_address`, `user_agent`, `created_at` |
| `school_settings` | SchoolSetting | Institutional preferences & policies| `id`, `key`, `value`, `group`, `description` |


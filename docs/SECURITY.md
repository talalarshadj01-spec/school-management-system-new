# Security Guide
## School Management System — Iqbal Memorial Public School & College

---

## 1. Authentication Security

### JWT Configuration
- **Access Token:** Expires in 15 minutes (short-lived, stored in memory/localStorage)
- **Refresh Token:** Expires in 7 days, stored in httpOnly cookie
- **Algorithm:** HS256 with strong secret (minimum 32 characters)

### Environment Variables Required
```env
JWT_SECRET=<minimum-32-character-random-string>
JWT_REFRESH_SECRET=<different-minimum-32-character-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Policy
- Minimum 8 characters
- Must contain uppercase, lowercase, and digit
- bcrypt with saltRounds=12
- Login attempt protection: rate-limited to 10 requests/15 min per IP

---

## 2. API Security

### Rate Limiting
- General API: 100 requests/15 min per IP
- Auth endpoints (`/login`): 10 requests/15 min per IP

### Input Validation & Sanitization
- `express-validator` applied to auth routes and mutation routes
- Input sanitization prevents XSS via `.escape()` and `.trim()`
- SQL injection prevented by Sequelize ORM parameterized queries
- File type validation for uploads (images: jpeg/png/webp, max 2MB)

### HTTP Security Headers (Helmet.js)
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-XSS-Protection`
- `Strict-Transport-Security` (HSTS) — enable in production
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

---

## 3. CORS Configuration

### Development
Allows: `http://localhost:5173`

### Production
Set `CORS_ORIGIN` environment variable:
```env
CORS_ORIGIN=https://yourschool.edu.pk
```

> [!CAUTION]
> Never use `CORS_ORIGIN=*` in production. This exposes the API to any website.

---

## 4. Database Security

- PostgreSQL with dedicated application user (not postgres superuser)
- Password stored in `.env` file only — never committed to git
- Sequelize parameterized queries prevent SQL injection
- Soft deletes (`paranoid: true`) preserve audit trail
- `AuditLog` model tracks sensitive operations

### Recommended PostgreSQL User Setup
```sql
CREATE USER school_app WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE school_management_db TO school_app;
GRANT USAGE ON SCHEMA public TO school_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO school_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO school_app;
```

---

## 5. File Upload Security

- Files stored in `server/uploads/` (never serve directly in production)
- File type whitelist enforced by Multer (jpeg, png, webp, pdf)
- File size limit: 2MB for images, 10MB for documents
- Filenames sanitized (UUID + extension only)
- In production, serve via nginx with proper permissions or cloud storage (S3/GCS)

---

## 6. Role-Based Access Control

| Role | Level | Key Restrictions |
|------|-------|-----------------|
| Super Admin | 1 | Full access |
| Admin | 2 | Full access except super admin ops |
| Principal | 3 | View all, limited write |
| Teacher | 4 | Own classes, attendance, homework |
| Accountant | 5 | Finance, fees only |
| Receptionist | 6 | Students, admissions only |
| Librarian | 7 | Library only |
| Student | 8 | Own profile, timetable, results |
| Parent | 9 | Own child's data only |

> [!IMPORTANT]
> Authorization is enforced server-side via `authenticate` + `authorize` middleware. Frontend route protection is UI-only and cannot be relied upon for security.

---

## 7. Production Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets (min 32 chars, random)
- [ ] Enable HTTPS with valid SSL certificate (Let's Encrypt)
- [ ] Configure CORS to production domain only
- [ ] Set up PostgreSQL SSL connection (`ssl: { rejectUnauthorized: true }`)
- [ ] Enable fail2ban for SSH brute-force protection
- [ ] Configure nginx rate limiting and request size limits
- [ ] Set up automated backups (see BACKUP_AND_RESTORE.md)
- [ ] Review and rotate JWT secrets quarterly
- [ ] Monitor failed login attempts in `audit_logs` table
- [ ] Keep all npm packages updated (`npm audit`)
- [ ] Remove all `console.log` statements in production
- [ ] Set `secure: true` on all cookies
- [ ] Disable directory listing in nginx

---

## 8. Incident Response

If a security incident is suspected:
1. Immediately revoke all active sessions (invalidate all tokens)
2. Force password reset for affected accounts
3. Review `audit_logs` table for suspicious activity
4. Check server access logs (`/var/log/nginx/access.log`)
5. Notify school administration and relevant authorities

---

*Last Updated: November 2026*


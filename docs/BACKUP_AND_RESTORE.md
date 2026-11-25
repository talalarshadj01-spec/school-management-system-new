# Backup and Restore Guide
## School Management System — Iqbal Memorial Public School & College

---

## 1. Database Backup (PostgreSQL)

### Manual Backup (Compressed Binary Format)
```bash
pg_dump -U postgres -h 127.0.0.1 -d school_management_db -Fc -f backup_$(date +%Y%m%d_%H%M%S).dump
```

### Manual Backup (Human-readable SQL)
```bash
pg_dump -U postgres -h 127.0.0.1 -d school_management_db > backup_$(date +%Y%m%d).sql
```

### Automated Daily Backup (Linux cron)
```bash
# Edit crontab: crontab -e
# Run backup at 2:00 AM every day
0 2 * * * PGPASSWORD=your_pass pg_dump -U postgres -d school_management_db -Fc -f /backups/db_$(date +\%Y\%m\%d).dump 2>> /var/log/school_backup.log
# Keep only last 30 days
0 3 * * * find /backups/ -name "db_*.dump" -mtime +30 -delete
```

### Windows Automated Backup (Task Scheduler)
Create `backup.bat`:
```bat
@echo off
set PGPASSWORD=your_password
set BACKUP_DIR=C:\SchoolBackups
set DATE=%date:~10,4%%date:~4,2%%date:~7,2%
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
pg_dump -U postgres -h 127.0.0.1 -d school_management_db -Fc -f "%BACKUP_DIR%\db_%DATE%.dump"
echo Backup completed at %date% %time% >> "%BACKUP_DIR%\backup.log"
```
Schedule via Task Scheduler to run daily at 2:00 AM.

---

## 2. Database Restore

### From .dump file (compressed binary)
```bash
# WARNING: This destroys existing data
dropdb -U postgres school_management_db
createdb -U postgres school_management_db
pg_restore -U postgres -h 127.0.0.1 -d school_management_db --no-owner backup_file.dump
```

### From .sql file
```bash
psql -U postgres -h 127.0.0.1 -d school_management_db < backup_file.sql
```

### Restore to a Different Database (for testing)
```bash
createdb -U postgres school_restore_test
pg_restore -U postgres -d school_restore_test backup_file.dump
psql -U postgres -d school_restore_test -c "SELECT COUNT(*) FROM students;"
# Verify data is correct, then drop if satisfied
dropdb -U postgres school_restore_test
```

---

## 3. Uploaded Files Backup

```bash
# Backup
tar -czf uploads_$(date +%Y%m%d).tar.gz server/uploads/

# Restore
tar -xzf uploads_YYYYMMDD.tar.gz -C /path/to/server/
```

---

## 4. Full System Backup (Database + Files)

```bash
#!/bin/bash
# full_backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR/$DATE"

# Database
PGPASSWORD=$DB_PASSWORD pg_dump -U postgres -d school_management_db -Fc \
  -f "$BACKUP_DIR/$DATE/database.dump"

# Uploads
tar -czf "$BACKUP_DIR/$DATE/uploads.tar.gz" /path/to/server/uploads/

# .env (sensitive — store securely)
cp /path/to/server/.env "$BACKUP_DIR/$DATE/.env.backup"

echo "Full backup completed: $BACKUP_DIR/$DATE"
```

---

## 5. Backup Verification

Always verify backups monthly:
```bash
createdb -U postgres school_verify_$(date +%Y%m%d)
pg_restore -U postgres -d school_verify_$(date +%Y%m%d) latest_backup.dump

# Check critical tables
psql -U postgres -d school_verify_$(date +%Y%m%d) -c "
SELECT
  (SELECT COUNT(*) FROM students) as students,
  (SELECT COUNT(*) FROM teachers) as teachers,
  (SELECT COUNT(*) FROM fee_payments) as payments;
"

dropdb -U postgres school_verify_$(date +%Y%m%d)
```

---

## 6. Backup Retention Policy

| Location | Frequency | Retention |
|----------|-----------|-----------|
| Local server `/backups/` | Daily | 7 days |
| External HDD | Weekly | 3 months |
| Cloud (Google Drive/OneDrive) | Weekly | 1 year |
| Offsite physical media | Monthly | 3 years |

---

## 7. Recovery Time Objectives (RTO)

| Scenario | Expected Recovery Time |
|----------|----------------------|
| Accidental row deletion | < 30 minutes |
| Table corruption | < 1 hour |
| Full database loss | < 2 hours |
| Server hardware failure | < 4 hours |
| Complete server loss with new hardware | < 8 hours |

---

## 8. Emergency Contact

If you cannot restore the database, contact the system administrator immediately. Do NOT attempt re-seeding the production database with fake data.

---

*Last Updated: November 2026*


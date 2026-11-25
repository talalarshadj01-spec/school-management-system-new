# Deployment Guide
## School Management System — Iqbal Memorial Public School & College

---

## 1. Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| npm | 10.x | Package manager |
| PostgreSQL | 15.x | Database |
| nginx | 1.24+ | Reverse proxy |
| PM2 | Latest | Process manager |
| Ubuntu | 22.04 LTS | Recommended OS |

---

## 2. Environment Setup

### Clone and Install
```bash
git clone https://github.com/yourorg/school-management-system.git
cd school-management-system

# Install server dependencies
cd server && npm install --production

# Install client dependencies and build
cd ../client && npm install && npm run build
```

### Server Environment Variables
Create `server/.env` (never commit this file):
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=school_management_db
DB_USER=school_app
DB_PASSWORD=your_secure_database_password

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_64_char_random_secret_here
JWT_REFRESH_SECRET=your_different_64_char_random_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (your production domain)
CORS_ORIGIN=https://yourschool.edu.pk

# File uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Client Environment Variables
Create `client/.env.production`:
```env
VITE_API_URL=https://yourschool.edu.pk
```

---

## 3. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE school_management_db;
CREATE USER school_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE school_management_db TO school_app;
\q

# Run database sync (first time only)
cd server
NODE_ENV=production node src/database/sync.js

# Seed initial data (first time only)
NODE_ENV=production node src/database/seed.js
```

> [!CAUTION]
> Never run `sync.js --force` on a production database. It will drop all tables and delete all data.

---

## 4. PM2 Process Manager

### Install PM2
```bash
npm install -g pm2
```

### Create PM2 Ecosystem File
Create `ecosystem.config.js` in project root:
```js
module.exports = {
  apps: [{
    name: 'school-erp-api',
    script: './server/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '500M',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

### Start Application
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow the printed command to auto-start on reboot
```

### PM2 Commands
```bash
pm2 status           # Check status
pm2 logs school-erp-api  # View live logs
pm2 restart school-erp-api  # Restart
pm2 reload school-erp-api   # Zero-downtime reload
pm2 stop school-erp-api     # Stop
```

---

## 5. Nginx Configuration

### Install Nginx
```bash
sudo apt update && sudo apt install nginx
```

### Create Site Configuration
```bash
sudo nano /etc/nginx/sites-available/school-erp
```

```nginx
server {
    listen 80;
    server_name yourschool.edu.pk www.yourschool.edu.pk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourschool.edu.pk www.yourschool.edu.pk;

    ssl_certificate /etc/letsencrypt/live/yourschool.edu.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourschool.edu.pk/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

    # Frontend (React build)
    root /var/www/school-erp/client/dist;
    index index.html;

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        client_max_body_size 10M;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/school-erp/server/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # React SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_comp_level 6;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/school-erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourschool.edu.pk -d www.yourschool.edu.pk
# Certbot will auto-renew. Test renewal:
sudo certbot renew --dry-run
```

---

## 7. Deploy Frontend Build

```bash
cd client
npm run build
sudo cp -r dist/* /var/www/school-erp/client/dist/
```

---

## 8. Deployment Checklist

- [ ] `NODE_ENV=production` in server `.env`
- [ ] Strong JWT secrets generated
- [ ] CORS_ORIGIN set to production domain
- [ ] SSL certificate installed and auto-renewing
- [ ] PM2 running and saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Nginx configured and tested (`nginx -t`)
- [ ] Firewall configured (allow 80, 443, 22 only)
- [ ] Database user is NOT postgres superuser
- [ ] `server/uploads/` has correct permissions (`chmod 755`)
- [ ] Automated backups configured (see BACKUP_AND_RESTORE.md)
- [ ] Logs directory created and PM2 logging configured
- [ ] Default seeded passwords changed in production

---

## 9. Update / Redeploy Process

```bash
# Pull latest code
git pull origin main

# Update dependencies
cd server && npm install --production
cd ../client && npm install

# Rebuild frontend
cd client && npm run build
sudo cp -r dist/* /var/www/school-erp/client/dist/

# Restart backend (zero-downtime)
pm2 reload school-erp-api

# Check status
pm2 status
```

---

*Last Updated: November 2026*


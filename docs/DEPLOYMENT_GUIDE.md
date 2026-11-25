# Production Deployment & Installation Guide

This guide describes how to deploy the School Management System on a production Linux/Windows server with PostgreSQL, Node.js, PM2, and Nginx.

---

## 1. Prerequisites
- **Node.js**: v18.x or v20.x or v24.x LTS
- **PostgreSQL**: v14, v15, v16, v17, or v18
- **Process Manager**: PM2 (`npm install -g pm2`)
- **Web Server**: Nginx (reverse proxy with SSL)

---

## 2. Database Setup (PostgreSQL)
1. Log into your PostgreSQL instance:
   ```bash
   sudo -u postgres psql
   ```
2. Create the production database and user:
   ```sql
   CREATE DATABASE school_management_db;
   CREATE USER school_admin WITH ENCRYPTED PASSWORD 'StrongProductionPassword#2026';
   GRANT ALL PRIVILEGES ON DATABASE school_management_db TO school_admin;
   \c school_management_db
   GRANT ALL ON SCHEMA public TO school_admin;
   \q
   ```

---

## 3. Server Configuration & Bootstrap
1. Clone the repository and navigate into the `server` directory:
   ```bash
   cd school-management-system/server
   npm install --production=false
   ```
2. Copy and customize the production environment file:
   ```bash
   cp ../.env.example .env
   ```
   Set strong production values:
   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://school.yourdomain.edu.pk

   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_NAME=school_management_db
   DB_USER=school_admin
   DB_PASSWORD=StrongProductionPassword#2026

   JWT_ACCESS_SECRET=your_random_64_char_access_secret
   JWT_REFRESH_SECRET=your_random_64_char_refresh_secret
   ```
3. Synchronize database tables & seed initial accounts:
   ```bash
   node src/database/sync.js
   node src/database/seed.js
   ```

4. Launch the backend API daemon with PM2:
   ```bash
   pm2 start src/server.js --name "school-erp-backend"
   pm2 save
   pm2 startup
   ```

---

## 4. Frontend Build & Hosting
1. Navigate into the `client` directory:
   ```bash
   cd ../client
   npm install
   ```
2. Create `.env.production`:
   ```env
   VITE_API_URL=https://school.yourdomain.edu.pk/api/v1
   ```
3. Build the production bundle:
   ```bash
   npm run build
   ```
   The compiled assets will be created in `client/dist`.

---

## 5. Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/school_erp`:

```nginx
server {
    listen 80;
    server_name school.yourdomain.edu.pk;

    # Static Frontend
    root /var/www/school-management-system/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Reverse Proxy
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
    }

    # Static Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/school_erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d school.yourdomain.edu.pk
```


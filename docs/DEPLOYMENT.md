# SoftDeals SMS — Production Deployment Guide

This guide details the procedure for deploying SoftDeals School Management System to production environments on Linux / Ubuntu with Docker or systemd, Nginx reverse proxy, and MongoDB.

---

## 1. Production Architecture Overview

```text
               Internet Clients (Parents, Students, Staff)
                                 │
                                 ▼
                     [Cloudflare / DNS / SSL]
                                 │
                                 ▼
                 [Nginx Reverse Proxy & SSL Termination]
                     │                       │
      (Proxy /api & /api-docs)       (Serve Static Bundle)
                     │                       │
                     ▼                       ▼
           [Node.js Express API]    [React Vite Dist Files]
              (PM2 Cluster)
                     │
                     ▼
           [MongoDB Database Cluster (Replica Set)]
```

---

## 2. Server Prerequisites
- Ubuntu 22.04 LTS / 24.04 LTS
- Node.js 20.x or 22.x LTS
- PM2 process manager (`npm install -g pm2`)
- Nginx web server (`sudo apt install nginx`)
- Certbot for Let's Encrypt SSL (`sudo apt install certbot python3-certbot-nginx`)
- MongoDB Enterprise or Community Server 7.0+ (or MongoDB Atlas)

---

## 3. Backend Deployment

### A. Environment Configuration
Create `/var/www/softdeals-sms/backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/softdeals_sms_prod?retryWrites=true&w=majority
JWT_SECRET=use_a_cryptographically_secure_random_string_min_64_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://sms.softdeals.in
RAZORPAY_KEY_ID=rzp_live_your_actual_key
RAZORPAY_KEY_SECRET=rzp_live_secret
```

### B. Build and Start with PM2
```bash
cd /var/www/softdeals-sms/backend
npm install --omit=dev
npm run build

# Start using PM2
pm2 start dist/server.js --name "softdeals-sms-backend" -i max
pm2 save
pm2 startup
```

---

## 4. Frontend Deployment

### A. Production Build
```bash
cd /var/www/softdeals-sms/frontend
npm install
npm run build
```
This produces optimized production assets inside `/var/www/softdeals-sms/frontend/dist`.

---

## 5. Nginx Web Server Configuration

Create `/etc/nginx/sites-available/softdeals.conf`:
```nginx
server {
    listen 80;
    server_name sms.softdeals.in *.sms.softdeals.in;

    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sms.softdeals.in *.sms.softdeals.in;

    ssl_certificate /etc/letsencrypt/live/sms.softdeals.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sms.softdeals.in/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Single Page App
    root /var/www/softdeals-sms/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Swagger Documentation Proxy
    location /api-docs {
        proxy_pass http://127.0.0.1:5000/api-docs;
        proxy_set_header Host $host;
    }
}
```

Enable site and test Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/softdeals.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

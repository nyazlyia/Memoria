# Railway Deployment Guide

## 🚀 Railway Setup untuk Photo Booth Website

Ini adalah panduan lengkap untuk deploy app ke Railway.

### Step 1: Siapkan GitHub Repository

```bash
# Jika belum ada git repo
cd f:\tania\web-tania\memoriaFinal\Memoria
git init
git add .
git commit -m "Initial commit - Photobooth Website"
git branch -M main

# Siapkan remote (ganti USERNAME dengan GitHub username Anda)
git remote add origin https://github.com/USERNAME/web-tania.git
git push -u origin main
```

### Step 2: Signup Railway

1. Buka https://railway.app
2. Click "Login" → "GitHub"
3. Authorize Railway untuk akses GitHub
4. Done!

### Step 3: Deploy Project

1. Buka https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub"
3. Select repository: `web-tania`
4. Railway akan auto-detect sebagai Laravel project
5. Railway akan auto-create:
    - PHP runtime
    - Node.js runtime
    - MySQL database
    - Redis cache

### Step 4: Setup Environment Variables

Di Railway dashboard → Project Settings → Variables, add:

```
APP_KEY=base64:your_existing_key_dari_.env
APP_NAME=PhotoBooth
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.railway.app

# Database (Railway akan auto-generate ini)
DB_CONNECTION=mysql
DB_HOST=${{ Mysql.MYSQL_HOST }}
DB_PORT=${{ Mysql.MYSQL_PORT }}
DB_DATABASE=${{ Mysql.MYSQL_DB }}
DB_USERNAME=${{ Mysql.MYSQL_USER }}
DB_PASSWORD=${{ Mysql.MYSQL_PASSWORD }}

# Redis (optional, untuk cache/session)
REDIS_HOST=${{ Redis.REDIS_HOST }}
REDIS_PORT=${{ Redis.REDIS_PORT }}
REDIS_PASSWORD=${{ Redis.REDIS_PASSWORD }}

# Midtrans
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key

# Session & Cache
SESSION_DRIVER=cookie
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Step 5: Deploy Domain

1. Railway → Project → Settings → Domains
2. Click "Generate Domain" atau add custom domain
3. Custom domain setup:
    - Beli domain di (Namecheap, GoDaddy, etc)
    - Add CNAME ke Railway
    - Wait untuk DNS propagation (15-30 menit)

### Step 6: Run First Deployment

1. Push code ke GitHub:

```bash
git add .
git commit -m "Setup Railway deployment"
git push
```

2. Railway akan auto-detect changes dan deploy
3. Check status di Railway dashboard
4. Logs available di Deployments tab

### Step 7: Database Migrations

Railway akan auto-run migrations dari `Procfile` release command.
Tapi jika perlu manual:

```bash
# Via Railway CLI
railway run php artisan migrate

# Or via dashboard → Container → Bash
php artisan migrate
```

### Troubleshooting

**Deploy failed?**

- Check Logs di Railway dashboard
- Verify environment variables
- Ensure APP_KEY correct

**Database connection error?**

- Check DB credentials di Variables
- Verify MySQL service is running
- Check Procfile release command

**File upload not working?**

- Railway has ephemeral storage (files deleted on restart)
- Use cloud storage (AWS S3, etc) untuk production
- Or use Railway's persistent storage

**Midtrans callback failed?**

- Whitelist Railway domain di Midtrans dashboard
- Set correct APP_URL environment variable
- Check webhook endpoint di Midtrans settings

### Monitoring & Logs

- **Dashboard**: https://railway.app/dashboard
- **Logs**: Project → Deployments → Logs
- **Metrics**: Memory, CPU, Network usage
- **Database**: Project → MySQL → Database tools

### Scaling & Pricing

Railway pricing (pay-as-you-go):

- **Compute**: $0.00003/hour (very cheap for low traffic)
- **Database**: Included in free tier initially
- **Typical cost**: $5-15/month untuk app + database

Untuk scale:

- Railway auto-scales based on demand
- Vertical scaling via Railway dashboard
- Horizontal scaling via load balancer

### Tips Production

✅ Set APP_DEBUG=false
✅ Set APP_ENV=production
✅ Use strong APP_KEY (php artisan key:generate)
✅ Setup SSL (Railway auto-provide HTTPS)
✅ Configure backups untuk database
✅ Monitor logs regularly
✅ Setup alerting di production

### Rollback Deployment

Jika ada error:

1. Railway dashboard → Deployments
2. Klik deployment sebelumnya
3. Click "Redeploy" untuk rollback

### Update Code

Setiap push ke main branch:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Railway auto-deploy dalam 2-5 menit!

---

## 📱 Full App Flow Setelah Deploy

1. User visit: `https://yourapp.railway.app`
2. Frontend load dari CDN via Railway
3. API calls ke backend di same domain
4. Database queries ke MySQL (Railway)
5. Files upload ke storage
6. Payment via Midtrans
7. Webhook dari Midtrans ke backend

---

## 🔗 Useful Links

- Railway Docs: https://docs.railway.app/
- Laravel on Railway: https://railway.app/template/laravel
- Procfile Reference: https://devcenter.heroku.com/articles/procfile
- Environment Variables: https://docs.railway.app/develop/variables

---

## ✅ Deployment Checklist

- [ ] GitHub repository created & code pushed
- [ ] Signed up Railway
- [ ] Connected GitHub to Railway
- [ ] Project created & auto-detected as Laravel
- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] Domain assigned or custom domain setup
- [ ] First deployment successful
- [ ] Database migrations ran
- [ ] Test photo upload
- [ ] Test payment flow
- [ ] Monitor logs untuk errors
- [ ] Setup monitoring/alerts

Selamat! Photobooth Website Anda sekarang live di Railway! 🎉

# Railway Deployment - Quick Start

## ⚡ 5 Menit Setup

### 1️⃣ Persiapan GitHub

```bash
cd f:\tania\web-tania\memoriaFinal\Memoria

# Initialize git if not already
git init
git add .
git commit -m "Photobooth Website - Ready for Railway"

# Push to GitHub (ganti USERNAME dengan akun GitHub Anda)
git branch -M main
git remote add origin https://github.com/USERNAME/web-tania.git
git push -u origin main
```

### 2️⃣ Setup Railway

1. Buka https://railway.app
2. Click "Login" → pilih "GitHub"
3. Authorize Railway
4. Click "New Project"
5. Pilih "Deploy from GitHub"
6. Select repository `web-tania`
7. **Railway akan auto-detect & setup:**
    - ✅ PHP runtime
    - ✅ Node.js runtime
    - ✅ MySQL database
    - ✅ Redis cache (optional)

### 3️⃣ Environment Variables

Di Railway Dashboard → Project → Variables, set:

```
# Core
APP_NAME=PhotoBooth
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:o59HHczJuUvDZSvn3zu3ygEeewIuNH4ZQqYHvJg3Xj0=
APP_URL=https://your-project.railway.app

# Database - Railway auto-provides these
DB_CONNECTION=mysql
DB_HOST=${{ mysql.MYSQL_HOST }}
DB_PORT=${{ mysql.MYSQL_PORT }}
DB_DATABASE=${{ mysql.MYSQL_DB }}
DB_USERNAME=${{ mysql.MYSQL_USER }}
DB_PASSWORD=${{ mysql.MYSQL_PASSWORD }}

# Midtrans (set ke production keys)
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
```

### 4️⃣ Deploy!

1. Di Railway dashboard, klik "Deploy"
2. Wait ~3-5 menit
3. Check Logs untuk confirm success
4. Visit generated domain atau add custom domain

### 5️⃣ Database Migrations

Opsi A - Automatic (recommended):

- Railway akan auto-run via Procfile release command
- Migrations run otomatis setelah deploy

Opsi B - Manual via CLI:

```bash
railway run php artisan migrate
```

---

## ✅ Done! Sekarang:

- ✅ App live di Railway
- ✅ Database connected
- ✅ Migrations ran
- ✅ Testing photo upload
- ✅ Testing payment flow
- ✅ Monitoring logs

---

## 🔗 Important Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Your App Domain**: https://your-project.railway.app
- **Logs**: Railway Dashboard → Project → Deployments
- **Database**: Railway Dashboard → MySQL

---

## 🐛 Troubleshooting

**App tidak load?**

- Check Logs di Railway
- Verify APP_KEY correct
- Ensure DB variables correct

**Photos tidak save?**

- Check storage permissions
- Review logs untuk details
- Use S3 untuk production (optional)

**Payment error?**

- Verify Midtrans keys benar
- Whitelist Railway domain di Midtrans
- Check webhook di Midtrans settings

---

## 🔄 Update Code

Setiap update:

```bash
git add .
git commit -m "Your message"
git push origin main
```

Railway auto-deploy dalam 2-5 menit! 🚀

---

## 💡 Next Steps

1. ✅ Deploy ke Railway (sekarang)
2. ⏭️ Setup custom domain (Namecheap/GoDaddy)
3. ⏭️ Configure Midtrans production keys
4. ⏭️ Setup monitoring & backups
5. ⏭️ Promote jadi public

Happy deployment! 🎉

# Railway Deployment Checklist & Summary

## 📋 Pre-Deployment Checklist

### ✅ Backend Files Created

- [x] `Procfile` - App start command & migrations
- [x] `railway.json` - Railway configuration
- [x] `app.json` - Heroku-style app manifest
- [x] `.env.production` - Production environment template

### ✅ Documentation Files

- [x] `RAILWAY_DEPLOYMENT.md` - Detailed guide
- [x] `RAILWAY_QUICK_START.md` - Quick setup guide
- [x] `deploy-railway.sh` - Linux/Mac setup script
- [x] `deploy-railway.bat` - Windows setup script

### ✅ Code Ready

- [x] All migrations created
- [x] All models implemented
- [x] All controllers implemented
- [x] API routes configured
- [x] Frontend compiled (no errors)
- [x] Storage symlink created

---

## 🚀 DEPLOYMENT STEPS (Copy-Paste Ready)

### Step 1: Push to GitHub

```bash
cd f:\tania\web-tania\memoriaFinal\Memoria

# Initialize if not already done
git init
git add .
git commit -m "Photobooth Website - Ready for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/web-tania.git
git push -u origin main
```

**Replace `YOUR_USERNAME` dengan GitHub username Anda!**

### Step 2: Create Railway Account

1. Buka https://railway.app
2. Click "Login" → "GitHub"
3. Authorize Railway to access GitHub
4. Done! Account created

### Step 3: Deploy Project

1. Buka https://railway.app/dashboard
2. Click "New Project"
3. Click "Deploy from GitHub"
4. Select repository: `web-tania`
5. Click "Deploy"
6. Wait ~1-2 minutes untuk Rails auto-detect Laravel

**Railway akan auto-create:**

- ✅ PHP 8.2 runtime
- ✅ Node.js 18 runtime
- ✅ MySQL 8.0 database
- ✅ Redis cache (optional)
- ✅ Environment variables setup

### Step 4: Set Environment Variables

Di Railway Dashboard → Your Project → Variables, **add these:**

```
APP_NAME=PhotoBooth
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:o59HHczJuUvDZSvn3zu3ygEeewIuNH4ZQqYHvJg3Xj0=
APP_URL=https://your-app.railway.app

DB_CONNECTION=mysql
DB_HOST=${{ mysql.MYSQL_HOST }}
DB_PORT=${{ mysql.MYSQL_PORT }}
DB_DATABASE=${{ mysql.MYSQL_DB }}
DB_USERNAME=${{ mysql.MYSQL_USER }}
DB_PASSWORD=${{ mysql.MYSQL_PASSWORD }}

MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=sk_prod_your_actual_key
MIDTRANS_CLIENT_KEY=ct_prod_your_actual_key

SESSION_DRIVER=cookie
CACHE_DRIVER=array
QUEUE_CONNECTION=sync
```

**IMPORTANT:**

- Replace `MIDTRANS_SERVER_KEY` dengan production key dari Midtrans
- Replace `MIDTRANS_CLIENT_KEY` dengan production client key
- Dapatkan di: https://dashboard.midtrans.com → Settings → Keys

### Step 5: Wait for Deployment

1. Railway dashboard akan show deployment progress
2. Check "Deployments" tab untuk logs
3. Wait sampai status "Success" dengan green checkmark
4. Deployment biasanya 3-5 menit

### Step 6: Database Migrations

Pilih salah satu:

**Option A - Automatic (Recommended):**

- Railway auto-run via `Procfile` release command
- Migrations run otomatis setelah deployment selesai
- Cek logs untuk confirm

**Option B - Manual:**

```bash
# Via Railway CLI
railway run php artisan migrate

# Or via Railway Dashboard:
# - Project → Container → Bash
# - Type: php artisan migrate
```

### Step 7: Test Aplikasi

1. Buka domain Railway (lihat di dashboard): `https://your-app.railway.app`
2. Seharusnya muncul halaman Photobooth
3. Test fitur:
    - ✅ Load homepage
    - ✅ Ambil foto (perlu camera permission)
    - ✅ Upload foto
    - ✅ Checkout payment
    - ✅ Midtrans payment flow

### Step 8: Setup Custom Domain (Optional)

1. Beli domain di Namecheap / GoDaddy
2. Di Railway → Project → Settings → Domains
3. Click "Add Custom Domain"
4. Add CNAME dari Namecheap ke Railway
5. Wait 15-30 menit untuk DNS propagate
6. App akan accessible di custom domain

---

## 📊 What Railway Provides

| Feature               | Included            |
| --------------------- | ------------------- |
| PHP 8.2 Runtime       | ✅ Yes              |
| Node.js 18            | ✅ Yes              |
| MySQL 8.0 Database    | ✅ Yes              |
| Redis Cache           | ✅ Yes (free tier)  |
| SSL/HTTPS             | ✅ Auto             |
| Automatic Deployment  | ✅ Git push trigger |
| Environment Variables | ✅ Secure storage   |
| Logs & Monitoring     | ✅ Dashboard        |
| Auto Scaling          | ✅ Based on load    |

---

## 💰 Pricing

**Railway adalah Pay-As-You-Go:**

| Resource            | Cost                        |
| ------------------- | --------------------------- |
| Compute             | $0.00003/hour (very cheap!) |
| MySQL Database      | Included in free tier       |
| Redis Cache         | $0.25/month                 |
| **Typical Monthly** | $5-15                       |

**Free Tier:**

- $5 free credit per month
- Cukup untuk development & low traffic

---

## 🐛 Troubleshooting

### ❌ Deployment Failed

**Solution:**

1. Check Logs di Railway dashboard
2. Common issues:
    - Missing APP_KEY → Copy dari .env
    - Wrong DB variables → Check Railway auto-generated ones
    - PHP version mismatch → Use 8.2+

### ❌ App Shows "502 Bad Gateway"

**Solution:**

1. Wait 1-2 minutes (app might be booting)
2. Check if migrations ran successfully
3. Verify APP_KEY correct
4. Check Logs untuk errors

### ❌ Database Connection Error

**Solution:**

1. Verify `DB_HOST`, `DB_PORT`, `DB_DATABASE` correct
2. Use Railway auto-generated variables: `${{ mysql.MYSQL_HOST }}`
3. Check MySQL service is running di Railway
4. Run migrations manually: `railway run php artisan migrate`

### ❌ Photos Not Saving

**Solution:**

1. Check storage permissions
2. For production, use AWS S3 atau cloud storage
3. Railway ephemeral storage = files deleted on restart
4. Configure S3 di `.env` (optional)

### ❌ Midtrans Payment Not Working

**Solution:**

1. Verify production keys correct
2. Whitelist Railway domain di Midtrans dashboard
3. Check webhook endpoint di Midtrans settings
4. Use sandbox keys untuk testing dulu

---

## ✅ Deployment Success Checklist

After deployment, verify:

- [ ] App accessible di Railway domain
- [ ] Homepage loads without errors
- [ ] Database connected (check logs)
- [ ] Photos can be uploaded
- [ ] Payment gateway appears
- [ ] Logs show no critical errors
- [ ] Environment variables all set

---

## 📚 Important Files for Railway

```
Memoria/
├── Procfile                    ← Start command & migrations
├── railway.json               ← Railway config
├── app.json                   ← App manifest
├── .env.production            ← Production template
├── composer.json              ← PHP dependencies
├── package.json               ← Node dependencies
├── public/                    ← Web root
│   ├── index.php             ← Entry point
│   └── build/                ← Compiled assets
└── storage/app/public/        ← Photo storage
```

---

## 🔗 Useful Links

| Link                           | Purpose             |
| ------------------------------ | ------------------- |
| https://railway.app/dashboard  | Railway Dashboard   |
| https://docs.railway.app       | Documentation       |
| https://dashboard.midtrans.com | Midtrans Dashboard  |
| https://namecheap.com          | Domain Registration |

---

## 📞 Support

**Railroad tidak jalan?**

- Check Railway logs: Dashboard → Deployments → Logs
- GitHub issues: Jika ada masalah dengan code

**Midtrans payment issue?**

- Midtrans support: https://support.midtrans.com
- Midtrans sandbox keys untuk testing

**Database issues?**

- Railway MySQL tools: Dashboard → MySQL → Database
- Check connection string

---

## 🎯 Final Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Project deployed
- [ ] Environment variables set
- [ ] Database migrations ran
- [ ] App accessible
- [ ] Midtrans keys updated
- [ ] Custom domain (optional)
- [ ] Tested all features
- [ ] Monitoring setup (optional)

---

## 🎉 Congratulations!

Photobooth Website Anda sekarang live di Railway!

**Next steps:**

1. Monitor logs regularly
2. Setup backups untuk database
3. Configure custom domain
4. Promote ke production
5. Monitor performance

---

**Questions? Check:**

- RAILWAY_QUICK_START.md
- RAILWAY_DEPLOYMENT.md
- https://docs.railway.app

**Good luck! 🚀**

# Photo Booth Website - Complete Setup Guide

Ini adalah dokumentasi lengkap untuk Photo Booth Website yang telah dikonfigurasi dengan fitur lengkap.

## 🎉 Fitur Utama

✅ **Capture Foto dengan Kamera**

- Menggunakan webcam untuk mengambil foto
- Auto capture dengan countdown
- Manual capture juga tersedia

✅ **Penyimpanan Foto**

- Foto disimpan otomatis ke database
- File management yang rapi per session
- Galeri preview untuk melihat foto yang sudah diambil

✅ **Pembayaran Midtrans**

- Integrasi penuh dengan Midtrans Snap
- Support berbagai payment method (Transfer bank, e-wallet, kartu kredit)
- Notifikasi real-time dari Midtrans

✅ **Database & Management**

- 4 tabel utama: PhotoSession, Photo, Booking, Payment
- Relationship yang sempurna antar tabel
- Session tracking yang komprehensif

## 📋 Database Structure

### photo_sessions

- id
- user_id (nullable)
- session_code (unique)
- customer_name
- customer_email
- customer_phone
- photo_count
- max_photos
- price (decimal)
- status (pending, completed, paid)
- started_at
- completed_at
- notes

### photos

- id
- photo_session_id (foreign key)
- file_path
- file_name
- mime_type
- file_size
- sequence_number
- is_selected
- effects (json)

### bookings

- id
- photo_session_id (foreign key)
- booking_code (unique)
- booking_date
- booking_time
- duration_minutes
- pax
- location
- special_requests
- status
- cancelled_at
- cancellation_reason

### payments

- id
- photo_session_id (foreign key)
- transaction_id (unique)
- order_id (unique)
- amount (decimal)
- currency
- payment_method
- status (pending, processing, paid, failed, cancelled, expired)
- payment_type
- midtrans_response (json)
- paid_at
- expires_at
- receipt_url
- notes

## 🔧 Konfigurasi

### 1. Midtrans Setup

Tambahkan keys Midtrans ke file `.env`:

```env
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
```

**Cara mendapatkan Midtrans keys:**

1. Daftar di https://dashboard.midtrans.com
2. Verifikasi email dan akun
3. Login ke dashboard
4. Pergi ke Settings → Keys
5. Copy Server Key dan Client Key

### 2. Storage Configuration

Storage sudah dikonfigurasi untuk public disk di `config/filesystems.php`.
Storage symlink sudah dibuat dengan:

```bash
php artisan storage:link
```

Foto akan disimpan di: `storage/app/public/photobooth/`

## 🚀 API Endpoints

### Photo Session

```
POST   /api/photobooth/session                    # Create new session
GET    /api/photobooth/session/{session}          # Get session details
POST   /api/photobooth/session/{session}/complete # Complete session
GET    /api/photobooth/session/{session}/download # Download all photos
```

### Photos

```
POST   /api/photobooth/session/{session}/photo    # Capture photo
GET    /api/photobooth/session/{session}/photos   # Get all photos
DELETE /api/photobooth/photo/{photo}              # Delete photo
```

### Bookings

```
POST   /api/photobooth/booking                    # Create booking
GET    /api/photobooth/booking/{booking}          # Get booking
POST   /api/photobooth/booking/{booking}/confirm  # Confirm booking
POST   /api/photobooth/booking/{booking}/cancel   # Cancel booking
GET    /api/photobooth/session/{session}/booking  # Get session booking
```

### Payments

```
POST   /api/photobooth/payment/create/{session}   # Create payment snap
GET    /api/photobooth/payment/{session}          # Get payment status
GET    /api/photobooth/payment/{session}/verify   # Verify payment
POST   /api/photobooth/payment/notification       # Midtrans webhook
```

## 💻 Frontend Flow

### Pages

1. **Intro** - Welcome page
2. **Info** - Customer info collection
3. **Camera** - Photo capture interface
4. **Gallery** - Photo review dan management
5. **Payment** - Payment gateway (Midtrans Snap)
6. **Success** - Payment confirmation

### Components

- `PhotoBoothApp.jsx` - Main app component
- `PhotoBoothSession.jsx` - Session management hook
- `usePayment.js` - Payment management hook
- `PaymentPage.jsx` - Payment UI

## 📱 Usage Flow

1. User clicks "Mulai Sekarang" → goes to intro
2. User enters customer info → creates session
3. User takes photos with camera → auto/manual capture
4. User reviews photos in gallery → can delete or proceed
5. Complete session → go to payment
6. Midtrans Snap opens → user pays
7. Payment verified → success page

## 🔐 Security

- CSRF token protection untuk semua POST requests
- Midtrans notification endpoint excluded dari CSRF (server-to-server)
- File storage di public disk dengan proper access control
- Session-based photo association

## 📊 Pricing Configuration

Di `.env`:

```env
# Default price Rp 50.000
# Configurable per customer pada info page
```

## 🧪 Testing

### Manual Test Session:

```bash
# 1. Create session via API
POST /api/photobooth/session
{
  "customer_name": "Test User",
  "customer_email": "test@example.com",
  "customer_phone": "08123456789",
  "max_photos": 4,
  "price": 50000
}

# 2. Capture photo
POST /api/photobooth/session/{sessionId}/photo
{
  "image": "base64_image_data"
}

# 3. Create payment
POST /api/photobooth/payment/create/{sessionId}

# 4. Verify payment status
GET /api/photobooth/payment/{sessionId}/verify
```

## 🛠️ Development

### File Locations

- **Models:** `app/Models/`
    - PhotoSession.php
    - Photo.php
    - Booking.php
    - Payment.php

- **Controllers:** `app/Http/Controllers/`
    - PhotoBoothController.php
    - PaymentController.php
    - BookingController.php

- **Routes:** `routes/web.php`

- **Frontend:** `resources/js/components/`
    - PhotoBoothApp.jsx
    - PaymentPage.jsx

- **Migrations:** `database/migrations/`

- **Storage:** `storage/app/public/photobooth/`

### Database Relationships

```
PhotoSession (1) ─── (Many) Photos
PhotoSession (1) ─── (One) Booking
PhotoSession (1) ─── (One) Payment
```

## 📝 Notes

- Midtrans Snap handles all payment UI
- Photo files stored as JPG in public storage
- Session codes generated automatically (PS-XXXXXXXX)
- Order IDs generated automatically (ORD-TIMESTAMP-RANDOM)
- Booking codes generated automatically (BK-XXXXXXXX)
- All timestamps in UTC

## 🐛 Troubleshooting

### Photos tidak muncul

- Check storage permissions
- Verify symlink: `php artisan storage:link`
- Check `storage/app/public/photobooth/` directory

### Payment error

- Verify Midtrans keys di `.env`
- Check `MIDTRANS_IS_PRODUCTION` setting
- Review Midtrans dashboard for webhook logs

### CSRF token error

- Ensure CSRF token in meta tag
- Check axios configuration di bootstrap.js
- Verify exempt routes di bootstrap/app.php

## 📞 Support

Untuk setting Midtrans:

- Documentation: https://docs.midtrans.com/
- Dashboard: https://dashboard.midtrans.com/
- Support: https://support.midtrans.com/

## ✅ Checklist

- [x] Database migrations created
- [x] Models dengan relationships
- [x] Controllers untuk semua features
- [x] API routes lengkap
- [x] Frontend components siap
- [x] Midtrans integration
- [x] Storage configuration
- [x] CSRF protection
- [x] Payment notification handling
- [x] Documentation

Semuanya sudah siap untuk production! 🎉

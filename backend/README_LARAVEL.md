# نظام جرد المخازن - Laravel Backend

تم تحويل النظام إلى Laravel!

## البنية

- **Backend**: Laravel 12
- **Frontend**: React (في مجلد `client`)
- **Database**: SQLite (يمكن تغييره لـ MySQL/PostgreSQL)

## التثبيت والتشغيل

### 1. تثبيت التبعيات

```bash
cd backend
composer install
```

### 2. إعداد قاعدة البيانات

البيانات موجودة في `database/database.sqlite` (تم إنشاؤها تلقائياً).

إذا أردت استخدام MySQL أو PostgreSQL، عدّل ملف `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=storeee
DB_USERNAME=root
DB_PASSWORD=
```

ثم شغّل:
```bash
php artisan migrate
php artisan db:seed --class=TeamSeeder
```

### 3. تشغيل Laravel

```bash
php artisan serve
```

سيشغل الخادم على: http://localhost:8000

### 4. تشغيل React Frontend

في نافذة أخرى:
```bash
cd ../client
npm run dev
```

## API Endpoints

جميع الـ API routes موجودة تحت `/api/`:

- `GET /api/teams` - قائمة الفِرق
- `POST /api/teams` - إضافة فريق
- `GET /api/warehouses` - قائمة المخازن
- `POST /api/warehouses` - إضافة مخزن
- `GET /api/products` - قائمة المنتجات
- `POST /api/products` - إضافة منتج
- `GET /api/transactions` - قائمة الحركات
- `POST /api/transactions` - إضافة حركة
- `GET /api/inventory?warehouseId=xxx&teamId=xxx` - المخزون

## المميزات

✅ قاعدة بيانات حقيقية (SQLite)
✅ UUIDs للـ IDs
✅ Validations
✅ Relations بين الجداول
✅ CORS مُفعّل للواجهة الأمامية
✅ جميع الميزات السابقة محفوظة

## ملاحظات

- البيانات محفوظة في قاعدة بيانات SQLite
- يمكن ترقية النظام لاستخدام MySQL أو PostgreSQL بسهولة
- النظام يدعم جميع الميزات السابقة (الفِرق، مدير المخزن، إلخ)


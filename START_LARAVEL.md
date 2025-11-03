# كيفية تشغيل Laravel Backend

## المشكلة الحالية
Laravel server غير شغال، لذلك React لا يستطيع الاتصال به (ECONNREFUSED).

## الحل - تشغيل Laravel:

### الطريقة 1: من PowerShell
```powershell
cd backend
php artisan serve
```

### الطريقة 2: استخدام الملفات الجاهزة
- **Windows**: اضغط مرتين على `start-laravel.bat`
- **PowerShell**: شغل `.\start-laravel.ps1`

## بعد تشغيل Laravel:
- سيعمل على: **http://localhost:8000**
- ستظهر رسالة: `Laravel development server started: http://127.0.0.1:8000`

## للتشغيل الكامل:

### نافذة 1 - Laravel Backend:
```bash
cd backend
php artisan serve
```

### نافذة 2 - React Frontend:
```bash
cd client
npm run dev
```

## التحقق:
- افتح المتصفح: http://localhost:8000/api/teams
- يجب أن ترى قائمة JSON بالفِرق (فارغة أو بها الفِرق الافتراضية)

---

**ملاحظة**: يجب أن يبقى Laravel server شغالاً طوال الوقت أثناء استخدام التطبيق.


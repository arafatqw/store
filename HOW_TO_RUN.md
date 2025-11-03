# كيفية تشغيل النظام

## الطريقة الأولى: استخدام الأوامر المباشرة

افتح **نافذتين** من PowerShell أو Terminal:

### النافذة الأولى - Backend (الخادم):
```bash
cd server
node server.js
```

يجب أن ترى: `Server running on http://localhost:3001`

### النافذة الثانية - Frontend (الواجهة):
```bash
cd client
npm run dev
```

يجب أن ترى: `Local: http://localhost:3000`

---

## الطريقة الثانية: استخدام npm scripts

من المجلد الرئيسي:

```bash
npm run start:server
```

في نافذة أخرى:

```bash
npm run start:client
```

---

## الطريقة الثالثة: استخدام الملفات الجاهزة

### Windows:
اضغط مرتين على `start.bat`

### PowerShell:
```bash
.\start.ps1
```

---

## التحقق من أن الخادم يعمل:

1. افتح المتصفح واذهب إلى: http://localhost:3001
   - إذا رأيت رسالة خطأ JSON، هذا طبيعي (الخادم يعمل!)

2. ثم افتح: http://localhost:3000
   - يجب أن ترى واجهة النظام

---

## ملاحظات مهمة:

- ⚠️ يجب أن يعمل Backend (المنفذ 3001) قبل Frontend (المنفذ 3000)
- ⚠️ تأكد أن المنفذين 3000 و 3001 غير مستخدمين من تطبيقات أخرى
- ⚠️ إذا كان الخادم لا يعمل، تأكد من أنك قمت بتثبيت التبعيات: `npm install` في كل من `server` و `client`

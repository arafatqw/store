# نظام جرد المخازن - Storeee Inventory System

نظام شامل لإدارة المخازن والمنتجات مع واجهة مستخدم عصرية وسهلة الاستخدام.

## المميزات

- ✅ إدارة المنتجات (إضافة، تعديل، حذف، بحث)
- ✅ إدارة المخازن
- ✅ متابعة المخزون في الوقت الفعلي
- ✅ تسجيل حركات الدخول والخروج
- ✅ واجهة مستخدم عصرية ومتجاوبة
- ✅ تقارير وإحصائيات شاملة

## التقنيات المستخدمة

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: JSON (يمكن ترقيته لقاعدة بيانات حقيقية)

## التثبيت والتشغيل

### 1. تثبيت جميع التبعيات

```bash
npm run install-all
```

### 2. تشغيل التطبيق

```bash
npm run dev
```

سيعمل التطبيق على:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### أو يمكنك تشغيل كل جزء بشكل منفصل:

#### تشغيل الـ Backend فقط:
```bash
cd server
npm install
npm run dev
```

#### تشغيل الـ Frontend فقط:
```bash
cd client
npm install
npm run dev
```

## البنية

```
Storeee/
├── client/           # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── server/           # Backend (Express)
│   ├── server.js
│   ├── data.json     # قاعدة البيانات (JSON)
│   └── package.json
└── package.json      # Root package.json
```

## استخدام النظام

1. **لوحة التحكم**: عرض إحصائيات شاملة
2. **المنتجات**: إضافة وإدارة المنتجات
3. **المخازن**: إدارة المخازن المختلفة
4. **المخزون**: عرض الكميات المتوفرة
5. **الحركات**: تسجيل حركات الدخول والخروج

## ملاحظات

- البيانات تُحفظ في ملف `server/data.json`
- يمكن ترقية النظام لاستخدام قاعدة بيانات حقيقية (MySQL, PostgreSQL, MongoDB)
- يمكن إضافة ميزات أخرى مثل المستخدمين والصلاحيات، التقارير المتقدمة، إلخ

## الترخيص

MIT License

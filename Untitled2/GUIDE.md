# دليل التحكم في منصة الترشح للماستر

## 📋 جدول المحتويات
1. [تغيير معلومات الأقسام والتخصصات](#1-تغيير-معلومات-الأقسام-والتخصصات)
2. [تغيير التواريخ والجدول الزمني](#2-تغيير-التواريخ-والجدول-الزمني)
3. [تغيير الإيميلات](#3-تغيير-الإيميلات)
4. [إضافة أو حذف تخصصات](#4-إضافة-أو-حذف-تخصصات)
5. [إضافة قسم جديد](#5-إضافة-قسم-جديد)

---

## 1. تغيير معلومات الأقسام والتخصصات

### الملف المطلوب:
```
src/app/components/DepartmentSelection.tsx
```

### المكان في الكود (السطر 18 تقريباً):
```typescript
export const departments: Department[] = [
  {
    id: 'physics',                    // ← معرف القسم (لا تغيره)
    name: 'قسم الفيزياء',             // ← اسم القسم (يمكن تغييره)
    icon: Atom,                       // ← الأيقونة (Atom, FlaskConical, Calculator)
    color: 'text-blue-600',           // ← لون النص
    bgColor: 'bg-blue-50',            // ← لون الخلفية
    email: 'deptphy@gmail.com',       // ← الإيميل الذي ستصل إليه الطلبات
    specializations: [                 // ← قائمة التخصصات
      { 
        id: 'phys-theo',              // ← معرف التخصص
        name: 'فيزياء نظرية',          // ← اسم التخصص (يمكن تغييره)
        availableSeats: 50,           // ← عدد المقاعد المتاحة (غيره كما تريد)
        applicants: 42                // ← عدد المتقدمين الحالي (سيتحدث تلقائياً)
      },
      // ... باقي التخصصات
    ],
  },
  // ... باقي الأقسام
];
```

### مثال: تغيير عدد المقاعد
إذا أردت تغيير عدد المقاعد لتخصص "فيزياء نظرية" من 50 إلى 60:
```typescript
{ id: 'phys-theo', name: 'فيزياء نظرية', availableSeats: 60, applicants: 42 },
```

### مثال: تغيير اسم التخصص
```typescript
{ id: 'phys-theo', name: 'الفيزياء النظرية والتطبيقية', availableSeats: 50, applicants: 42 },
```

---

## 2. تغيير التواريخ والجدول الزمني

### الملف المطلوب:
```
src/app/components/Timeline.tsx
```

### المكان في الكود (السطر 12 تقريباً):
```typescript
const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'فتح التسجيلات',
    date: '01 يونيو 2026',              // ← غير التاريخ هنا
    description: 'بداية استقبال طلبات الترشح للماستر',
    status: 'completed',              // ← completed = منتهي، current = جاري، upcoming = قادم
    icon: Calendar,
  },
  {
    id: 2,
    title: 'إغلاق التسجيلات',
    date: '30 يونيو 2026',              // ← آخر موعد للتسجيل
    description: 'آخر موعد لإيداع ملفات الترشح',
    status: 'current',                // ← المرحلة الحالية
    icon: FileCheck,
  },
  {
    id: 3,
    title: 'الفرز الأولي',
    date: '15 يوليو 2026',              // ← تاريخ الفرز
    description: 'دراسة الملفات والفرز الأولي للمترشحين',
    status: 'upcoming',
    icon: UserCheck,
  },
  {
    id: 4,
    title: 'إعلان النتائج',
    date: '01 أغسطس 2026',             // ← تاريخ إعلان النتائج
    description: 'نشر القائمة النهائية للمقبولين',
    status: 'upcoming',
    icon: Award,
  },
];
```

### إضافة مرحلة جديدة:
أضف هذا الكود بعد المرحلة الأخيرة:
```typescript
{
  id: 5,
  title: 'بداية التسجيل الإداري',
  date: '15 أغسطس 2026',
  description: 'بداية التسجيل الإداري للطلبة المقبولين',
  status: 'upcoming',
  icon: Award,  // يمكنك استخدام أي أيقونة من lucide-react
},
```

---

## 3. تغيير الإيميلات

### الملف المطلوب:
```
src/app/components/DepartmentSelection.tsx
```

### تم تحديث الإيميلات كالتالي:
```typescript
{
  id: 'physics',
  name: 'قسم الفيزياء',
  email: 'deptphy@gmail.com',        // ← إيميل قسم الفيزياء
  // ...
},
{
  id: 'chemistry',
  name: 'قسم الكيمياء',
  email: 'pg.dep.chemie@gmail.com',  // ← إيميل قسم الكيمياء
  // ...
},
{
  id: 'mathematics',
  name: 'قسم الرياضيات والإعلام الآلي',
  email: 'brahimtel@yahoo.fr',       // ← إيميل قسم الرياضيات
  // ...
},
```

**ملاحظة مهمة:** حالياً الإيميل يظهر فقط في زر الإرسال. لإرسال البيانات فعلياً للإيميل، تحتاج إلى:
1. إعداد خادم Backend (مثل Node.js + Express)
2. أو استخدام خدمة مثل EmailJS أو SendGrid
3. سأشرح لك لاحقاً كيف تربط النموذج بإرسال إيميل حقيقي

---

## 4. إضافة أو حذف تخصصات

### لإضافة تخصص جديد:
في ملف `DepartmentSelection.tsx`، أضف التخصص في قائمة `specializations`:

```typescript
{
  id: 'chemistry',
  name: 'قسم الكيمياء',
  email: 'pg.dep.chemie@gmail.com',
  specializations: [
    { id: 'chem-org', name: 'كيمياء عضوية', availableSeats: 55, applicants: 62 },
    { id: 'chem-anal', name: 'كيمياء تحليلية', availableSeats: 50, applicants: 47 },
    // أضف التخصص الجديد هنا ↓
    { id: 'chem-bio', name: 'الكيمياء الحيوية', availableSeats: 40, applicants: 0 },
  ],
},
```

### لحذف تخصص:
احذف السطر الكامل للتخصص المراد حذفه.

---

## 5. إضافة قسم جديد

### الخطوة 1: إضافة القسم في DepartmentSelection.tsx

```typescript
import { Beaker } from 'lucide-react'; // استورد أيقونة جديدة

export const departments: Department[] = [
  // ... الأقسام الموجودة
  {
    id: 'biology',                    // معرف فريد
    name: 'قسم البيولوجيا',
    icon: Beaker,                     // اختر أيقونة مناسبة
    color: 'text-purple-600',         // لون مميز
    bgColor: 'bg-purple-50',
    email: 'biology@univ-ouargla.dz',
    specializations: [
      { id: 'bio-cell', name: 'بيولوجيا خلوية', availableSeats: 45, applicants: 0 },
      { id: 'bio-mol', name: 'بيولوجيا جزيئية', availableSeats: 50, applicants: 0 },
    ],
  },
];
```

---

## 📊 حساب الأيام المتبقية تلقائياً

### الملف المطلوب:
```
src/app/App.tsx
```

### المكان في الكود (السطر 21 تقريباً):
```typescript
const daysRemaining = Math.floor(
  (new Date('2026-06-30').getTime() - new Date().getTime()) 
  / (1000 * 60 * 60 * 24)
);
```

غير التاريخ `'2026-06-30'` إلى تاريخ إغلاق التسجيلات الفعلي.

---

## 🎨 تغيير الألوان

### الملف المطلوب:
```
src/styles/theme.css
```

### الألوان الحالية:
```css
--primary: #10b981;      /* الأخضر */
--secondary: #f97316;    /* البرتقالي */
--accent: #0ea5e9;       /* الأزرق السماوي */
```

يمكنك تغيير هذه القيم إلى أي لون تريده (استخدم hex colors).

---

## 📧 إرسال البيانات للإيميل (سيتم إضافته لاحقاً)

حالياً، النموذج يعرض فقط الإيميل في زر الإرسال. لإرسال البيانات فعلياً:

### الخيار 1: استخدام EmailJS (الأسهل)
1. سجل حساب في [EmailJS](https://www.emailjs.com/)
2. احصل على Service ID و Template ID
3. سنضيف الكود لإرسال البيانات

### الخيار 2: Backend خاص
استخدام Node.js + Nodemailer لإرسال الإيميلات من السيرفر.

**هل تريد أن أضيف لك كود إرسال الإيميل الآن؟**

---

## 🔍 نصائح مهمة

1. **احفظ نسخة احتياطية** قبل أي تعديل
2. **جرب التعديلات** على ملف واحد في المرة الواحدة
3. **راجع الأخطاء** في console المتصفح إذا حدث خطأ
4. **استخدم أرقام واقعية** لعدد المقاعد والمتقدمين

---

## ❓ أسئلة شائعة

**س: كيف أغير عدد المتقدمين؟**
ج: في ملف `DepartmentSelection.tsx`، غير قيمة `applicants` لكل تخصص.

**س: هل يمكن إخفاء قسم معين؟**
ج: نعم، احذف القسم كاملاً من مصفوفة `departments`.

**س: كيف أضيف فئة جديدة للمترشحين؟**
ج: في ملف `ApplicationForm.tsx`، أضف فئة جديدة في مصفوفة `categories`.

---

**تم إنشاء هذا الدليل بتاريخ:** 13 مايو 2026
**آخر تحديث:** 13 مايو 2026

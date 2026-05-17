# دليل إعداد EmailJS لإرسال الإيميلات

## 📧 ما هو EmailJS؟
EmailJS هي خدمة تتيح لك إرسال الإيميلات مباشرة من تطبيق React بدون الحاجة لسيرفر Backend.

---

## 🚀 خطوات الإعداد

### الخطوة 1️⃣: إنشاء حساب في EmailJS

1. اذهب إلى: [https://www.emailjs.com/](https://www.emailjs.com/)
2. اضغط على **Sign Up** (التسجيل)
3. أدخل بريدك الإلكتروني وكلمة مرور
4. فعّل حسابك من الإيميل الذي سيصلك

---

### الخطوة 2️⃣: إضافة خدمة البريد الإلكتروني

1. بعد تسجيل الدخول، اذهب إلى **Email Services**
2. اضغط على **Add New Service**
3. اختر خدمة البريد:
   - **Gmail** (الأسهل والأشهر)
   - أو Yahoo Mail
   - أو Outlook
   - أو Custom SMTP (إذا كان لديك سيرفر خاص)

4. إذا اخترت Gmail:
   - اضغط **Connect Account**
   - سجل دخول بحساب Gmail الذي تريد الإرسال منه
   - وافق على الأذونات

5. **احفظ Service ID** (مثال: `service_abc123`) - ستحتاجه لاحقاً

---

### الخطوة 3️⃣: إنشاء قالب الإيميل (Email Template)

1. اذهب إلى **Email Templates**
2. اضغط **Create New Template**
3. صمم قالب الإيميل:

#### مثال على قالب للطلبة الجدد:

**Subject (العنوان):**
```
طلب ترشح جديد من {{category}} - {{department_name}}
```

**Body (المحتوى):**
```html
<div dir="rtl" style="font-family: Arial, sans-serif;">
  <h2>طلب ترشح جديد</h2>
  
  <h3>معلومات القسم:</h3>
  <p><strong>القسم:</strong> {{department_name}}</p>
  <p><strong>الفئة:</strong> {{category}}</p>
  
  <h3>بيانات المترشح:</h3>
  
  {{#if registration_number}}
  <p><strong>رقم التسجيل:</strong> {{registration_number}}</p>
  <p><strong>رقم البكالوريا:</strong> {{bac_number}}</p>
  <p><strong>الرغبات:</strong> {{preferences}}</p>
  {{/if}}
  
  {{#if first_name}}
  <p><strong>الاسم:</strong> {{first_name}} {{last_name}}</p>
  <p><strong>تاريخ الميلاد:</strong> {{birth_date}}</p>
  <p><strong>مكان الميلاد:</strong> {{birth_place}}</p>
  <p><strong>سنة البكالوريا:</strong> {{bac_year}}</p>
  <p><strong>البريد الإلكتروني:</strong> {{email}}</p>
  <p><strong>الهاتف:</strong> {{phone}}</p>
  
  <h3>المعلومات الأكاديمية:</h3>
  <p><strong>جامعة الليسانس:</strong> {{license_university}}</p>
  <p><strong>تخصص الليسانس:</strong> {{license_specialization}}</p>
  
  <h3>معدلات السداسيات:</h3>
  <ul>
    <li>السداسي 1: {{semester1}}</li>
    <li>السداسي 2: {{semester2}}</li>
    <li>السداسي 3: {{semester3}}</li>
    <li>السداسي 4: {{semester4}}</li>
    <li>السداسي 5: {{semester5}}</li>
    <li>السداسي 6: {{semester6}}</li>
  </ul>
  
  <p><strong>التخصص المرغوب:</strong> {{desired_master}}</p>
  {{/if}}
  
  <hr>
  <p><small>تاريخ الإرسال: {{submission_date}}</small></p>
  <p><small>تم الإرسال من منصة الترشح للماستر - جامعة ورقلة</small></p>
</div>
```

**To Email (المستلم):**
```
{{to_email}}
```

4. اضغط **Save**
5. **احفظ Template ID** (مثال: `template_xyz789`)

---

### الخطوة 4️⃣: الحصول على Public Key

1. اذهب إلى **Account** → **General**
2. ابحث عن **Public Key**
3. **انسخ Public Key** (مثال: `abcXYZ123456`)

---

### الخطوة 5️⃣: تحديث الكود في المشروع

افتح الملف: **`src/app/components/EmailService.tsx`**

ابحث عن هذا القسم (السطر 4):

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID',     // ← ضع Service ID هنا
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',   // ← ضع Template ID هنا
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY',     // ← ضع Public Key هنا
};
```

**عدّله ليصبح:**

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123',      // ← Service ID من EmailJS
  TEMPLATE_ID: 'template_xyz789',    // ← Template ID من EmailJS
  PUBLIC_KEY: 'abcXYZ123456',        // ← Public Key من EmailJS
};
```

---

## ✅ اختبار الإرسال

1. شغّل المشروع
2. املأ نموذج الترشح
3. اضغط "إرسال الطلب"
4. تحقق من الإيميل المستلم في صندوق الوارد

---

## 📊 الحدود المجانية

| الميزة | الحد المجاني |
|--------|--------------|
| الإيميلات شهرياً | 200 إيميل |
| الحسابات | 2 حساب |
| القوالب | غير محدودة |

إذا احتجت أكثر من 200 إيميل شهرياً، يمكنك الترقية للباقة المدفوعة ($15/شهر).

---

## 🔧 حل المشاكل الشائعة

### المشكلة: "Failed to send email"
**الحل:** 
- تأكد من صحة Service ID, Template ID, Public Key
- تحقق من الاتصال بالإنترنت
- تأكد من أن حساب Gmail موصول بشكل صحيح

### المشكلة: الإيميل لا يصل
**الحل:**
- تحقق من صندوق الرسائل غير المرغوب فيها (Spam)
- تأكد من أن القالب يحتوي على `{{to_email}}` في حقل المستلم
- تحقق من أن المتغيرات في القالب مطابقة للمتغيرات المرسلة

### المشكلة: "Invalid template parameters"
**الحل:**
- تأكد من أن أسماء المتغيرات في القالب مطابقة للأسماء في الكود
- مثلاً: `{{first_name}}` في القالب = `first_name` في الكود

---

## 🔐 نصائح أمنية

1. **لا تشارك** Service ID, Template ID, Public Key مع أحد
2. **استخدم حساب Gmail خاص** بالمنصة فقط
3. **فعّل المصادقة الثنائية** على حساب Gmail
4. **راقب الاستخدام** شهرياً للتأكد من عدم تجاوز الحد المجاني

---

## 📱 التواصل للدعم

إذا واجهت أي مشكلة:
1. راجع [توثيق EmailJS](https://www.emailjs.com/docs/)
2. أو تواصل معي مباشرة

---

**تم إنشاء هذا الدليل:** 13 مايو 2026

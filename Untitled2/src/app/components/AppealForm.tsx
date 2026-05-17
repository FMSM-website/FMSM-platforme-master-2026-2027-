// ============================================================
// AppealForm.tsx — نموذج تقديم الطعن على النتائج الأولية
// نفس أسلوب ApplicationForm.tsx تماماً
// ============================================================

import { useState } from 'react';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2, Scale } from 'lucide-react';
import { Department } from './DepartmentSelection';
import { pushToFirebase } from './firebaseConfig';
import { useLanguage } from '../i18n/LanguageContext';
import { toast } from 'sonner';

// ─── فترة الطعون الحقيقية ────────────────────────────────
const APPEAL_START = new Date('2026-06-08T00:00:00');
const APPEAL_END   = new Date('2026-06-14T23:59:59');

interface AppealFormProps {
  department: Department;
  onBack: () => void;
}

interface AppealData {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  desiredSpecialization: string;
  rejectionReason: string;
  appealReason: string;
}

interface FormErrors {
  [key: string]: string;
}

const emptyForm: AppealData = {
  firstName: '',
  lastName: '',
  registrationNumber: '',
  email: '',
  phone: '',
  desiredSpecialization: '',
  rejectionReason: '',
  appealReason: '',
};

export default function AppealForm({ department, onBack }: AppealFormProps) {
  const { t, dir } = useLanguage();
  const [form, setForm]                 = useState<AppealData>(emptyForm);
  const [errors, setErrors]             = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [appealId, setAppealId]         = useState('');

  // ─── للاختبار: true دائماً. للإنتاج: استبدل بـ isAppealPeriod() ───
  // const appealOpen = new Date() >= APPEAL_START && new Date() <= APPEAL_END;
  const appealOpen = true;

  // ─── دوال التحقق ─────────────────────────────────────────
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'هذا الحقل إجباري';
        if (/\d/.test(value)) return 'لا يجب أن يحتوي على أرقام';
        if (value.trim().length < 2) return 'يجب أن يكون أكثر من حرفين';
        return '';
      case 'registrationNumber':
        if (!value.trim()) return 'هذا الحقل إجباري';
        if (!/^\d+$/.test(value)) return 'أرقام فقط';
        return '';
      case 'email':
        if (!value.trim()) return 'هذا الحقل إجباري';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'البريد الإلكتروني غير صحيح';
        return '';
      case 'phone':
        if (!value.trim()) return 'هذا الحقل إجباري';
        if (!/^(0)(5|6|7)[0-9]{8}$/.test(value)) return 'رقم الهاتف غير صحيح (مثال: 05XXXXXXXX)';
        return '';
      case 'desiredSpecialization':
        return value ? '' : 'يجب اختيار التخصص';
      case 'rejectionReason':
        return value.trim() ? '' : 'هذا الحقل إجباري';
      case 'appealReason':
        if (!value.trim()) return 'هذا الحقل إجباري';
        if (value.trim().length < 30) return 'يجب أن يكون 30 حرفاً على الأقل';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === 'firstName' || name === 'lastName') filtered = value.replace(/[0-9]/g, '');
    if (name === 'registrationNumber') filtered = value.replace(/\D/g, '');
    if (name === 'phone') filtered = value.replace(/\D/g, '').slice(0, 10);

    setForm(prev => ({ ...prev, [name]: filtered }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, filtered) }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    (Object.keys(emptyForm) as (keyof AppealData)[]).forEach(key => {
      newErrors[key] = validateField(key, form[key]);
    });
    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== '');
  };

  // ─── الإرسال ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateAll()) {
      toast.error('يوجد أخطاء في النموذج', {
        description: 'يرجى مراجعة جميع الحقول والتأكد من صحتها',
        duration: 5000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        department: department.name,
        departmentId: department.id,
        departmentEmail: department.email,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };
      const id = await pushToFirebase(`appeals/${department.id}`, payload);
      setAppealId(id || `APL-${Date.now()}`);
      setSubmitted(true);
      toast.success('تم تقديم الطعن بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── شاشة النجاح ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8" dir={dir}>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">تم تقديم طعنك بنجاح</h2>
          <p className="text-gray-600 mb-1">
            رقم الطعن: <span className="font-mono font-bold text-orange-600">{appealId}</span>
          </p>
          <p className="text-sm text-gray-500 mt-4 max-w-md">
            سيتم مراجعة طعنك من قِبَل رئيس <strong>{department.name}</strong> والرد عليك
            عبر البريد <strong>{form.email}</strong> قبل <strong>20 يونيو 2026</strong>.
          </p>
          <button
            onClick={onBack}
            className="mt-8 px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all shadow-lg"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // ─── باب الطعون مغلق ────────────────────────────────────
  if (!appealOpen) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8" dir={dir}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Scale className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">باب الطعون مغلق حالياً</h2>
          <p className="text-gray-500 mb-1">فترة تقديم الطعون:</p>
          <p className="text-orange-600 font-bold text-lg">08 — 14 يونيو 2026</p>
        </div>
      </div>
    );
  }

  // ─── النموذج الرئيسي ─────────────────────────────────────
  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-lg bg-gray-50 border ${
      err ? 'border-red-500' : 'border-gray-300'
    } text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8" dir={dir}>

      {/* رأس الصفحة */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        dir={dir}
      >
        <ArrowLeft className="w-4 h-4" />
        العودة للأقسام
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            نموذج تقديم الطعن
          </h2>
          <p className="text-sm text-gray-600 mt-1" dir="rtl">{department.name}</p>
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-medium whitespace-nowrap">
          المدة المتبقية لتقديم الطعن: 8 أيام
        </span>
      </div>

      {/* تنبيه */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6" dir="rtl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-700 text-sm font-medium">
              الطعن لا يُقدَّم إلا مرة واحدة لكل مترشح
            </p>
            <p className="text-orange-600 text-xs mt-1">
              يجب تقديم الطعن عبر البريد الإلكتروني الرسمي للقسم مع كامل الوثائق الداعمة خلال الأيام السبعة المحددة.
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. البيانات الشخصية ── */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">
          البيانات الشخصية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="firstName" value={form.firstName}
              onChange={handleChange} placeholder="الاسم الشخصي (بدون أرقام)"
              dir="rtl" className={inputCls(errors.firstName)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              اللقب <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="lastName" value={form.lastName}
              onChange={handleChange} placeholder="اللقب العائلي (بدون أرقام)"
              dir="rtl" className={inputCls(errors.lastName)}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              رقم التسجيل <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="registrationNumber" value={form.registrationNumber}
              onChange={handleChange} placeholder="أدخل رقم التسجيل (أرقام فقط)"
              dir="rtl" className={inputCls(errors.registrationNumber)}
            />
            {errors.registrationNumber && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.registrationNumber}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@email.com"
              dir="ltr" className={inputCls(errors.email)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange} placeholder="05XXXXXXXX"
              dir="ltr" maxLength={10} className={inputCls(errors.phone)}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.phone}</p>
            )}
          </div>

        </div>
      </div>

      {/* ── 2. التخصص المطعون فيه ── */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">
          التخصص المطعون فيه
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              التخصص الذي رُفض طلبك فيه <span className="text-red-500">*</span>
            </label>
            <select
              name="desiredSpecialization" value={form.desiredSpecialization}
              onChange={handleChange} dir="rtl"
              className={inputCls(errors.desiredSpecialization)}
            >
              <option value="">-- اختر التخصص الذي رُفض طلبك فيه --</option>
              {department.specializations.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.desiredSpecialization && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.desiredSpecialization}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. سبب الطعن ── */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">
          سبب الطعن
        </h3>
        <div className="space-y-6">

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              سبب الرفض (كما هو مذكور في القرار) <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="rejectionReason" value={form.rejectionReason}
              onChange={handleChange}
              placeholder="اشرح سبب الرفض (خطأ في المعدل، وثيقة مرفوضة بشكل غير مبرر...)"
              dir="rtl" className={inputCls(errors.rejectionReason)}
            />
            {errors.rejectionReason && (
              <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.rejectionReason}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              مبررات الطعن <span className="text-red-500">*</span>
            </label>
            <textarea
              name="appealReason" value={form.appealReason}
              onChange={handleChange} rows={5} dir="rtl"
              placeholder="اشرح بالتفصيل أسباب اعتراضك على النتيجة وما يدعم طعنك..."
              className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                errors.appealReason ? 'border-red-500' : 'border-gray-300'
              } text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.appealReason
                ? <p className="text-red-500 text-sm" dir="rtl">{errors.appealReason}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{form.appealReason.length} حرف</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. وثيقة داعمة (اختياري) ── */}
      <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-gray-800" dir="rtl">
          وثيقة داعمة{' '}
          <span className="text-gray-400 font-normal text-base">(اختياري)</span>
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" dir="rtl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 text-sm">
              أرسل كشف النقاط أو أي وثيقة داعمة (PDF) عبر البريد الإلكتروني الرسمي للقسم:{' '}
              <strong>{department.email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── زر الإرسال ── */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full md:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting
          ? <><Loader2 className="w-5 h-5 animate-spin" />جارٍ الإرسال...</>
          : `إرسال الطعن إلى ${department.email}`
        }
      </button>

    </div>
  );
}
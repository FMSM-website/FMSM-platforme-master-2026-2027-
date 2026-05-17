// ============================================================
// ApplicationForm.tsx — نسخة محدثة مع التحققات المنطقية الكاملة
// ============================================================

import { useState, useEffect } from 'react';
import { Upload, Check, X, AlertCircle, GripVertical, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Department } from './DepartmentSelection';
import { toast } from 'sonner';
import { pushToFirebase } from './firebaseConfig';
import { checkDuplicateApplication } from './ApplicationService';
import { useLanguage } from '../i18n/LanguageContext';

type CandidateCategory = 'new-ouargla' | 'previous-ouargla' | 'new-external' | 'previous-external' | 'classic';

interface NewStudentFormData {
  fullName: string;
  registrationNumber: string;
  bacNumber: string;
  email: string;
  phone: string;
  preferences: string[];
}

interface OtherCategoryFormData {
  registrationNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  bacYear: string;
  email: string;
  phone: string;
  licenseUniversity: string;
  licenseSpecialization: string;
  semester1: string;
  semester2: string;
  semester3: string;
  semester4: string;
  semester5: string;
  semester6: string;
  year1: string;
  year2: string;
  year3: string;
  year4: string;
  year5: string;
  department: string;
  desiredMaster: string;
}

interface FormErrors {
  [key: string]: string;
}

const getCategories = (t: (key: string) => string) => [
  {
    id: 'new-ouargla' as const,
    title: t('newOuarglaStudents'),
    subtitle: t('categorySubtitles.newOuargla'),
    badge: t('categoryBadge80'),
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    id: 'previous-ouargla' as const,
    title: t('previousOuarglaStudents'),
    subtitle: t('categorySubtitles.previousOuargla'),
    badge: '',
    badgeColor: '',
  },
  {
    id: 'new-external' as const,
    title: t('newExternalStudents'),
    subtitle: t('categorySubtitles.newExternal'),
    badge: '',
    badgeColor: '',
  },
  {
    id: 'previous-external' as const,
    title: t('previousExternalStudents'),
    subtitle: t('categorySubtitles.previousExternal'),
    badge: '',
    badgeColor: '',
  },
  {
    id: 'classic' as const,
    title: t('classicSystem'),
    subtitle: t('categorySubtitles.classic'),
    badge: '',
    badgeColor: '',
  },
];

interface ApplicationFormProps {
  department: Department;
  onBack: () => void;
}

const emptyOtherForm: OtherCategoryFormData = {
  registrationNumber: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  birthPlace: '',
  bacYear: '',
  email: '',
  phone: '',
  licenseUniversity: '',
  licenseSpecialization: '',
  semester1: '',
  semester2: '',
  semester3: '',
  semester4: '',
  semester5: '',
  semester6: '',
  year1: '',
  year2: '',
  year3: '',
  year4: '',
  year5: '',
  department: '',
  desiredMaster: '',
};

// ─── دوال التحقق من الصحة (Validation Functions) ───────────
// ملاحظة: هذه الدوال داخل المكوّن للوصول لدالة t()
// سيتم نقلها داخل ApplicationForm

export default function ApplicationForm({ department, onBack }: ApplicationFormProps) {
  const { t, dir } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CandidateCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);   // ① نافذة التأكيد
  const [showEditBanner, setShowEditBanner]   = useState(false);     // ② شريط التعديل 24 ساعة
  const [submittedAt, setSubmittedAt]         = useState<string|null>(null);
  const [confirmText, setConfirmText]         = useState('');        // نص تأكيد الطالب

  // ─── دوال التحقق من الصحة (Validation Functions) ───────────
  const validateName = (name: string): string => {
    if (!name.trim()) return t('fieldRequired');
    if (/\d/.test(name)) return t('nameNoNumbers');
    if (name.trim().length < 3) return t('nameTooShort');
    return '';
  };

  const validateNumber = (value: string, fieldName: string): string => {
    if (!value.trim()) return t('fieldRequired');
    if (!/^\d+$/.test(value)) return t('numbersOnly');
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('fieldRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('invalidEmail');
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return t('fieldRequired');
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) return t('invalidPhone');
    return '';
  };

  const validateGrade = (grade: string, fieldName: string): string => {
    if (!grade.trim()) return t('fieldRequired');
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum)) return t('gradesMustBeNumbers');
    if (gradeNum < 0 || gradeNum > 20) return t('gradeBetween0And20');
    return '';
  };

  const validateYear = (year: string): string => {
    if (!year.trim()) return t('fieldRequired');
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return t('yearMustBeNumber');
    const currentYear = new Date().getFullYear();
    if (yearNum < 1990 || yearNum > currentYear) return `${t('yearBetween')} ${currentYear}`;
    return '';
  };

  // ── مفاتيح الحفظ المؤقت ─────────────────────────────────────
  const DRAFT_KEY     = `draft_${department.id}`;
  const SUBMITTED_KEY = `submitted_${department.id}`;

  // ── حفظ مؤقت تلقائي كلما تغيّرت البيانات ──────────────────
  const saveDraft = (newForm?: any, newOther?: any, cat?: CandidateCategory | null) => {
    const draft = {
      category:      cat ?? selectedCategory,
      newStudentForm: newForm ?? newStudentForm,
      otherCategoryForm: newOther ?? otherCategoryForm,
      savedAt: new Date().toISOString(),
    };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  // ── تحميل المسودة والتحقق من التقديم السابق عند الفتح ──────
  // (useEffect يأتي بعد تعريف الحالات — ستُضاف بعد إعلانات useState)


  const [newStudentForm, setNewStudentForm] = useState<NewStudentFormData>({
    fullName: '',
    registrationNumber: '',
    bacNumber: '',
    email: '',
    phone: '',
    preferences: [],
  });

  const [otherCategoryForm, setOtherCategoryForm] = useState<OtherCategoryFormData>(emptyOtherForm);

  const [files, setFiles] = useState<{
    bacTranscript?: File;
    licenseDocument?: File;
    transcripts?: File;
  }>({});

  // ── تحميل المسودة عند أول فتح للصفحة ──────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // تحقق من تقديم سابق → شريط التعديل
    try {
      const prev = localStorage.getItem(SUBMITTED_KEY);
      if (prev) {
        const { at } = JSON.parse(prev);
        const hours = (Date.now() - new Date(at).getTime()) / 36e5;
        if (hours < 24) { setSubmittedAt(at); setShowEditBanner(true); }
        else { localStorage.removeItem(SUBMITTED_KEY); }
      }
    } catch {}
    // تحميل المسودة
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.category)          setSelectedCategory(draft.category);
      if (draft.newStudentForm)    setNewStudentForm(draft.newStudentForm);
      if (draft.otherCategoryForm) setOtherCategoryForm(draft.otherCategoryForm);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── حفظ تلقائي كلما تغيّرت البيانات ────────────────────────
  useEffect(() => {
    if (!selectedCategory) return;
    saveDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newStudentForm, otherCategoryForm, selectedCategory]);


  const isClassic = selectedCategory === 'classic';

  // ── handleSubmit يُظهر نافذة التأكيد أولاً ─────────────────
  const requestSubmit = async () => {
    let isValid = false;
    if (selectedCategory === 'new-ouargla') isValid = validateNewStudentForm();
    else isValid = validateOtherCategoryForm();
    if (!isValid) {
      toast.error(t('correctFormErrors'), { description: t('ensureAllFieldsCorrect'), duration: 5000 });
      return;
    }
    setConfirmText('');
    setShowConfirmModal(true);
  };

  // ─── التحقق من حقل واحد ───────────────────────────────────
  const validateField = (name: string, value: string, formType: 'new' | 'other'): string => {
    if (formType === 'new') {
      switch (name) {
        case 'fullName':
          return validateName(value);
        case 'registrationNumber':
          return validateNumber(value, 'رقم التسجيل');
        case 'bacNumber':
          return validateNumber(value, 'رقم البكالوريا');
        case 'email':
          return validateEmail(value);
        case 'phone':
          return validatePhone(value);
        default:
          return '';
      }
    } else {
      // للفئات الأخرى
      switch (name) {
        case 'firstName':
        case 'lastName':
          return validateName(value);
        case 'registrationNumber':
          return validateNumber(value, 'رقم التسجيل');
        case 'email':
          return validateEmail(value);
        case 'phone':
          return validatePhone(value);
        case 'bacYear':
          return validateYear(value);
        case 'semester1':
        case 'semester2':
        case 'semester3':
        case 'semester4':
        case 'semester5':
        case 'semester6':
          return validateGrade(value, name);
        case 'year1':
        case 'year2':
        case 'year3':
        case 'year4':
        case 'year5':
          return validateGrade(value, name);
        case 'birthDate':
        case 'birthPlace':
        case 'licenseUniversity':
        case 'licenseSpecialization':
        case 'desiredMaster':
          if (!value.trim()) return 'هذا الحقل إجباري';
          return '';
        default:
          return '';
      }
    }
  };

  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // تطبيق القواعد حسب نوع الحقل
    let filteredValue = value;
    if (name === 'fullName') {
      // السماح فقط بالحروف والمسافات
      filteredValue = value.replace(/[0-9]/g, '');
    } else if (name === 'registrationNumber' || name === 'bacNumber') {
      // السماح فقط بالأرقام
      filteredValue = value.replace(/\D/g, '');
    } else if (name === 'phone') {
      // السماح فقط بالأرقام
      filteredValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setNewStudentForm((prev) => ({ ...prev, [name]: filteredValue }));

    // التحقق من الحقل
    const error = validateField(name, filteredValue, 'new');
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleOtherCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // تطبيق القواعد حسب نوع الحقل
    let filteredValue = value;
    if (name === 'firstName' || name === 'lastName' || name === 'birthPlace' || name === 'licenseUniversity' || name === 'licenseSpecialization') {
      // السماح فقط بالحروف والمسافات
      filteredValue = value.replace(/[0-9]/g, '');
    } else if (name === 'registrationNumber' || name === 'bacYear') {
      // السماح فقط بالأرقام
      filteredValue = value.replace(/\D/g, '');
    } else if (name === 'phone') {
      // السماح فقط بالأرقام وحد أقصى 10
      filteredValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name.startsWith('semester') || name.startsWith('year')) {
      // للمعدلات: أرقام ونقطة عشرية فقط
      filteredValue = value.replace(/[^\d.]/g, '');
      // منع أكثر من نقطة عشرية واحدة
      const parts = filteredValue.split('.');
      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('');
      }
      // منع القيم أكبر من 20
      if (parseFloat(filteredValue) > 20) {
        filteredValue = '20';
      }
    }

    setOtherCategoryForm((prev) => ({ ...prev, [name]: filteredValue }));

    // التحقق من الحقل
    const error = validateField(name, filteredValue, 'other');
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const addPreference = (master: string) => {
    if (!newStudentForm.preferences.includes(master)) {
      setNewStudentForm((prev) => ({
        ...prev,
        preferences: [...prev.preferences, master],
      }));
    }
  };

  const removePreference = (master: string) => {
    setNewStudentForm((prev) => ({
      ...prev,
      preferences: prev.preferences.filter((p) => p !== master),
    }));
  };

  const movePreference = (index: number, direction: 'up' | 'down') => {
    const newPreferences = [...newStudentForm.preferences];
    if (direction === 'up' && index > 0) {
      [newPreferences[index], newPreferences[index - 1]] = [newPreferences[index - 1], newPreferences[index]];
    } else if (direction === 'down' && index < newPreferences.length - 1) {
      [newPreferences[index], newPreferences[index + 1]] = [newPreferences[index + 1], newPreferences[index]];
    }
    setNewStudentForm((prev) => ({ ...prev, preferences: newPreferences }));
  };

  // تحويل الملف إلى Base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = (type: 'bacTranscript' | 'licenseDocument' | 'transcripts', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const maxSizes = {
        bacTranscript: 1024 * 1024,
        licenseDocument: 500 * 1024,
        transcripts: 1.5 * 1024 * 1024,
      };
      if (file.size <= maxSizes[type]) {
        setFiles((prev) => ({ ...prev, [type]: file }));
        setErrors((prev) => ({ ...prev, [type]: '' }));
      } else {
        setErrors((prev) => ({ ...prev, [type]: 'حجم الملف يتجاوز الحد المسموح' }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [type]: 'يجب أن يكون الملف بصيغة PDF' }));
    }
  };

  const removeFile = (type: 'bacTranscript' | 'licenseDocument' | 'transcripts') => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[type];
      return newFiles;
    });
  };

  const getCategoryLabel = (cat: CandidateCategory) => {
    const categories = getCategories(t);
    return categories.find((c) => c.id === cat)?.title ?? cat;
  };

  // ─── التحقق من النموذج كاملاً قبل الإرسال ────────────────
  const validateNewStudentForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.fullName = validateField('fullName', newStudentForm.fullName, 'new');
    newErrors.registrationNumber = validateField('registrationNumber', newStudentForm.registrationNumber, 'new');
    newErrors.bacNumber = validateField('bacNumber', newStudentForm.bacNumber, 'new');
    newErrors.email = validateField('email', newStudentForm.email, 'new');
    newErrors.phone = validateField('phone', newStudentForm.phone, 'new');

    if (newStudentForm.preferences.length === 0) {
      newErrors.preferences = 'يجب اختيار تخصص واحد على الأقل';
    }

    setErrors(newErrors);

    // التحقق من عدم وجود أخطاء
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const validateOtherCategoryForm = (): boolean => {
    const newErrors: FormErrors = {};

    // الحقول الإجبارية
    newErrors.registrationNumber = validateField('registrationNumber', otherCategoryForm.registrationNumber, 'other');
    newErrors.firstName = validateField('firstName', otherCategoryForm.firstName, 'other');
    newErrors.lastName = validateField('lastName', otherCategoryForm.lastName, 'other');
    newErrors.birthDate = validateField('birthDate', otherCategoryForm.birthDate, 'other');
    newErrors.birthPlace = validateField('birthPlace', otherCategoryForm.birthPlace, 'other');
    newErrors.bacYear = validateField('bacYear', otherCategoryForm.bacYear, 'other');
    newErrors.email = validateField('email', otherCategoryForm.email, 'other');
    newErrors.phone = validateField('phone', otherCategoryForm.phone, 'other');
    newErrors.licenseUniversity = validateField('licenseUniversity', otherCategoryForm.licenseUniversity, 'other');
    newErrors.licenseSpecialization = validateField('licenseSpecialization', otherCategoryForm.licenseSpecialization, 'other');
    newErrors.desiredMaster = validateField('desiredMaster', otherCategoryForm.desiredMaster, 'other');

    // التحقق من المعدلات
    if (isClassic) {
      for (let i = 1; i <= 5; i++) {
        const yearKey = `year${i}` as keyof OtherCategoryFormData;
        newErrors[yearKey] = validateField(yearKey, otherCategoryForm[yearKey] as string, 'other');
      }
    } else {
      for (let i = 1; i <= 6; i++) {
        const semesterKey = `semester${i}` as keyof OtherCategoryFormData;
        newErrors[semesterKey] = validateField(semesterKey, otherCategoryForm[semesterKey] as string, 'other');
      }
    }

    // التحقق من الملفات
    if (!files.bacTranscript) newErrors.bacTranscript = 'كشف نقاط الباكالوريا مطلوب';
    if (!files.licenseDocument) newErrors.licenseDocument = 'شهادة الليسانس مطلوبة';
    if (!files.transcripts) newErrors.transcripts = 'كشوف نقاط الليسانس مطلوبة';

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== '');
  };

  // ─── دالة الإرسال المحدَّثة (تُستدعى بعد تأكيد الطالب) ───
  const handleSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {

      // ── فحص التكرار ──────────────────────────────────────────
      const regNumber = selectedCategory === 'new-ouargla'
        ? newStudentForm.registrationNumber
        : otherCategoryForm.registrationNumber;

      const bacNum = selectedCategory === 'new-ouargla'
        ? newStudentForm.bacNumber
        : undefined; // الفئات الأخرى لا تدخل رقم الباكالوريا

      const duplicateCheck = await checkDuplicateApplication(
        department.id,
        regNumber,
        bacNum
      );

      if (duplicateCheck.isDuplicate) {
        const fieldLabel = duplicateCheck.field === 'bacNumber'
          ? t('bacNumber')
          : t('registrationNumber');

        toast.error(`⚠️ ${t('duplicateApplication')}`, {
          description: `${t('alreadyApplied')} ${fieldLabel} ${t('noMultipleApplications')}`,
          duration: 8000,
          style: {
            background: '#FFF3E0',
            border: '2px solid #E65100',
            color: '#B71C1C',
            fontWeight: 'bold',
            direction: dir,
          },
        });
        setIsSubmitting(false);
        return;
      }
      // ─────────────────────────────────────────────────────────
      const applicationData: any = {
        department: department.name,
        departmentId: department.id,
        category: selectedCategory ? getCategoryLabel(selectedCategory) : '',
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      if (selectedCategory === 'new-ouargla') {
        applicationData.fullName = newStudentForm.fullName;
        applicationData.registrationNumber = newStudentForm.registrationNumber;
        applicationData.bacNumber = newStudentForm.bacNumber;
        applicationData.email = newStudentForm.email;
        applicationData.phone = newStudentForm.phone;
        applicationData.preferences = newStudentForm.preferences;
      } else {
        applicationData.registrationNumber = otherCategoryForm.registrationNumber;
        applicationData.firstName = otherCategoryForm.firstName;
        applicationData.lastName = otherCategoryForm.lastName;
        applicationData.birthDate = otherCategoryForm.birthDate;
        applicationData.birthPlace = otherCategoryForm.birthPlace;
        applicationData.bacYear = otherCategoryForm.bacYear;
        applicationData.email = otherCategoryForm.email;
        applicationData.phone = otherCategoryForm.phone;
        applicationData.licenseUniversity = otherCategoryForm.licenseUniversity;
        applicationData.licenseSpecialization = otherCategoryForm.licenseSpecialization;
        applicationData.desiredMaster = otherCategoryForm.desiredMaster;

        // تحويل الملفات إلى Base64 لحفظها والسماح بتحميلها لاحقاً
        const [bacB64, licB64, trB64] = await Promise.all([
          files.bacTranscript  ? toBase64(files.bacTranscript)  : Promise.resolve(null),
          files.licenseDocument ? toBase64(files.licenseDocument) : Promise.resolve(null),
          files.transcripts    ? toBase64(files.transcripts)    : Promise.resolve(null),
        ]);
        applicationData.uploadedFiles = {
          bacTranscript:  bacB64  ? { name: files.bacTranscript!.name,  data: bacB64  } : null,
          licenseDocument: licB64 ? { name: files.licenseDocument!.name, data: licB64 } : null,
          transcripts:    trB64  ? { name: files.transcripts!.name,    data: trB64   } : null,
        };

        if (isClassic) {
          applicationData.years = {
            year1: otherCategoryForm.year1,
            year2: otherCategoryForm.year2,
            year3: otherCategoryForm.year3,
            year4: otherCategoryForm.year4,
            year5: otherCategoryForm.year5,
          };
        } else {
          applicationData.semesters = {
            semester1: otherCategoryForm.semester1,
            semester2: otherCategoryForm.semester2,
            semester3: otherCategoryForm.semester3,
            semester4: otherCategoryForm.semester4,
            semester5: otherCategoryForm.semester5,
            semester6: otherCategoryForm.semester6,
          };
        }
      }

      // حفظ في Firebase
      const firebaseId = await pushToFirebase(`applications/${department.id}`, applicationData);

      // ① مسح المسودة ② حفظ وقت التقديم لشريط التعديل
      clearDraft();
      const now = new Date().toISOString();
      try { localStorage.setItem(SUBMITTED_KEY, JSON.stringify({ at: now })); } catch {}
      setSubmittedAt(now);
      setShowEditBanner(true);

      toast.success(
        <div className="flex items-start gap-3" dir={dir}>
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-green-800">{t('applicationReceived')}</p>
            <p className="text-sm text-green-700 mt-1">
              {t('savedInPlatform')} {department.name}
            </p>
            <p className="text-xs text-green-600 mt-2">
              {t('willBeReviewed')}
            </p>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: '#f0fdf4',
            border: '1px solid #86efac',
          },
        }
      );

      // إعادة تعيين النموذج
      if (selectedCategory === 'new-ouargla') {
        setNewStudentForm({
          fullName: '',
          registrationNumber: '',
          bacNumber: '',
          email: '',
          phone: '',
          preferences: []
        });
      } else {
        setOtherCategoryForm(emptyOtherForm);
        setFiles({});
      }
      setErrors({});

      setTimeout(() => {
        onBack();
      }, 3000);

    } catch (error) {
      console.error('خطأ في العملية:', error);
      toast.error(t('submissionError'), {
        description: t('checkInternetAndRetry'),
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableMasters = department.specializations.map((spec) => spec.name);

  // ─── عرض اختيار الفئة ────────────────────────────────────
  if (!selectedCategory) {
    const categories = getCategories(t);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          dir={dir}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDepartments')}
        </button>

        <h2 className="mb-2 text-2xl font-semibold text-gray-800" dir={dir}>{t('selectCandidateCategory')}</h2>
        <p className="text-gray-600 mb-6 text-sm" dir={dir}>
          {t('selectAppropriateCategory')} {department.name}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              dir={dir}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-800 group-hover:text-green-600 transition-colors font-medium">
                  {category.title}
                </h3>
                {category.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${category.badgeColor}`}>
                    {category.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{category.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── النماذج ──────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

      {/* ══ نافذة تأكيد الإرسال ══════════════════════════════════ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
            {/* رأس النافذة */}
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-white font-bold text-lg">تأكيد إرسال الطلب</h3>
                <p className="text-amber-100 text-sm">يرجى القراءة بعناية قبل المتابعة</p>
              </div>
            </div>
            {/* محتوى النافذة */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                <p className="text-red-800 font-bold text-sm flex items-center gap-2">
                  <span>🚫</span> تحذير هام
                </p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>لكل مترشح <strong>محاولة واحدة فقط</strong> في هذا القسم</li>
                  <li>بعد الإرسال <strong>لن تتمكن من التقديم مجدداً</strong> برقم تسجيلك</li>
                  <li>يمكنك التعديل خلال <strong>24 ساعة فقط</strong> من وقت التقديم</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-sm font-medium mb-3">
                  للتأكيد، اكتب <strong className="text-blue-900">"أوافق"</strong> في الحقل أدناه:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="اكتب: أوافق"
                  className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:border-blue-600 transition-colors"
                  dir="rtl"
                />
              </div>
            </div>
            {/* أزرار النافذة */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={confirmText.trim() !== 'أوافق'}
                className="flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: confirmText.trim() === 'أوافق' ? '#1A6B3C' : '#9CA3AF' }}
              >
                ✅ إرسال الطلب نهائياً
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ↩ العودة للمراجعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ شريط التعديل (24 ساعة بعد التقديم) ══════════════════ */}
      {showEditBanner && submittedAt && (() => {
        const hoursLeft = Math.max(0, 24 - (Date.now() - new Date(submittedAt).getTime()) / 36e5);
        const minutesLeft = Math.round(hoursLeft * 60);
        const timeStr = hoursLeft >= 1
          ? `${Math.floor(hoursLeft)} ساعة و ${Math.round((hoursLeft % 1) * 60)} دقيقة`
          : `${minutesLeft} دقيقة`;
        return (
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl px-5 py-4 flex items-start gap-3" dir="rtl">
            <span className="text-2xl mt-0.5">✏️</span>
            <div className="flex-1">
              <p className="text-blue-800 font-bold text-sm">متبقي على انتهاء فترة التعديل: {timeStr}</p>
              <p className="text-blue-600 text-xs mt-1">
                يمكنك تعديل طلبك الآن. بعد انتهاء المدة يصبح الطلب نهائياً ولا يمكن تغييره.
              </p>
            </div>
            <button
              onClick={() => setShowEditBanner(false)}
              className="text-blue-400 hover:text-blue-700 text-xl font-bold leading-none mt-0.5"
            >×</button>
          </div>
        );
      })()}

      {/* ══ شريط المسودة المحفوظة ════════════════════════════════ */}
      {(() => {
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (!raw) return null;
          const { savedAt } = JSON.parse(raw);
          if (!savedAt) return null;
          const mins = Math.round((Date.now() - new Date(savedAt).getTime()) / 60000);
          if (mins > 60 * 24) return null; // أقدم من يوم → لا تعرضه
          return (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3" dir="rtl">
              <span className="text-lg">💾</span>
              <p className="text-green-700 text-sm flex-1">
                تم استعادة مسودتك المحفوظة منذ {mins < 2 ? 'لحظات' : `${mins} دقيقة`}
              </p>
              <button
                onClick={() => { clearDraft(); setNewStudentForm({ fullName:'', registrationNumber:'', bacNumber:'', email:'', phone:'', preferences:[] }); setOtherCategoryForm(emptyOtherForm); setSelectedCategory(null); }}
                className="text-xs text-green-600 underline hover:text-green-800"
              >
                مسح المسودة
              </button>
            </div>
          );
        } catch { return null; }
      })()}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedCategory === 'new-ouargla' ? 'نموذج الترشح - طلبة ورقلة الجدد' : 'نموذج الترشح'}
          </h2>
          <p className="text-sm text-gray-600 mt-1" dir="rtl">{department.name}</p>
        </div>
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-gray-600 hover:text-gray-800 text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
        >
          تغيير الفئة
        </button>
      </div>

      {selectedCategory === 'new-ouargla' ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6" dir="rtl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 text-sm">
                  للطلبة الجدد: يرجى ملء جميع الحقول المطلوبة
                </p>
                <p className="text-green-600 text-xs mt-1">اختر التخصصات ورتبها حسب أولويتك</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">الاسم واللقب <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={newStudentForm.fullName}
                onChange={handleNewStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                placeholder="أدخل الاسم واللقب (بدون أرقام)"
                dir="rtl"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">رقم التسجيل <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="registrationNumber"
                value={newStudentForm.registrationNumber}
                onChange={handleNewStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                placeholder="أدخل رقم التسجيل (أرقام فقط)"
                dir="rtl"
              />
              {errors.registrationNumber && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.registrationNumber}</p>}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">رقم البكالوريا <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="bacNumber"
                value={newStudentForm.bacNumber}
                onChange={handleNewStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.bacNumber ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                placeholder="أدخل رقم البكالوريا (أرقام فقط)"
                dir="rtl"
              />
              {errors.bacNumber && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.bacNumber}</p>}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">البريد الإلكتروني <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={newStudentForm.email}
                onChange={handleNewStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                placeholder="example@email.com"
                dir="ltr"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">رقم الهاتف <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={newStudentForm.phone}
                onChange={handleNewStudentChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                placeholder="05XXXXXXXX"
                dir="ltr"
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.phone}</p>}
            </div>
          </div>

          {/* اختيار التخصصات وترتيبها */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">
              ترتيب التخصصات حسب الأولوية <span className="text-red-500">*</span>
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4" dir="rtl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">
                  اختر التخصصات التي ترغب بالانضمام إليها ورتبها حسب أولويتك. التخصص الأول له الأولوية الأعلى.
                </p>
              </div>
            </div>

            {/* التخصصات المتاحة */}
            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2" dir="rtl">التخصصات المتاحة:</p>
              <div className="flex flex-wrap gap-2">
                {availableMasters
                  .filter((master) => !newStudentForm.preferences.includes(master))
                  .map((master) => (
                    <button
                      key={master}
                      onClick={() => addPreference(master)}
                      className="px-4 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg border border-gray-300 hover:border-green-400 transition-all text-sm"
                      dir="rtl"
                    >
                      + {master}
                    </button>
                  ))}
              </div>
            </div>

            {/* التخصصات المختارة مع الترتيب */}
            {newStudentForm.preferences.length > 0 && (
              <div>
                <p className="text-gray-700 font-medium mb-2" dir="rtl">ترتيبك الحالي:</p>
                <div className="space-y-2">
                  {newStudentForm.preferences.map((pref, index) => (
                    <div
                      key={pref}
                      className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3"
                      dir="rtl"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-800 font-medium">{pref}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePreference(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-green-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="تحريك لأعلى"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePreference(index, 'down')}
                          disabled={index === newStudentForm.preferences.length - 1}
                          className="p-1 hover:bg-green-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="تحريك لأسفل"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removePreference(pref)}
                          className="p-1 hover:bg-red-100 rounded transition-all"
                          title="إزالة"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.preferences && <p className="text-red-500 text-sm mt-2" dir="rtl">{errors.preferences}</p>}
          </div>

          <button onClick={requestSubmit} disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />جاري الإرسال...</> : `إرسال الطلب إلى ${department.email}`}
          </button>
        </div>
      ) : (
        /* ─── نموذج الفئات الأخرى ─── */
        <div>
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">البيانات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'registrationNumber', label: 'رقم التسجيل', required: true, type: 'text', placeholder: 'أدخل رقم التسجيل (أرقام فقط)' },
                { id: 'firstName', label: 'الاسم', required: true, type: 'text', placeholder: 'الاسم الشخصي (بدون أرقام)' },
                { id: 'lastName', label: 'اللقب', required: true, type: 'text', placeholder: 'اللقب العائلي (بدون أرقام)' },
                { id: 'birthDate', label: 'تاريخ الميلاد', required: true, type: 'date', placeholder: '' },
                { id: 'birthPlace', label: 'مكان الميلاد', required: true, type: 'text', placeholder: 'مكان الميلاد' },
                { id: 'bacYear', label: 'سنة البكالوريا', required: true, type: 'text', placeholder: 'مثال: 2022' },
                { id: 'email', label: 'البريد الإلكتروني', required: true, type: 'email', placeholder: 'example@email.com' },
                { id: 'phone', label: 'رقم الهاتف', required: true, type: 'tel', placeholder: '05XXXXXXXX' },
              ].map(({ id, label, required, type, placeholder }) => (
                <div key={id}>
                  <label className="block mb-2 text-gray-700 font-medium">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input type={type} name={id}
                    value={otherCategoryForm[id as keyof OtherCategoryFormData] as string}
                    onChange={handleOtherCategoryChange} placeholder={placeholder} dir={type === 'email' || type === 'tel' ? 'ltr' : 'rtl'}
                    maxLength={id === 'phone' ? 10 : undefined}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors[id] ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`} />
                  {errors[id] && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors[id]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">البيانات الأكاديمية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-gray-700 font-medium">جامعة شهادة الليسانس <span className="text-red-500">*</span></label>
                <input type="text" name="licenseUniversity" value={otherCategoryForm.licenseUniversity}
                  onChange={handleOtherCategoryChange} placeholder="جامعة قاصدي مرباح - ورقلة" dir="rtl"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.licenseUniversity ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`} />
                {errors.licenseUniversity && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.licenseUniversity}</p>}
              </div>
              <div>
                <label className="block mb-2 text-gray-700 font-medium">تخصص الليسانس <span className="text-red-500">*</span></label>
                <input type="text" name="licenseSpecialization" value={otherCategoryForm.licenseSpecialization}
                  onChange={handleOtherCategoryChange} placeholder="التخصص في الليسانس" dir="rtl"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.licenseSpecialization ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`} />
                {errors.licenseSpecialization && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.licenseSpecialization}</p>}
              </div>
            </div>

            {isClassic ? (
              <>
                <p className="text-gray-700 font-medium mb-4" dir="rtl">معدلات السنوات (النظام الكلاسيكي) - يجب أن تكون بين 0 و 20</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1,2,3,4,5].map((yr) => {
                    const fieldName = `year${yr}`;
                    return (
                      <div key={yr}>
                        <label className="block mb-2 text-gray-700 text-sm font-medium">السنة {yr} <span className="text-red-500">*</span></label>
                        <input type="text" name={fieldName}
                          value={otherCategoryForm[fieldName as keyof OtherCategoryFormData] as string}
                          onChange={handleOtherCategoryChange} placeholder="0.00"
                          className={`w-full px-3 py-2 rounded-lg bg-gray-50 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-center`} />
                        {errors[fieldName] && <p className="text-red-500 text-xs mt-1" dir="rtl">{errors[fieldName]}</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium mb-4" dir="rtl">معدلات السداسيات - يجب أن تكون بين 0 و 20</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[1,2,3,4,5,6].map((sem) => {
                    const fieldName = `semester${sem}`;
                    return (
                      <div key={sem}>
                        <label className="block mb-2 text-gray-700 text-sm font-medium">السداسي {sem} <span className="text-red-500">*</span></label>
                        <input type="text" name={fieldName}
                          value={otherCategoryForm[fieldName as keyof OtherCategoryFormData] as string}
                          onChange={handleOtherCategoryChange} placeholder="0.00"
                          className={`w-full px-3 py-2 rounded-lg bg-gray-50 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-center`} />
                        {errors[fieldName] && <p className="text-red-500 text-xs mt-1" dir="rtl">{errors[fieldName]}</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-800" dir="rtl">اختيار التخصص</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                
              </div>
              <div>
                <label className="block mb-2 text-gray-700 font-medium">التخصص المطلوب <span className="text-red-500">*</span></label>
                <select name="desiredMaster" value={otherCategoryForm.desiredMaster}
                  onChange={handleOtherCategoryChange} dir="rtl"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.desiredMaster ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}>
                  <option value="">-- اختر التخصص --</option>
                  {availableMasters.map((master) => (
                    <option key={master} value={master}>{master}</option>
                  ))}
                </select>
                {errors.desiredMaster && <p className="text-red-500 text-sm mt-1" dir="rtl">{errors.desiredMaster}</p>}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4" dir="rtl">
              <h3 className="text-lg font-semibold text-gray-800">تحميل الوثائق المطلوبة</h3>
              <span className="text-red-500">*</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6" dir="rtl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-orange-700 text-sm">
                  PDF فقط | كشف الباكالوريا 1 ميجا | شهادة الليسانس 500 ك.ب | كشوف النقاط 1.5 ميجا
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                { type: 'bacTranscript' as const, label: 'كشف نقاط الباكالوريا', size: '1 ميجا' },
                { type: 'licenseDocument' as const, label: 'شهادة الليسانس', size: '500 ك.ب' },
                { type: 'transcripts' as const, label: 'كشوف نقاط سنوات الليسانس', size: '1.5 ميجا' },
              ]).map(({ type, label, size }) => (
                <div key={type} className={`bg-gray-50 p-4 rounded-xl border-2 ${errors[type] ? 'border-red-500' : 'border-gray-200'} hover:border-blue-300 transition-colors`}>
                  {!files[type] ? (
                    <>
                      <label className="cursor-pointer block">
                        <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(type, e)} className="hidden" />
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Upload className="w-8 h-8 mb-2 text-blue-500" />
                          <span className="text-sm text-gray-700 font-medium" dir="rtl">{label}</span>
                          <span className="text-xs text-gray-500 mt-1" dir="rtl">حد أقصى: {size}</span>
                          <span className="text-xs text-gray-400 mt-1">PDF فقط</span>
                        </div>
                      </label>
                      {errors[type] && <p className="text-red-500 text-xs mt-2 text-center" dir="rtl">{errors[type]}</p>}
                    </>
                  ) : (
                    <div className="py-2">
                      <div className="flex items-center justify-between mb-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <button onClick={() => removeFile(type)} className="p-1 hover:bg-red-100 rounded">
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{files[type]!.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{(files[type]!.size / 1024).toFixed(1)} ك.ب</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={requestSubmit} disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />جاري الإرسال...</> : `إرسال الطلب إلى ${department.email}`}
          </button>
        </div>
      )}
    </div>
  );
}

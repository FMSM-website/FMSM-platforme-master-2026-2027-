import emailjs from '@emailjs/browser';

// إعدادات EmailJS - ستحتاج لتعديلها بمعلوماتك
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_tbqx83o',     // ← ضع Service ID من EmailJS
  TEMPLATE_ID: 'template_b9pgavp',   // ← ضع Template ID من EmailJS
  PUBLIC_KEY: '0wvZPTBKLl7Afwa8E',     // ← ضع Public Key من EmailJS
};

export interface ApplicationData {
  department: string;
  departmentEmail: string;
  category: string;

  // للطلبة الجدد
  registrationNumber?: string;
  bacNumber?: string;
  preferences?: string[];

  // للفئات الأخرى
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  bacYear?: string;
  email?: string;
  phone?: string;
  licenseUniversity?: string;
  licenseSpecialization?: string;
  semesters?: {
    semester1: string;
    semester2: string;
    semester3: string;
    semester4: string;
    semester5: string;
    semester6: string;
  };
  desiredMaster?: string;

  // الملفات
  files?: {
    bacTranscript?: File;
    licenseDocument?: File;
    transcripts?: File;
  };
}

export const sendApplicationEmail = async (data: ApplicationData): Promise<boolean> => {
  try {
    // تهيئة EmailJS
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

    // تحضير البيانات للإرسال
    const templateParams = {
      to_email: data.departmentEmail,
      department_name: data.department,
      category: data.category,
      registration_number: data.registrationNumber || '',
      bac_number: data.bacNumber || '',
      preferences: data.preferences?.join(', ') || '',
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      birth_date: data.birthDate || '',
      birth_place: data.birthPlace || '',
      bac_year: data.bacYear || '',
      email: data.email || '',
      phone: data.phone || '',
      license_university: data.licenseUniversity || '',
      license_specialization: data.licenseSpecialization || '',
      semester1: data.semesters?.semester1 || '',
      semester2: data.semesters?.semester2 || '',
      semester3: data.semesters?.semester3 || '',
      semester4: data.semesters?.semester4 || '',
      semester5: data.semesters?.semester5 || '',
      semester6: data.semesters?.semester6 || '',
      desired_master: data.desiredMaster || '',
      submission_date: new Date().toLocaleString('ar-DZ'),
    };

    // إرسال الإيميل
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('تم إرسال الإيميل بنجاح:', response);
    return true;
  } catch (error) {
    console.error('فشل إرسال الإيميل:', error);
    return false;
  }
};

// دالة مساعدة لتحويل الملفات إلى Base64 (إذا أردت إرفاق الملفات)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

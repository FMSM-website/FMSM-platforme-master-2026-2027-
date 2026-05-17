import { pushToFirebase, getFromFirebase } from './firebaseConfig';

export interface ApplicationSubmission {
  id?: string;
  department: string;
  departmentId: string;
  category: string;
  submissionDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';

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
  semester1?: string;
  semester2?: string;
  semester3?: string;
  semester4?: string;
  semester5?: string;
  semester6?: string;
  desiredMaster?: string;
}

// حفظ طلب جديد
export const saveApplication = async (data: ApplicationSubmission): Promise<boolean> => {
  try {
    const applicationData = {
      ...data,
      submissionDate: new Date().toISOString(),
      status: 'pending' as const,
    };

    // حفظ في Firebase تحت مسار القسم
    const id = await pushToFirebase(`applications/${data.departmentId}`, applicationData);

    console.log('تم حفظ الطلب بنجاح:', id);
    return true;
  } catch (error) {
    console.error('خطأ في حفظ الطلب:', error);
    return false;
  }
};

// جلب طلبات قسم معين
export const getApplicationsByDepartment = async (departmentId: string): Promise<ApplicationSubmission[]> => {
  try {
    const data = await getFromFirebase(`applications/${departmentId}`);

    if (!data) {
      return [];
    }

    // تحويل الكائن إلى مصفوفة
    return Object.entries(data).map(([id, app]: [string, any]) => ({
      id,
      ...app,
    }));
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    return [];
  }
};

// التحقق من وجود طلب سابق بنفس رقم التسجيل أو رقم الباكالوريا في نفس القسم
export const checkDuplicateApplication = async (
  departmentId: string,
  registrationNumber: string,
  bacNumber?: string
): Promise<{ isDuplicate: boolean; field?: 'registrationNumber' | 'bacNumber' }> => {
  try {
    const applications = await getApplicationsByDepartment(departmentId);
    const regNorm = registrationNumber.trim().toLowerCase();

    for (const app of applications) {
      // فحص رقم التسجيل
      if (app.registrationNumber?.trim().toLowerCase() === regNorm) {
        return { isDuplicate: true, field: 'registrationNumber' };
      }
      // فحص رقم الباكالوريا إذا أُرسل
      if (bacNumber && app.bacNumber?.trim().toLowerCase() === bacNumber.trim().toLowerCase()) {
        return { isDuplicate: true, field: 'bacNumber' };
      }
    }
    return { isDuplicate: false };
  } catch (error) {
    console.error('خطأ في فحص التكرار:', error);
    return { isDuplicate: false }; // في حالة الخطأ نسمح بالمتابعة ولا نوقف الطالب
  }
};

// حساب إحصائيات القسم
export const getDepartmentStats = async (departmentId: string) => {
  const applications = await getApplicationsByDepartment(departmentId);

  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };
};

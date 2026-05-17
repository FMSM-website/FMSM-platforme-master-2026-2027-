import { useState, useEffect } from 'react';
import { LogOut, Save, Plus, Trash2, Edit2, Users, CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';
import { departments, Department, Specialization } from './DepartmentSelection';
import { getAllApplications, updateApplicationStatus, deleteApplication } from './firebaseConfig';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Application {
  id: string;
  department: string;
  departmentId: string;
  category: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';

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
  desiredMaster: string;


  
  [key: string]: any;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { t, dir, language } = useLanguage();
  const [depts, setDepts] = useState<Department[]>(departments);
  const [activeTab, setActiveTab] = useState<'departments' | 'applications'>('applications');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editingSpec, setEditingSpec] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const apps = await getAllApplications();
    setApplications(apps);
  };

  const filteredApplications = selectedDepartment === 'all'
    ? applications
    : applications.filter(app => app.departmentId === selectedDepartment);

  const updateDepartmentEmail = (deptId: string, email: string) => {
    setDepts(depts.map(dept =>
      dept.id === deptId ? { ...dept, email } : dept
    ));
  };

  const updateSpecialization = (deptId: string, specId: string, field: keyof Specialization, value: string | number) => {
    setDepts(depts.map(dept => {
      if (dept.id === deptId) {
        return {
          ...dept,
          specializations: dept.specializations.map(spec =>
            spec.id === specId ? { ...spec, [field]: value } : spec
          )
        };
      }
      return dept;
    }));
  };

  const deleteSpecialization = (deptId: string, specId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التخصص؟')) {
      setDepts(depts.map(dept => {
        if (dept.id === deptId) {
          return {
            ...dept,
            specializations: dept.specializations.filter(spec => spec.id !== specId)
          };
        }
        return dept;
      }));
    }
  };

  const addSpecialization = (deptId: string) => {
    const newSpecId = `spec-${Date.now()}`;
    setDepts(depts.map(dept => {
      if (dept.id === deptId) {
        return {
          ...dept,
          specializations: [
            ...dept.specializations,
            {
              id: newSpecId,
              name: 'تخصص جديد',
              availableSeats: 0,
              applicants: 0
            }
          ]
        };
      }
      return dept;
    }));
    setEditingSpec(newSpecId);
  };

  const handleStatusChange = async (appId: string, status: 'pending' | 'accepted' | 'rejected') => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    await updateApplicationStatus(app.departmentId, appId, status);
    await loadApplications();
  };

  const handleDeleteApplication = async (appId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      const app = applications.find(a => a.id === appId);
      if (!app) return;
      await deleteApplication(app.departmentId, appId);
      await loadApplications();
      if (selectedApplication?.id === appId) {
        setSelectedApplication(null);
      }
    }
  };

  const saveChanges = () => {
    console.log('حفظ التغييرات:', depts);
    const code = `export const departments: Department[] = ${JSON.stringify(depts, null, 2)};`;
    console.log('الكود المحدث:', code);
    alert('تم حفظ التغييرات بنجاح!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />مقبول</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle className="w-3 h-3" />مرفوض</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />قيد المراجعة</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                <h1 className="text-xl font-bold text-gray-800">{t('adminDashboard')}</h1>
                <p className="text-sm text-gray-600">{t('applicationsManagement')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <LanguageSwitcher />
              <button
                onClick={loadApplications}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              >
                {language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                <Save className="w-4 h-4" />
                {t('save')} {language === 'ar' ? 'التغييرات' : 'Changes'}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'applications'
                ? 'bg-white text-green-600 shadow-sm'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            طلبات الترشح ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'departments'
                ? 'bg-white text-green-600 shadow-sm'
                : 'bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            الأقسام والتخصصات
          </button>
        </div>

        {activeTab === 'applications' && (
          <div>
            {/* فلترة حسب القسم */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <label className="block text-gray-700 font-medium mb-2" dir="rtl">فلترة حسب القسم:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                dir="rtl"
              >
                <option value="all">جميع الأقسام ({applications.length})</option>
                {depts.map(dept => {
                  const deptApps = applications.filter(app => app.departmentId === dept.id);
                  return (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({deptApps.length})
                    </option>
                  );
                })}
              </select>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" dir="rtl">لا توجد طلبات مقدمة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* قائمة الطلبات */}
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedApplication?.id === app.id ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800" dir="rtl">
                            {app.fullName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'غير محدد'}
                          </h3>
                          <p className="text-sm text-gray-600" dir="rtl">{app.department}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="text-sm text-gray-500" dir="rtl">
                        <p>الفئة: {app.category}</p>
                        <p>التاريخ: {new Date(app.submittedAt).toLocaleString('ar-DZ')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* تفاصيل الطلب المحدد */}
                {selectedApplication && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-bold text-gray-800" dir="rtl">تفاصيل الطلب</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                          title="قبول"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                          title="رفض"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(selectedApplication.id)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4" dir="rtl">
                      {/* الحالة */}
                      <div className="pb-4 border-b border-gray-200">
                        <label className="text-sm text-gray-600">الحالة:</label>
                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                      </div>

                      {/* البيانات الشخصية */}
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">البيانات الشخصية</h3>
                        <div className="space-y-2 text-sm">
                          {selectedApplication.fullName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">الاسم واللقب:</span>
                              <span className="font-medium">{selectedApplication.fullName}</span>
                            </div>
                          )}
                          {selectedApplication.firstName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">الاسم:</span>
                              <span className="font-medium">{selectedApplication.firstName}</span>
                            </div>
                          )}
                          {selectedApplication.lastName && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">اللقب:</span>
                              <span className="font-medium">{selectedApplication.lastName}</span>
                            </div>
                          )}
                          {selectedApplication.registrationNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">رقم التسجيل:</span>
                              <span className="font-medium">{selectedApplication.registrationNumber}</span>
                            </div>
                          )}
                          {selectedApplication.bacNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">رقم البكالوريا:</span>
                              <span className="font-medium">{selectedApplication.bacNumber}</span>
                            </div>
                          )}
                          {selectedApplication.birthDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">تاريخ الميلاد:</span>
                              <span className="font-medium">{selectedApplication.birthDate}</span>
                            </div>
                          )}
                          {selectedApplication.birthPlace && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">مكان الميلاد:</span>
                              <span className="font-medium">{selectedApplication.birthPlace}</span>
                            </div>
                          )}
                          {selectedApplication.bacYear && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">سنة البكالوريا:</span>
                              <span className="font-medium">{selectedApplication.bacYear}</span>
                            </div>
                          )}
                          {selectedApplication.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">البريد الإلكتروني:</span>
                              <span className="font-medium">{selectedApplication.email}</span>
                            </div>
                          )}
                          {selectedApplication.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">رقم الهاتف:</span>
                              <span className="font-medium">{selectedApplication.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* البيانات الأكاديمية */}
                      {(selectedApplication.licenseUniversity || selectedApplication.licenseSpecialization) && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">البيانات الأكاديمية</h3>
                          <div className="space-y-2 text-sm">
                            {selectedApplication.licenseUniversity && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">جامعة الليسانس:</span>
                                <span className="font-medium">{selectedApplication.licenseUniversity}</span>
                              </div>
                            )}
                            {selectedApplication.licenseSpecialization && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">تخصص الليسانس:</span>
                                <span className="font-medium">{selectedApplication.licenseSpecialization}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* المعدلات - النظام الكلاسيكي */}
                      {selectedApplication.years && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">معدلات السنوات (النظام الكلاسيكي)</h3>
                          <div className="grid grid-cols-5 gap-2 text-sm">
                            {Object.entries(selectedApplication.years).map(([year, grade]) => (
                              <div key={year} className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-gray-600 text-xs mb-1">{year.replace('year', 'السنة ')}</div>
                                <div className="font-bold text-green-700">{grade as string}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* المعدلات - نظام LMD */}
                      {selectedApplication.semesters && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">معدلات السداسيات</h3>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {Object.entries(selectedApplication.semesters).map(([semester, grade]) => (
                              <div key={semester} className="bg-gray-50 p-2 rounded text-center">
                                <div className="text-gray-600 text-xs mb-1">{semester.replace('semester', 'س')}</div>
                                <div className="font-bold text-green-700">{grade as string}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* التخصصات المختارة */}
                      {selectedApplication.preferences && selectedApplication.preferences.length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">التخصصات حسب الأولوية</h3>
                          <div className="space-y-2">
                            {selectedApplication.preferences.map((pref: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-sm">{pref}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* التخصص المطلوب (للفئات الأخرى) */}
                      {selectedApplication.desiredMaster && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">التخصص المطلوب</h3>
                          <div className="bg-green-50 p-3 rounded text-sm font-medium">
                            {selectedApplication.desiredMaster}
                          </div>
                        </div>
                      )}

                      {/* الملفات المرفقة */}
                      {selectedApplication.uploadedFiles && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">الملفات المرفقة</h3>
                          <div className="space-y-2 text-sm">
                            {selectedApplication.uploadedFiles.bacTranscript && (
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span>كشف نقاط الباكالوريا: {selectedApplication.uploadedFiles.bacTranscript}</span>
                              </div>
                            )}
                            {selectedApplication.uploadedFiles.licenseDocument && (
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span>شهادة الليسانس: {selectedApplication.uploadedFiles.licenseDocument}</span>
                              </div>
                            )}
                            {selectedApplication.uploadedFiles.transcripts && (
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span>كشوف النقاط: {selectedApplication.uploadedFiles.transcripts}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* معلومات إضافية */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>القسم:</span>
                          <span className="font-medium">{selectedApplication.department}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>الفئة:</span>
                          <span className="font-medium">{selectedApplication.category}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>تاريخ التقديم:</span>
                          <span className="font-medium">{new Date(selectedApplication.submittedAt).toLocaleString('ar-DZ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-6">
            {depts.map((dept) => (
              <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2" dir="rtl">{dept.name}</h2>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">البريد الإلكتروني:</label>
                      {editingDept === dept.id ? (
                        <input
                          type="email"
                          value={dept.email}
                          onChange={(e) => updateDepartmentEmail(dept.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          onBlur={() => setEditingDept(null)}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-sm text-blue-600 cursor-pointer hover:underline"
                          onClick={() => setEditingDept(dept.id)}
                        >
                          {dept.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addSpecialization(dept.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة تخصص
                  </button>
                </div>

                <div className="space-y-3">
                  {dept.specializations.map((spec) => (
                    <div key={spec.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1" dir="rtl">اسم التخصص</label>
                          {editingSpec === spec.id ? (
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => updateSpecialization(dept.id, spec.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              dir="rtl"
                              onBlur={() => setEditingSpec(null)}
                              autoFocus
                            />
                          ) : (
                            <div
                              className="font-medium text-gray-800 cursor-pointer hover:text-green-600"
                              onClick={() => setEditingSpec(spec.id)}
                            >
                              {spec.name}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 block mb-1" dir="rtl">المقاعد المتاحة</label>
                          <input
                            type="number"
                            value={spec.availableSeats}
                            onChange={(e) => updateSpecialization(dept.id, spec.id, 'availableSeats', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 block mb-1" dir="rtl">عدد المتقدمين</label>
                          <input
                            type="number"
                            value={spec.applicants}
                            onChange={(e) => updateSpecialization(dept.id, spec.id, 'applicants', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            min="0"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSpec(spec.id)}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                          >
                            <Edit2 className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => deleteSpecialization(dept.id, spec.id)}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Users, FileText, Award, Clock } from 'lucide-react';
import { Toaster } from 'sonner';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import ApplicationForm from './components/ApplicationForm';
import Timeline from './components/Timeline';
import DepartmentSelection, { Department, departments } from './components/DepartmentSelection';
import SpecializationStats from './components/SpecializationStats';
import AdminLogin from './components/AdminLogin';
import DepartmentDashboard from './components/DepartmentDashboard';
import AppealForm from './components/AppealForm';
import { authenticateDepartment, DepartmentAdmin } from './components/DepartmentAuth';

// ─── التحقق من أن فترة الطعون نشطة الآن ────────────────────
const APPEAL_START = new Date('2026-06-08T00:00:00');
const APPEAL_END   = new Date('2026-06-14T23:59:59');
function isAppealPeriod(): boolean {
  const now = new Date();
  return now >= APPEAL_START && now <= APPEAL_END;
}

type AppMode = 'public' | 'department-admin' | 'login' | 'appeal';

function AppContent() {
  const { t, dir } = useLanguage();
  const [selectedDepartment, setSelectedDepartment]         = useState<Department | null>(null);
  const [appealDepartment, setAppealDepartment]             = useState<Department | null>(null);
  const [appMode, setAppMode]                               = useState<AppMode>('public');
  const [loggedInAdmin, setLoggedInAdmin]                   = useState<DepartmentAdmin | null>(null);

  const totalSeats = departments.reduce((sum, dept) =>
    sum + dept.specializations.reduce((s, spec) => s + spec.availableSeats, 0), 0
  );
  const totalApplicants = departments.reduce((sum, dept) =>
    sum + dept.specializations.reduce((s, spec) => s + spec.applicants, 0), 0
  );
  const daysRemaining = Math.floor(
    (new Date('2026-06-04').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleLogin = (username: string, password: string): DepartmentAdmin | null => {
    const admin = authenticateDepartment(username, password);
    if (admin) { setLoggedInAdmin(admin); setAppMode('department-admin'); return admin; }
    return null;
  };
  const handleLogout = () => { setLoggedInAdmin(null); setAppMode('public'); };
  const backToHome   = () => { setAppMode('public'); setSelectedDepartment(null); setAppealDepartment(null); };

  // عرض لوحة تسجيل الدخول
  if (appMode === 'login' && !loggedInAdmin)
    return <AdminLogin onLogin={handleLogin} onBack={backToHome} />;

  // عرض لوحة تحكم القسم
  if (appMode === 'department-admin' && loggedInAdmin)
    return <DepartmentDashboard admin={loggedInAdmin} onLogout={handleLogout} />;

  // عرض نموذج الطعن — داخل layout الصفحة الرئيسية
  // if (appMode === 'appeal') → يُعرض أسفل في JSX داخل الصفحة

  // ─── الصفحة الرئيسية ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50" dir={dir}>
      <Toaster position="top-center" richColors />
      <Header onAdminClick={() => setAppMode('login')} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title={t('totalApplicants')}      value={totalApplicants.toString()} icon={Users}    gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
          <StatsCard title={t('applicationsSubmitted')} value={totalApplicants.toString()} icon={FileText}  gradient="bg-gradient-to-br from-orange-500 to-amber-600" />
          <StatsCard title={t('availableSeats')}        value={totalSeats.toString()}       icon={Award}    gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
          <StatsCard title={t('daysRemaining')}         value={daysRemaining > 0 ? daysRemaining.toString() : '0'} icon={Clock} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
        </div>

        {/* ── بانر فترة الطعون (يظهر فقط خلال 17–24 مايو) ── */}
        {isAppealPeriod() && !selectedDepartment && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" dir={dir}>
            <div>
              <p className="text-orange-800 font-semibold text-base mb-1">🟠 فترة الطعون مفتوحة حتى 24 مايو 2026</p>
              <p className="text-orange-600 text-sm">إذا رُفض طلبك يمكنك تقديم طعن رسمي الآن</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => { setAppealDepartment(dept); setAppMode('appeal'); }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all whitespace-nowrap shadow-sm"
                >
                  طعن — {dept.name.replace('قسم ', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* اختيار القسم أو نموذج التقديم أو نموذج الطعن */}
        {appMode === 'appeal' && appealDepartment ? (
          <div className="mb-8">
            <AppealForm department={appealDepartment} onBack={backToHome} />
          </div>
        ) : !selectedDepartment ? (
          <div className="mb-8">
            <DepartmentSelection onSelectDepartment={setSelectedDepartment} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ApplicationForm
                department={selectedDepartment}
                onBack={() => setSelectedDepartment(null)}
              />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <SpecializationStats specializations={selectedDepartment.specializations} />
              <Timeline />

              {/* زر الطعن داخل صفحة التقديم أيضاً */}
              {isAppealPeriod() && (
                <button
                  onClick={() => { setAppealDepartment(selectedDepartment); setAppMode('appeal'); }}
                  className="w-full py-3 border-2 border-orange-400 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                >
                  تقديم طعن على نتائج هذا القسم ←
                </button>
              )}
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-600 text-sm pb-8">
          <p>{t('copyright')}</p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
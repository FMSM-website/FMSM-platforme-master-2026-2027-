import { useState } from 'react';
import { User, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import { DepartmentAdmin } from './DepartmentAuth';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => DepartmentAdmin | null;
  onBack?: () => void;
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const { t, dir, language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const admin = onLogin(username, password);

    if (admin) {
      setError('');
    } else {
      setError(language === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center p-4" dir={dir}>
      <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}>
        <LanguageSwitcher />
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all shadow-sm border border-gray-200`}
        >
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
        </button>
      )}

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'ar' ? 'دخول رؤساء الأقسام' : 'Department Head Login'}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'تسجيل الدخول لرئيس القسم' : 'Login for department heads'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium text-gray-700 mb-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-4 py-3 ${dir === 'rtl' ? 'pl-12' : 'pr-12'} rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                  placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                  dir="ltr"
                  required
                />
                <User className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 ${dir === 'rtl' ? 'pl-12' : 'pr-12'} rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${dir === 'rtl' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {t('login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              {language === 'ar' ? 'مخصص للمسؤولين فقط' : 'For administrators only'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

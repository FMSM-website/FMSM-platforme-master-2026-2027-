import { Bell } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onAdminClick?: () => void;
}

export default function Header({ onAdminClick }: HeaderProps) {
  const { t, dir } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`} dir={dir}>
            {/* شعار جامعة ورقلة */}
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqhezCgQdjq6JY9jqlYL28sLhUvh7pg99Yeg&s"
              alt={dir === 'rtl' ? 'شعار جامعة ورقلة' : 'Ouargla University Logo'}
              className="w-16 h-16 object-contain rounded-xl shadow-md"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Ccircle cx="32" cy="32" r="30" fill="%2310b981"/%3E%3Ctext x="32" y="40" font-size="24" text-anchor="middle" fill="white" font-weight="bold"%3Eكرق%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
              <h1 className="text-gray-800 text-xl font-bold">{t('universityName')}</h1>
              <p className="text-green-600 text-sm font-medium">{t('facultyName')}</p>
              <p className="text-gray-600 text-xs">{t('platformTitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-200"
              >
                {t('administration')}
              </button>
            )}
            <button className="p-3 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-all relative">
              <Bell className="w-5 h-5 text-orange-500" />
              <span className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} w-2 h-2 bg-orange-500 rounded-full animate-pulse`}></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

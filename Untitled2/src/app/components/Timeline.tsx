import { Calendar, FileCheck, Scale, Award } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface TimelineItem {
  id: number;
  titleKey: string;
  dateKey: string;
  descriptionKey: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ElementType;
}

function computeStatus(start: Date, end?: Date): 'completed' | 'current' | 'upcoming' {
  const now = new Date();
  if (end && now > end) return 'completed';
  if (now >= start && (!end || now <= end)) return 'current';
  return 'upcoming';
}

export default function Timeline() {
  const { t, dir } = useLanguage();

  const timelineData: TimelineItem[] = [
    {
      id: 1,
      titleKey: 'registrationOpens',
      dateKey: 'registrationOpensDate',
      descriptionKey: 'registrationOpensDesc',
      status: computeStatus(new Date('2026-05-19'), new Date('2026-06-04T23:59:59')),
      icon: Calendar,
    },
    {
      id: 2,
      titleKey: 'registrationCloses',
      dateKey: 'registrationClosesDate',
      descriptionKey: 'registrationClosesDesc',
      status: computeStatus(new Date('2026-06-05'), new Date('2026-06-07T23:59:59')),
      icon: FileCheck,
    },
    {
      id: 3,
      // ⚠️ لتغيير تواريخ الطعون → غيّر هذين التاريخين فقط
      titleKey: 'initialResultsAndAppeals',
      dateKey: 'initialResultsAndAppealsDate',
      descriptionKey: 'initialResultsAndAppealsDesc',
      status: computeStatus(new Date('2026-06-08'), new Date('2026-06-14T23:59:59')),
      icon: Scale,
    },
    {
      id: 4,
      titleKey: 'finalResults',
      dateKey: 'finalResultsDate',
      descriptionKey: 'finalResultsDesc',
      status: computeStatus(new Date('2026-06-15')),
      icon: Award,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="mb-6 text-lg font-semibold text-gray-800" dir={dir}>{t('timelineTitle')}</h2>

      <div className="relative">
        <div className={`absolute ${dir === 'rtl' ? 'right-[1.75rem]' : 'left-[1.75rem]'} top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-orange-500 to-transparent`}
             style={{ direction: 'ltr' }}></div>

        <div className="space-y-8" dir={dir}>
          {timelineData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative flex gap-6 items-start">
                <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                  item.status === 'completed'
                    ? 'bg-green-100 border-green-500 shadow-lg shadow-green-500/20'
                    : item.status === 'current'
                    ? 'bg-orange-100 border-orange-500 shadow-lg shadow-orange-500/20 animate-pulse'
                    : 'bg-gray-100 border-gray-300'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    item.status === 'completed'
                      ? 'text-green-600'
                      : item.status === 'current'
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  }`} />
                </div>

                <div className="flex-1 pb-8">
                  <div className={`bg-gray-50 p-3 rounded-lg border transition-all ${
                    item.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : item.status === 'current'
                      ? 'border-orange-200 bg-orange-50 shadow-md'
                      : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-medium ${
                        item.status === 'completed'
                          ? 'text-green-700'
                          : item.status === 'current'
                          ? 'text-orange-700'
                          : 'text-gray-600'
                      }`}>
                        {t(item.titleKey)}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'current'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {t(item.dateKey)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{t(item.descriptionKey)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
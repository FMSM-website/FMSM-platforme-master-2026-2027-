// ============================================================
// DepartmentSelection.tsx — اختيار القسم
// ============================================================

import { useState } from 'react';
import { BookOpen, FlaskConical, Calculator, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface Specialization {
  name: string;
  availableSeats: number;
  applicants: number;
}

export interface Department {
  id: string;
  name: string;
  email: string;
  icon: string;
  description: string;
  specializations: Specialization[];
}

// ─── بيانات الأقسام — عدّليها حسب جامعتك ────────────────
export const departments: Department[] = [
  {
    id: 'math',
    name: 'قسم الرياضيات',
    email: 'brahimtel@yahoo.fr',
    icon: 'calculator',
    description: 'قسم الرياضيات وتطبيقاتها',
    specializations: [
      { name: 'التحليل الدالي', availableSeats: 30, applicants: 0 },
      { name: 'الاحتمالات والإحصاء', availableSeats: 30, applicants: 0 },
      { name: 'النمذجة والتحليل العددي', availableSeats: 30, applicants: 0 },
    ],
  },
  {
    id: 'physics',
    name: 'قسم الفيزياء',
    email: 'physics@univ-ouargla.dz',
    icon: 'flask',
    description: 'قسم الفيزياء والفيزياء التطبيقية',
    specializations: [
      { name: 'فيزياء المواد', availableSeats: 25, applicants: 0 },
      { name: 'الفيزياء الطبية', availableSeats: 20, applicants: 0 },
      { name: 'فيزياء نظرية', availableSeats: 25, applicants: 0 },
      { name: 'فيزياء الطاقات والطاقات المتجددة', availableSeats: 30, applicants: 0 },
      { name: 'فيزياء الجوية', availableSeats: 25, applicants: 0 },
      { name: 'فيزياء كهروضوئية -مهني-', availableSeats: 25, applicants: 0 },
      { name: 'فيزياء اشعاعية', availableSeats: 30, applicants: 0 },
    ],
  },
  {
    id: 'chemistry',
    name: 'قسم الكيمياء',
    email: 'chemistry@univ-ouargla.dz',
    icon: 'book',
    description: 'قسم الكيمياء والكيمياء التطبيقية',
    specializations: [
      { name: 'كيمياء عضوية', availableSeats: 40, applicants: 0 },
      { name: 'كيمياء المواد', availableSeats: 40, applicants: 0 },
      { name: 'كيمياء تحليلية', availableSeats: 80, applicants: 0 },
      { name: 'كيمياء صيدلانية', availableSeats: 40, applicants: 0 },
      { name: 'كيمياء البيئة والمياه', availableSeats: 40, applicants: 0 },
      { name: 'كيمياء المنتجات الطبيعية', availableSeats: 40, applicants: 0 },
    ],
  },
];

// ─── أيقونة القسم ─────────────────────────────────────────
function DeptIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === 'calculator') return <Calculator className={className} />;
  if (icon === 'flask') return <FlaskConical className={className} />;
  return <BookOpen className={className} />;
}

// ─── Props ────────────────────────────────────────────────
interface DepartmentSelectionProps {
  onSelectDepartment: (department: Department) => void;
}

// ─── المكوّن الرئيسي ──────────────────────────────────────
export default function DepartmentSelection({ onSelectDepartment }: DepartmentSelectionProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { t, dir } = useLanguage();

  return (
    <div>
      <div className="text-center mb-8" dir={dir}>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('selectYourDepartment')}</h2>
        <p className="text-gray-500">{t('chooseFromAvailableDepartments')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const totalSeats = dept.specializations.reduce((s, sp) => s + sp.availableSeats, 0);
          const isHovered = hovered === dept.id;

          return (
            <button
              key={dept.id}
              onClick={() => onSelectDepartment(dept)}
              onMouseEnter={() => setHovered(dept.id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                bg-white rounded-2xl border-2 p-6 transition-all duration-200 shadow-sm
                ${isHovered
                  ? 'border-green-400 shadow-lg shadow-green-100 -translate-y-1'
                  : 'border-gray-200 hover:border-green-300'}
                ${dir === 'rtl' ? 'text-right' : 'text-left'}
              `}
              dir={dir}
            >
              {/* أيقونة */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
                ${isHovered ? 'bg-green-500' : 'bg-green-100'}
              `}>
                <DeptIcon
                  icon={dept.icon}
                  className={`w-7 h-7 ${isHovered ? 'text-white' : 'text-green-600'}`}
                />
              </div>

              {/* الاسم والوصف */}
              <h3 className={`text-lg font-bold mb-1 transition-colors ${isHovered ? 'text-green-700' : 'text-gray-800'}`}>
                {dept.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{dept.description}</p>

              {/* التخصصات */}
              <div className="space-y-1 mb-4">
                {dept.specializations.map((spec) => (
                  <div key={spec.name} className="flex items-center justify-between text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[70%]">
                      {spec.name}
                    </span>
                    <span className="text-gray-400">{spec.availableSeats} {t('seat')}</span>
                  </div>
                ))}
              </div>

              {/* إجمالي المقاعد */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{t('totalSeats')} {totalSeats}</span>
                <ChevronLeft className={`w-4 h-4 transition-colors ${isHovered ? 'text-green-500' : 'text-gray-300'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

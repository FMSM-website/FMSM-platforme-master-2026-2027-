import { Users, Award, TrendingUp } from 'lucide-react';
import { Specialization } from './DepartmentSelection';

interface SpecializationStatsProps {
  specializations: Specialization[];
}

export default function SpecializationStats({ specializations }: SpecializationStatsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2" dir="rtl">
        <TrendingUp className="w-5 h-5 text-green-600" />
        إحصائيات التخصصات
      </h3>

      <div className="space-y-3">
        {specializations.map((spec) => {
          const fillPercentage = (spec.applicants / spec.availableSeats) * 100;
          const isOversubscribed = spec.applicants > spec.availableSeats;

          return (
            <div key={spec.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2" dir="rtl">
                <h4 className="font-medium text-gray-800">{spec.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isOversubscribed
                    ? 'bg-red-100 text-red-700'
                    : fillPercentage > 80
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {fillPercentage.toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <div className="text-right flex-1">
                    <p className="text-xs text-gray-500">المقاعد</p>
                    <p className="text-sm font-semibold text-gray-800">{spec.availableSeats}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <div className="text-right flex-1">
                    <p className="text-xs text-gray-500">المتقدمين</p>
                    <p className="text-sm font-semibold text-gray-800">{spec.applicants}</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOversubscribed
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                />
              </div>

              {isOversubscribed && (
                <p className="text-xs text-red-600 mt-2 text-right" dir="rtl">
                  تجاوز عدد المتقدمين المقاعد المتاحة
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

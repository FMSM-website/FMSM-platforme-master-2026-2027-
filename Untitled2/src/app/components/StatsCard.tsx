import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
}

export default function StatsCard({ title, value, icon: Icon, gradient }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1" dir="rtl">
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-gray-800 text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

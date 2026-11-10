import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`card-premium p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        <div className={`p-2 rounded-xl shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-xs text-slate-500 font-medium">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}

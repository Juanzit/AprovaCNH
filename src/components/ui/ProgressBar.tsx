import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({
  current,
  total,
  label = 'Progresso da lição',
  showPercent = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full space-y-1.5">
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${current} de ${total} (${percentage}%)`}
        className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5 shadow-2xs"
      >
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercent && (
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
          <span>{current} de {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: 'primary' | 'teal' | 'amber' | 'emerald' | 'blue' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
    text?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary',
  trend,
  onClick,
  className = ''
}) => {
  const iconColorMap = {
    primary: 'bg-red-50 text-primary border-red-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-surface rounded-2xl border border-appBorder p-5 shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-red-200 hover:shadow-card active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-subText uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-mainText tracking-tight">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-subText font-normal">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.text && <span className="text-subText text-[11px]">{trend.text}</span>}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm ${iconColorMap[iconColor]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

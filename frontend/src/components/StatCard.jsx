import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'brand',
  trend,
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      iconBg: 'bg-rose-500',
      border: 'border-rose-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      iconBg: 'bg-amber-500',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-blue-500',
      border: 'border-blue-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-500',
      border: 'border-indigo-100',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`p-6 bg-white rounded-2xl border ${scheme.border} shadow-card hover:shadow-card-hover transition-all duration-300 flex items-center justify-between`}>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value ?? 0}</h3>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className={`w-14 h-14 rounded-2xl ${scheme.iconBg} text-white flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
        {Icon && <Icon className="w-7 h-7" />}
      </div>
    </div>
  );
};

export default StatCard;

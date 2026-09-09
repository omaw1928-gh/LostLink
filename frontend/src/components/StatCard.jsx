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
      bg: 'bg-[#53FF73]',
      text: 'text-[#121212]',
      iconBg: 'bg-[#121212] text-[#53FF73]',
      border: 'border-[#121212]',
    },
    rose: {
      bg: 'bg-[#FFD1DC]',
      text: 'text-[#121212]',
      iconBg: 'bg-[#121212] text-[#FFD1DC]',
      border: 'border-[#121212]',
    },
    amber: {
      bg: 'bg-[#F1FF54]',
      text: 'text-[#121212]',
      iconBg: 'bg-[#121212] text-[#F1FF54]',
      border: 'border-[#121212]',
    },
    blue: {
      bg: 'bg-[#EFE3FF]',
      text: 'text-[#334FB4]',
      iconBg: 'bg-[#334FB4] text-white',
      border: 'border-[#121212]',
    },
    indigo: {
      bg: 'bg-[#EFE3FF]',
      text: 'text-[#121212]',
      iconBg: 'bg-[#121212] text-[#EFE3FF]',
      border: 'border-[#121212]',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div className={`p-6 bg-white rounded-2xl border-2 ${scheme.border} shadow-card hover:shadow-card-hover transition-all duration-300 flex items-center justify-between`}>
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#334FB4]">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-3xl font-bold text-[#121212] tracking-tight">{value ?? 0}</h3>
          {trend && (
            <span className="text-[10px] font-bold text-[#121212] bg-[#53FF73] px-2 py-0.5 rounded-full uppercase tracking-wider">
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-[#121212]/60 font-medium">{subtitle}</p>}
      </div>

      <div className={`w-13 h-13 rounded-2xl ${scheme.iconBg} flex items-center justify-center shadow-md shrink-0 border border-[#121212]`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
};

export default StatCard;


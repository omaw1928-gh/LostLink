import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, PlusCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No items found',
  description = 'Try adjusting your search criteria or filters, or be the first to report.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all hover:scale-105"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

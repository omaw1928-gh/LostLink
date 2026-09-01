import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowUpRight, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const ItemCard = ({ item }) => {
  if (!item) return null;

  const isLost = item.type === 'lost';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'claimed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Claimed
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'active':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Active
          </span>
        );
    }
  };

  // Default placeholder image based on category
  const defaultImage =
    item.image ||
    'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={defaultImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
              isLost
                ? 'bg-rose-500/95 text-white'
                : 'bg-emerald-600/95 text-white'
            }`}
          >
            {item.type}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/70 text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Status Badge Top Right */}
        <div className="absolute top-3 right-3">{getStatusBadge(item.status)}</div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{item.date}</span>
            </div>
            {item.time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{item.time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
              {item.reportedBy?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs text-slate-600 truncate max-w-[110px]">
              {item.reportedBy?.name || 'Anonymous'}
            </span>
          </div>

          <Link
            to={`/item/${item._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

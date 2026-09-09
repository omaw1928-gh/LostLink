import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowUpRight, CheckCircle } from 'lucide-react';

const ItemCard = ({ item }) => {
  if (!item) return null;

  const isLost = item.type === 'lost';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'claimed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1FF54] text-[#121212] border border-[#121212]">
            <Clock className="w-3 h-3" />
            Claimed
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#53FF73] text-[#121212] border border-[#121212]">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'active':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFE3FF] text-[#334FB4] border border-[#334FB4]/30">
            Active
          </span>
        );
    }
  };

  // Default placeholder image
  const defaultImage =
    item.image ||
    'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border-2 border-[#121212] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FFFBE3]">
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/40 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-[#121212] ${
              isLost
                ? 'bg-[#FFD1DC] text-[#121212]'
                : 'bg-[#53FF73] text-[#121212]'
            }`}
          >
            {item.type}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#121212] text-[#FFFBE3]">
            {item.category}
          </span>
        </div>

        {/* Status Badge Top Right */}
        <div className="absolute top-3 right-3">{getStatusBadge(item.status)}</div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-base text-[#121212] group-hover:text-[#334FB4] transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-[#121212]/70 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-1.5 pt-2 border-t border-[#E5E0D8] text-xs text-[#121212]">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#334FB4] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-[#121212]/60 text-[11px]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#334FB4]" />
              <span>{item.date}</span>
            </div>
            {item.time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#334FB4]" />
                <span>{item.time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#EFE3FF] text-[#334FB4] flex items-center justify-center font-bold text-[10px] border border-[#334FB4]/20">
              {item.reportedBy?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs text-[#121212]/80 font-medium truncate max-w-[110px]">
              {item.reportedBy?.name || 'Anonymous'}
            </span>
          </div>

          <Link
            to={`/item/${item._id}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#121212] text-[#FFFBE3] hover:bg-[#334FB4] transition-colors shadow-sm"
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


import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#121212] text-[#FFFBE3] pt-16 pb-12 border-t-4 border-[#334FB4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#262626]">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#53FF73] flex items-center justify-center text-[#121212] shadow-sm">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <span className="font-display font-bold text-2xl text-[#FFFBE3] tracking-tight">
                Lost<span className="text-[#334FB4]">Link</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#E5E0D8]/80 font-normal">
              Smart Campus Lost & Found System. Made for student communities to quickly report, verify, and return lost belongings.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#121212] bg-[#53FF73] px-3 py-1.5 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#121212] animate-pulse" />
              100% Campus Network Verified
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#334FB4]">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-[#53FF73] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-[#53FF73] transition-colors">Browse Lost & Found</Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-[#FFD1DC] transition-colors">Report Lost Item</Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-[#53FF73] transition-colors">Report Found Item</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#53FF73] transition-colors">Student Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#334FB4]">
              Popular Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['Electronics', 'ID Card', 'Wallet', 'Keys', 'Books', 'Clothing', 'Accessories', 'Documents'].map((cat) => (
                <Link
                  key={cat}
                  to={`/browse?category=${encodeURIComponent(cat)}`}
                  className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#262626] hover:bg-[#334FB4] text-[#FFFBE3] transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Campus Support */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#334FB4]">
              Campus Desk & Help
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-[#E5E0D8]/90">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#53FF73] shrink-0" />
                <span>Central Safety Desk, Student Center 102</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#53FF73] shrink-0" />
                <span>Helpline: (555) 019-2831</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#53FF73] shrink-0" />
                <span>lostfound@campus.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E5E0D8]/60">
          <p>© {new Date().getFullYear()} LostLink Campus Network. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              Made with <Heart className="w-3.5 h-3.5 text-rose-400 inline fill-rose-400" /> for Indian Campuses
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


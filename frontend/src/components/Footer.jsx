import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Lost<span className="text-brand-400">Link</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Smart Campus Lost & Found Management System. Connecting student communities to quickly report, locate, and return lost belongings.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Cloud Connected • Campus Network Active
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-brand-400 transition-colors">Browse Marketplace</Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-brand-400 transition-colors">Report Lost Item</Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-brand-400 transition-colors">Report Found Item</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-400 transition-colors">Student Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Popular Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {['Electronics', 'ID Card', 'Wallet', 'Keys', 'Books', 'Clothing', 'Accessories', 'Documents'].map((cat) => (
                <Link
                  key={cat}
                  to={`/browse?category=${encodeURIComponent(cat)}`}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Campus Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Campus Security & Help</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Central Campus Safety Desk, Student Center 102</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Campus Helpline: (555) 019-2831</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>lostfound@campus.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LostLink Campus Network. Built for students, by students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> & React / Node.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

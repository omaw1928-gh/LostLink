import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  MapPin,
  Clock,
  Laptop,
  CreditCard,
  Wallet,
  Key,
  BookOpen,
  Shirt,
  Glasses,
  FileText
} from 'lucide-react';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes] = await Promise.all([
          getItems({ type: 'lost', limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
          getItems({ type: 'found', limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);

        if (lostRes.success) setRecentLost(lostRes.data);
        if (foundRes.success) setRecentFound(foundRes.data);
      } catch (err) {
        console.error('Error fetching home feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  const categories = [
    { name: 'Electronics', icon: Laptop, count: 'Laptops, Phones, AirPods', color: 'from-blue-500 to-indigo-600' },
    { name: 'ID Card', icon: CreditCard, count: 'Campus IDs, Smart Cards', color: 'from-amber-500 to-orange-600' },
    { name: 'Wallet', icon: Wallet, count: 'Purses, Cards, Cash Pouches', color: 'from-emerald-500 to-teal-600' },
    { name: 'Keys', icon: Key, count: 'Dorm Keys, Bike & Car Keys', color: 'from-rose-500 to-pink-600' },
    { name: 'Books', icon: BookOpen, count: 'Textbooks, Notes, Binders', color: 'from-purple-500 to-violet-600' },
    { name: 'Clothing', icon: Shirt, count: 'Jackets, Hoodies, Hats', color: 'from-cyan-500 to-blue-600' },
    { name: 'Accessories', icon: Glasses, count: 'Watches, Glasses, Bottles', color: 'from-teal-500 to-emerald-600' },
    { name: 'Documents', icon: FileText, count: 'Certificates, Files, Folders', color: 'from-slate-600 to-slate-800' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-md shadow-inner animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Campus-Wide Smart Lost & Found Network</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              Lost something on campus?{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-teal-300 to-emerald-400">
                LostLink helps you find & return it.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Find it. Report it. Return it. An intelligent platform built for students, faculty, and campus security to recover lost belongings with speed and trust.
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report-lost"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/30 hover:shadow-rose-600/40 transition-all hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </Link>
            <Link
              to="/browse?type=found"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl shadow-black/10 transition-all hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <Search className="w-5 h-5 text-brand-600" />
              Browse Found Items
            </Link>
          </div>

          {/* Quick Search Banner */}
          <div className="pt-10 max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.elements.search.value;
                if (q) window.location.href = `/browse?search=${encodeURIComponent(q)}`;
              }}
              className="glass-dark p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search keys, headphones, wallet, ID card, location..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors text-sm shadow-md"
              >
                Search Campus
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl">
          <div className="text-center p-4 border-r border-slate-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-600">95%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Recovery Success</p>
          </div>
          <div className="text-center p-4 md:border-r border-slate-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">&lt; 24h</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Average Return Time</p>
          </div>
          <div className="text-center p-4 border-r border-slate-100">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">100%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Verified Students</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">24/7</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Campus Safety Desk</p>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Guide) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How LostLink Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Recovering your belongings or helping a fellow student takes less than a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold text-xl shadow-inner group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Report in Seconds</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Post details of what you lost or found with campus location, date, category, and photo preview.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-inner group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Match & Claim</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Search by filters or keywords. Submit a claim with proof of ownership or verification details.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xl shadow-inner group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Safely Hand Off</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              The reporter approves the verified claim. Meet at campus security or quiet study rooms to return the item.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Lost Items Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Urgent Lost Items
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Recently Reported Lost
            </h2>
            <p className="text-sm text-slate-500">
              Have you seen any of these items around campus? Help return them!
            </p>
          </div>

          <Link
            to="/browse?type=lost"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700"
          >
            View all lost items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recent reports..." />
        ) : recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLost.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No lost items reported currently.
          </div>
        )}
      </section>

      {/* Recent Found Items Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Found on Campus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Recently Found Belongings
            </h2>
            <p className="text-sm text-slate-500">
              Did you leave something behind? Check if your item is waiting for you.
            </p>
          </div>

          <Link
            to="/browse?type=found"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
          >
            View all found items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recent reports..." />
        ) : recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentFound.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No found items reported currently.
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore by Category
          </h2>
          <p className="text-sm text-slate-500">
            Quickly filter campus belongings by product type.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why LostLink Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-navy-900 text-white space-y-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              Why Campus Chooses LostLink
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed for Campus Privacy, Safety & Speed
            </h2>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Verified Claims</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents fraudulent claims through ownership questions, secret serial verification, and owner approvals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Privacy Protected</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phone numbers and personal emails are kept private until a claim is explicitly accepted by the reporter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Real-Time Sync</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cloud-backed database and instant search across campus buildings, gyms, dorms, and libraries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

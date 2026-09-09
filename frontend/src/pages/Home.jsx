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
    { name: 'Electronics', icon: Laptop, count: 'Laptops, Phones, AirPods', tagBg: 'bg-[#EFE3FF]' },
    { name: 'ID Card', icon: CreditCard, count: 'Campus IDs, Smart Cards', tagBg: 'bg-[#F1FF54]' },
    { name: 'Wallet', icon: Wallet, count: 'Purses, Cards, Cash Pouches', tagBg: 'bg-[#53FF73]' },
    { name: 'Keys', icon: Key, count: 'Dorm Keys, Bike & Car Keys', tagBg: 'bg-[#FFD1DC]' },
    { name: 'Books', icon: BookOpen, count: 'Textbooks, Notes, Binders', tagBg: 'bg-[#EFE3FF]' },
    { name: 'Clothing', icon: Shirt, count: 'Jackets, Hoodies, Hats', tagBg: 'bg-[#F1FF54]' },
    { name: 'Accessories', icon: Glasses, count: 'Watches, Glasses, Bottles', tagBg: 'bg-[#53FF73]' },
    { name: 'Documents', icon: FileText, count: 'Certificates, Files, Folders', tagBg: 'bg-[#FFD1DC]' },
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#FFFBE3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-[#FFFBE3] text-[#121212] border-b border-[#E5E0D8]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE3FF] border border-[#334FB4]/30 text-[#334FB4] text-xs font-bold uppercase tracking-wider shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#334FB4]" />
            <span>Campus-Wide Smart Recovery System</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12] text-[#121212]">
              Lost something on campus?{' '}
              <span className="text-[#334FB4] underline decoration-[#53FF73] decoration-wavy underline-offset-8">
                LostLink helps you find it.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-[#121212]/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Find it. Report it. Verify it. Return it. A verified platform built for Indian campuses to recover lost belongings with speed and trust.
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/report-lost"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[#121212] bg-[#FFD1DC] hover:bg-[#ffb6c6] border-2 border-[#121212] shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[#121212] bg-[#53FF73] hover:bg-[#3eff62] border-2 border-[#121212] shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Link>
            <Link
              to="/browse"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] border-2 border-[#121212] shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider"
            >
              <Search className="w-4 h-4 text-[#53FF73]" />
              Browse All Items
            </Link>
          </div>

          {/* Quick Search Banner */}
          <div className="pt-8 max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.elements.search.value;
                if (q) window.location.href = `/browse?search=${encodeURIComponent(q)}`;
              }}
              className="bg-white p-2 rounded-full border-2 border-[#121212] shadow-xl flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#334FB4] absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search keys, headphones, wallet, campus ID, location..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-[#121212] placeholder-[#121212]/50 text-xs font-semibold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-full font-bold text-[#121212] bg-[#F1FF54] hover:bg-[#ebfe2c] border border-[#121212] transition-colors text-xs uppercase tracking-wider shadow-sm"
              >
                Search Campus
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border-2 border-[#121212] shadow-xl">
          <div className="text-center p-4 border-r border-[#E5E0D8]">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#334FB4]">95%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121212] mt-1">Recovery Rate</p>
          </div>
          <div className="text-center p-4 md:border-r border-[#E5E0D8]">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#121212]">&lt; 24h</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121212] mt-1">Avg Return Time</p>
          </div>
          <div className="text-center p-4 border-r border-[#E5E0D8]">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#121212]">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#334FB4] mt-1">Campus Verified</p>
          </div>
          <div className="text-center p-4">
            <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#334FB4]">24/7</p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#121212] mt-1">Active Desk</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#334FB4] bg-[#EFE3FF] px-4 py-1.5 rounded-full border border-[#334FB4]/20">
            Simple 3-Step Process
          </span>
          <h2 className="font-display text-3xl font-extrabold text-[#121212] tracking-tight">
            How LostLink Works
          </h2>
          <p className="text-xs sm:text-sm text-[#121212]/70 font-medium">
            Recovering your belongings or helping a fellow student takes less than a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl bg-white border-2 border-[#121212] shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFD1DC] text-[#121212] border border-[#121212] flex items-center justify-center font-display font-extrabold text-lg shadow-sm">
              01
            </div>
            <h3 className="font-display text-lg font-bold text-[#121212]">Report in Seconds</h3>
            <p className="text-xs text-[#121212]/70 leading-relaxed font-medium">
              Post details of what you lost or found with campus location, date, category, and photo preview.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl bg-white border-2 border-[#121212] shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE3FF] text-[#334FB4] border border-[#121212] flex items-center justify-center font-display font-extrabold text-lg shadow-sm">
              02
            </div>
            <h3 className="font-display text-lg font-bold text-[#121212]">Match & Claim</h3>
            <p className="text-xs text-[#121212]/70 leading-relaxed font-medium">
              Search by filters or keywords. Submit a claim with proof of ownership or verification details.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl bg-white border-2 border-[#121212] shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#53FF73] text-[#121212] border border-[#121212] flex items-center justify-center font-display font-extrabold text-lg shadow-sm">
              03
            </div>
            <h3 className="font-display text-lg font-bold text-[#121212]">Safely Hand Off</h3>
            <p className="text-xs text-[#121212]/70 leading-relaxed font-medium">
              The reporter approves the verified claim. Meet at campus security desk or library to return the item.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Lost Items Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#FFD1DC] px-3 py-1 rounded-full border border-[#121212]">
              Urgent Lost Items
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121212] mt-2 tracking-tight">
              Recently Reported Lost
            </h2>
            <p className="text-xs text-[#121212]/60 font-medium">
              Have you seen any of these items around campus? Help return them!
            </p>
          </div>

          <Link
            to="/browse?type=lost"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#334FB4] hover:underline"
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
          <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#121212] text-[#121212]/60 text-xs font-medium">
            No lost items reported currently.
          </div>
        )}
      </section>

      {/* Recent Found Items Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#53FF73] px-3 py-1 rounded-full border border-[#121212]">
              Found on Campus
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#121212] mt-2 tracking-tight">
              Recently Found Belongings
            </h2>
            <p className="text-xs text-[#121212]/60 font-medium">
              Did you leave something behind? Check if your item is waiting for you.
            </p>
          </div>

          <Link
            to="/browse?type=found"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#334FB4] hover:underline"
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
          <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#121212] text-[#121212]/60 text-xs font-medium">
            No found items reported currently.
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-[#121212] tracking-tight">
            Explore by Category
          </h2>
          <p className="text-xs text-[#121212]/60 font-medium">
            Quickly filter campus belongings by product category.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-white border-2 border-[#121212] shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-full ${cat.tagBg} text-[#121212] border border-[#121212] flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-[#121212] text-sm group-hover:text-[#334FB4] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#121212]/60 mt-0.5 truncate font-medium">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why LostLink Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#121212] text-[#FFFBE3] space-y-10 shadow-2xl relative overflow-hidden border-4 border-[#334FB4]">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#53FF73] px-3 py-1 rounded-full">
              Why Campus Chooses LostLink
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Designed for Campus Privacy, Safety & Speed
            </h2>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#262626] border border-[#E5E0D8]/20 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#53FF73] text-[#121212] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#FFFBE3]">Verified Claims</h3>
              <p className="text-xs text-[#E5E0D8]/80 leading-relaxed font-medium">
                Prevents fraudulent claims through ownership verification questions and owner approvals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#262626] border border-[#E5E0D8]/20 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD1DC] text-[#121212] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#FFFBE3]">Privacy Protected</h3>
              <p className="text-xs text-[#E5E0D8]/80 leading-relaxed font-medium">
                Phone numbers and emails remain private until a claim is explicitly accepted by the reporter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#262626] border border-[#E5E0D8]/20 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#F1FF54] text-[#121212] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-[#FFFBE3]">Real-Time Sync</h3>
              <p className="text-xs text-[#E5E0D8]/80 leading-relaxed font-medium">
                Cloud-backed database and instant search across campus buildings, labs, dorms, and libraries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


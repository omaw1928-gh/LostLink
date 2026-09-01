import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { useToast } from '../context/ToastContext';
import ItemForm from '../components/ItemForm';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const ReportItem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const isLostRoute = location.pathname.includes('report-lost');
  const defaultType = isLostRoute ? 'lost' : 'found';

  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await createItem(formData);
      if (res.success) {
        success(res.message || 'Report submitted successfully!');
        navigate(`/item/${res.data._id}`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit report. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Form Banner Header */}
        <div
          className={`p-6 sm:p-8 text-white ${
            defaultType === 'lost'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Campus Incident Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {defaultType === 'lost' ? 'Report a Lost Belonging' : 'Report a Found Belonging'}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            {defaultType === 'lost'
              ? 'Provide clear details and location to help campus students identify and return your item.'
              : 'Help return this found item to its rightful owner by recording the discovery details.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          <ItemForm
            defaultType={defaultType}
            onSubmit={handleFormSubmit}
            isSubmitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportItem;

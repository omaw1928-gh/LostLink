import React, { useState } from 'react';
import { X, Send, AlertCircle, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { createClaim } from '../services/claimService';
import { useToast } from '../context/ToastContext';

const ClaimModal = ({ isOpen, onClose, item, onSuccess }) => {
  const { success, error } = useToast();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const isFound = item.type === 'found';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      error('Please provide a message explaining your claim or verification proof');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createClaim({
        itemId: item._id,
        message: message.trim(),
      });
      if (res.success) {
        success('Claim request submitted to the reporter!');
        setMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isFound ? 'Claim This Belonging' : 'Contact Reporter'}
              </h3>
              <p className="text-xs text-slate-500">Provide proof of ownership or verification details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Item summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=200'}
              alt={item.title}
              className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {item.category} • {item.type}
              </p>
              <h4 className="text-sm font-semibold text-slate-800 truncate">{item.title}</h4>
              <p className="text-xs text-slate-500 truncate">{item.location}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Verification Proof & Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isFound
                  ? 'Describe unique characteristics, passwords, wallpaper, serial tags, or specific contents to verify you are the rightful owner...'
                  : 'Let the person who lost this know where and when you found it, or how you can return it...'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm leading-relaxed"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              The reporter will review your claim details. If approved, their contact info and hand-off details will be shared with you.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;

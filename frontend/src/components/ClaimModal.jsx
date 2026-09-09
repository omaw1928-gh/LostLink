import React, { useState } from 'react';
import { X, Send, AlertCircle, Shield, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-[#121212]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E0D8] bg-[#EFE3FF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#334FB4] text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#121212]">
                {isFound ? 'Claim Belonging' : 'Contact Reporter'}
              </h3>
              <p className="text-xs text-[#121212]/70 font-medium">Provide proof of ownership or details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#121212] hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#FFFBE3]">
          {/* Target Item summary */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#121212] flex items-center gap-3">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=200'}
              alt={item.title}
              className="w-12 h-12 rounded-xl object-cover bg-[#FFFBE3] shrink-0 border border-[#E5E0D8]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#334FB4]">
                {item.category} • {item.type}
              </p>
              <h4 className="font-display text-sm font-bold text-[#121212] truncate">{item.title}</h4>
              <p className="text-xs text-[#121212]/60 truncate">{item.location}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
              Verification Proof & Details <span className="text-rose-600">*</span>
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
              className="w-full px-4 py-3 rounded-2xl border border-[#121212] bg-white focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs leading-relaxed"
            />
          </div>

          <div className="p-3 bg-[#F1FF54]/40 rounded-2xl border border-[#121212]/20 text-xs text-[#121212] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#334FB4] shrink-0 mt-0.5" />
            <p className="font-medium">
              The reporter will review your claim details. If approved, contact info and hand-off details will be shared.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#121212] hover:bg-white transition-colors border border-[#121212]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#121212] hover:bg-[#334FB4] shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#53FF73]" />
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


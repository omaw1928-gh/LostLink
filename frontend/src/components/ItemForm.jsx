import React, { useState, useEffect } from 'react';
import { uploadImage } from '../services/uploadService';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'ID Card',
  'Wallet',
  'Keys',
  'Books',
  'Clothing',
  'Accessories',
  'Documents',
  'Other',
];

const ItemForm = ({
  initialData = null,
  defaultType = 'lost',
  onSubmit,
  isSubmitting = false,
}) => {
  const { error: toastError, info } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: defaultType,
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || defaultType,
        category: initialData.category || 'Electronics',
        location: initialData.location || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        time: initialData.time || '',
        image: initialData.image || '',
      });
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    } else {
      setFormData((prev) => ({ ...prev, type: defaultType }));
    }
  }, [initialData, defaultType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size exceeds 5MB limit');
      return;
    }

    setImageFile(file);
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);

    // Upload to server/Cloudinary
    try {
      setIsUploadingImage(true);
      info('Uploading image to Cloudinary...');
      const targetFolder = formData.type || 'items';
      const res = await uploadImage(file, targetFolder);
      if (res.success && res.data.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        success('Image uploaded to Cloudinary successfully!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Campus location is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.category) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  const isLost = formData.type === 'lost';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Toggle: Lost or Found */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Report Category Type
        </label>
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'lost' }))}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isLost
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'found' }))}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              !isLost
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
            I Found Something
          </button>
        </div>
      </div>

      {/* Item Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Item Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={isLost ? 'e.g. Space Gray MacBook Air M2' : 'e.g. Sony Wireless Headphones in Black Case'}
          className={`w-full px-4 py-3 rounded-xl border ${
            formErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
          } focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm transition-all`}
        />
        {formErrors.title && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
          </p>
        )}
      </div>

      {/* Category & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm appearance-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Campus Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Central Library, 2nd Floor Quiet Zone"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                formErrors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm transition-all`}
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          {formErrors.location && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.location}
            </p>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                formErrors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              } focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm transition-all`}
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
          {formErrors.date && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.date}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Approximate Time <span className="text-slate-400 text-xs font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm transition-all"
            />
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe distinguishing features, stickers, serial details, color, markings, or brand..."
          className={`w-full px-4 py-3 rounded-xl border ${
            formErrors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
          } focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 text-sm leading-relaxed transition-all`}
        />
        {formErrors.description && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.description}
          </p>
        )}
      </div>

      {/* Image Upload with Preview */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Item Image <span className="text-slate-400 text-xs font-normal">(Optional, max 5MB)</span>
        </label>

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-w-sm aspect-[16/10]">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
            {isUploadingImage && (
              <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                <span className="text-xs font-medium">Uploading to Cloud...</span>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 rounded-2xl p-8 cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
              <Upload className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP, or GIF up to 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            isLost
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          } ${(isSubmitting || isUploadingImage) ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Publishing Report...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Report' : `Submit ${isLost ? 'Lost' : 'Found'} Report`}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;

import React, { useState, useEffect } from 'react';
import { uploadImage } from '../services/uploadService';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  X,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Tag,
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
  const { success, error: toastError, info } = useToast();

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size exceeds 5MB limit');
      return;
    }

    setImageFile(file);

    // Pixel-Heist pattern: Instant local FileReader preview and base64 store
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, image: base64 }));

        try {
          setIsUploadingImage(true);
          const targetFolder = formData.type || 'items';
          const res = await uploadImage(file, targetFolder);
          if (res.success && res.data?.url) {
            setFormData((prev) => ({ ...prev, image: res.data.url }));
            if (res.data.url.includes('cloudinary.com')) {
              success('Image uploaded to Cloudinary CDN!');
            }
          }
        } catch (err) {
          console.warn('Cloudinary upload fallback active:', err);
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
    reader.readAsDataURL(file);
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
      {/* Type Toggle */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#334FB4] mb-2">
          Report Category Type
        </label>
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FFFBE3] rounded-full border border-[#121212]">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'lost' }))}
            className={`py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isLost
                ? 'bg-[#FFD1DC] text-[#121212] border border-[#121212]'
                : 'text-[#121212] hover:bg-white'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, type: 'found' }))}
            className={`py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !isLost
                ? 'bg-[#53FF73] text-[#121212] border border-[#121212]'
                : 'text-[#121212] hover:bg-white'
            }`}
          >
            I Found Something
          </button>
        </div>
      </div>

      {/* Item Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
          Item Title <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={isLost ? 'e.g. Space Gray MacBook Air M2' : 'e.g. Sony Wireless Headphones in Black Case'}
          className={`w-full px-4 py-3 rounded-2xl border ${
            formErrors.title ? 'border-rose-500 bg-rose-50' : 'border-[#121212] bg-white'
          } focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs font-medium transition-all`}
        />
        {formErrors.title && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
          </p>
        )}
      </div>

      {/* Category & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
            Category <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-[#121212] bg-white focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs font-medium appearance-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Tag className="w-4 h-4 text-[#334FB4] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
            Campus Location <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Central Library, 2nd Floor"
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
                formErrors.location ? 'border-rose-500 bg-rose-50' : 'border-[#121212] bg-white'
              } focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs font-medium transition-all`}
            />
            <MapPin className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5" />
          </div>
          {formErrors.location && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.location}
            </p>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
            Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${
                formErrors.date ? 'border-rose-500 bg-rose-50' : 'border-[#121212] bg-white'
              } focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs font-medium transition-all`}
            />
            <Calendar className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
          {formErrors.date && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.date}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
            Approximate Time <span className="text-[#121212]/50 text-[10px] font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#121212] bg-white focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs font-medium transition-all"
            />
            <Clock className="w-4 h-4 text-[#334FB4] absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
          Detailed Description <span className="text-rose-600">*</span>
        </label>
        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe distinguishing features, stickers, serial details, color, markings, or brand..."
          className={`w-full px-4 py-3 rounded-2xl border ${
            formErrors.description ? 'border-rose-500 bg-rose-50' : 'border-[#121212] bg-white'
          } focus:ring-2 focus:ring-[#334FB4] outline-none text-[#121212] text-xs leading-relaxed transition-all`}
        />
        {formErrors.description && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.description}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#121212] mb-1.5">
          Item Photo <span className="text-[#121212]/50 text-[10px] font-normal">(Optional, max 5MB)</span>
        </label>

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#121212] bg-[#FFFBE3] max-w-sm aspect-[16/10]">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-1.5 bg-[#121212] text-white rounded-full hover:bg-rose-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
            {isUploadingImage && (
              <div className="absolute inset-0 bg-[#121212]/70 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#53FF73]" />
                <span className="text-xs font-bold">Uploading Photo...</span>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#121212] hover:bg-[#FFFBE3] rounded-2xl p-8 cursor-pointer transition-all bg-white">
            <div className="w-10 h-10 rounded-full bg-[#EFE3FF] text-[#334FB4] flex items-center justify-center mb-2 border border-[#334FB4]">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#121212]">Click to upload or drag & drop</p>
            <p className="text-[10px] text-[#121212]/60 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
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
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="w-full py-3.5 px-6 rounded-full font-bold text-white bg-[#121212] hover:bg-[#334FB4] transition-all duration-200 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider text-xs border border-[#121212] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#53FF73]" />
              <span>Publishing Report...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Report' : `Publish ${isLost ? 'Lost' : 'Found'} Report`}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;


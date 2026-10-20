import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  Star,
  Trash2
} from 'lucide-react';

interface ImageUploadGalleryProps {
  primaryImage: string;
  onChangePrimaryImage: (url: string) => void;
  galleryImages?: string[];
  onChangeGalleryImages?: (urls: string[]) => void;
  label?: string;
  helpText?: string;
}

export const ImageUploadGallery: React.FC<ImageUploadGalleryProps> = ({
  primaryImage,
  onChangePrimaryImage,
  galleryImages = [],
  onChangeGalleryImages,
  label = 'Product Photos & Gallery',
  helpText = 'Upload high-quality product images from your device gallery or enter an image URL.'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper: resize & compress file to optimized base64
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (JPEG, PNG, WEBP).'));
        return;
      }

      // Max file size 8MB
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error('Image size should be less than 8MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize if dimension exceeds 1200px to maintain crisp quality and keep storage small
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Export as JPEG with 0.86 quality
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          resolve(optimizedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file from your device.'));
      reader.readAsDataURL(file);
    });
  };

  // Handle single primary image upload from gallery
  const handlePrimaryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const dataUrl = await processImageFile(file);
      onChangePrimaryImage(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle multiple gallery photos upload from gallery
  const handleGalleryFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processImageFile(file);
        newUrls.push(dataUrl);
      }

      if (onChangeGalleryImages) {
        onChangeGalleryImages([...galleryImages, ...newUrls]);
      } else if (!primaryImage && newUrls.length > 0) {
        onChangePrimaryImage(newUrls[0]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading gallery photos');
    } finally {
      setIsProcessing(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Handle URL addition
  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!primaryImage) {
      onChangePrimaryImage(trimmed);
    } else if (onChangeGalleryImages) {
      onChangeGalleryImages([...galleryImages, trimmed]);
    } else {
      onChangePrimaryImage(trimmed);
    }
    setUrlInput('');
  };

  const handleRemovePrimary = () => {
    if (galleryImages.length > 0) {
      const [first, ...rest] = galleryImages;
      onChangePrimaryImage(first);
      if (onChangeGalleryImages) onChangeGalleryImages(rest);
    } else {
      onChangePrimaryImage('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!onChangeGalleryImages) return;
    const updated = galleryImages.filter((_, i) => i !== index);
    onChangeGalleryImages(updated);
  };

  const handleSetAsPrimary = (index: number) => {
    if (!onChangeGalleryImages) return;
    const targetImage = galleryImages[index];
    const remainingGallery = galleryImages.filter((_, i) => i !== index);
    const newGallery = primaryImage ? [primaryImage, ...remainingGallery] : remainingGallery;
    onChangePrimaryImage(targetImage);
    onChangeGalleryImages(newGallery);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">{label}</label>
          <p className="text-[11px] text-slate-500 mt-0.5">{helpText}</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gallery Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'url'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Web URL
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone / URL Box */}
      {activeTab === 'upload' ? (
        <div className="space-y-3">
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePrimaryFileSelect}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryFilesSelect}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Upload Primary Photo */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-slate-800 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                {primaryImage ? 'Change Main Cover Photo' : 'Upload Main Cover Photo'}
              </span>
              <span className="text-[10px] text-slate-500">
                Pick image from your device / phone gallery
              </span>
            </button>

            {/* Action 2: Add Additional Gallery Photos */}
            {onChangeGalleryImages && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => galleryInputRef.current?.click()}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 text-slate-800 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Add More Gallery Photos
                </span>
                <span className="text-[10px] text-slate-500">
                  Select multiple photos for angles & details
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Direct URL Input */
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image web address (https://...)"
            className="grow px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400 bg-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs disabled:opacity-50 transition-colors"
          >
            Add Image
          </button>
        </div>
      )}

      {/* Visual Previews Row */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold text-slate-600 block">
          Current Product Images:
        </span>

        {primaryImage || galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* Primary Cover Image */}
            {primaryImage && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-100 shadow-xs group">
                <img
                  src={primaryImage}
                  alt="Primary Product Cover"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center space-x-0.5 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-slate-950" />
                  <span>Main Cover</span>
                </span>
                <button
                  type="button"
                  onClick={handleRemovePrimary}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-sm"
                  title="Remove Main Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Gallery Images */}
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs group"
              >
                <img
                  src={imgUrl}
                  alt={`Product angle ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Always-visible top-right delete button for phone & desktop users */}
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-red-600 active:scale-90 transition-all shadow-md z-10"
                  title="Delete Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Make Main Cover Button */}
                <button
                  type="button"
                  onClick={() => handleSetAsPrimary(idx)}
                  className="absolute bottom-2 left-2 right-2 py-1 px-1.5 rounded-lg bg-slate-900/80 hover:bg-amber-400 text-white hover:text-slate-950 font-bold text-[10px] shadow-md transition-all flex items-center justify-center space-x-1 backdrop-blur-xs"
                >
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span>Set as Main</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
            No image uploaded yet. Click &quot;Upload Main Cover Photo&quot; above to select from your device.
          </div>
        )}
      </div>
    </div>
  );
};

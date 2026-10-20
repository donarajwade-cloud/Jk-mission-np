import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import {
  ShoppingBag,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Pencil,
  Save,
  X,
  ArrowLeft,
  Store,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Search,
  Check,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ImageUploadGallery } from '../../components/common/ImageUploadGallery.tsx';

interface ShopkeeperProductsProps {
  initialCreateMode?: boolean;
}

export const ShopkeeperProducts: React.FC<ShopkeeperProductsProps> = ({ initialCreateMode = false }) => {
  const { user, shop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>(initialCreateMode ? 'create' : 'list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for Create & Edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Organic & Food');
  const [costPriceNpr, setCostPriceNpr] = useState('');
  const [proposedSellingPriceNpr, setProposedSellingPriceNpr] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Currently editing product reference
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = [
    'Organic & Food',
    'Snacks & Organic',
    'Spices & Seasonings',
    'Tea & Coffee',
    'Apparel & Handicrafts',
    'Daily Essentials',
    'Health & Wellness',
    'Beverages'
  ];

  const loadProducts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getMySubmissions();
      if (res.success && res.products) setProducts(res.products);
    } catch (err: any) {
      console.warn('Failed to load shopkeeper submissions:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const openCreatePage = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('Organic & Food');
    setCostPriceNpr('');
    setProposedSellingPriceNpr('');
    setStockQuantity('20');
    setSku('');
    setImageUrl('');
    setGalleryImages([]);
    setError(null);
    setViewMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditPage = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category);
    setCostPriceNpr(String(p.costPriceNpr));
    setProposedSellingPriceNpr(String(p.proposedSellingPriceNpr || p.finalSellingPriceNpr));
    setStockQuantity(String(p.stockQuantity));
    setSku(p.sku || '');
    setImageUrl(p.imageUrl || '');
    setGalleryImages(p.galleryImages || []);
    setError(null);
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateSku = () => {
    const cleanShop = (shop?.name || 'JKM').substring(0, 3).toUpperCase();
    const cleanCat = category.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`${cleanShop}-${cleanCat}-${rand}`);
  };

  // Submit product creation or update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cost = Number(costPriceNpr);
    const proposed = Number(proposedSellingPriceNpr);
    const stock = Number(stockQuantity);

    if (isNaN(cost) || cost <= 0) {
      setError('Please enter a valid cost price in NPR.');
      return;
    }
    if (isNaN(proposed) || proposed <= 0) {
      setError('Please enter a valid proposed selling price in NPR.');
      return;
    }
    if (proposed < cost) {
      setError('Proposed selling price cannot be lower than cost price.');
      return;
    }

    const primaryImg = imageUrl.trim() || (galleryImages.length > 0 ? galleryImages[0] : '');
    if (!primaryImg) {
      setError('Please upload at least one main product photo from your device gallery.');
      return;
    }

    setSubmitting(true);

    try {
      if (viewMode === 'edit' && editingProduct) {
        // Update existing product
        const res = await api.updateProduct(editingProduct.id, {
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          costPriceNpr: cost,
          proposedSellingPriceNpr: proposed,
          finalSellingPriceNpr:
            editingProduct.status === 'approved'
              ? editingProduct.finalSellingPriceNpr || proposed
              : proposed,
          stockQuantity: Math.max(0, stock),
          sku: sku.trim() || undefined,
          imageUrl: primaryImg,
          galleryImages
        });

        if (res.success) {
          setSuccess(`Product "${name}" and gallery photos updated successfully!`);
          setViewMode('list');
          await loadProducts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setSuccess(null), 4000);
        }
      } else {
        // Create new product
        const res = await api.submitProduct({
          name: name.trim(),
          description: description.trim(),
          category,
          costPriceNpr: cost,
          proposedSellingPriceNpr: proposed,
          stockQuantity: stock,
          sku: sku.trim() || undefined,
          imageUrl: primaryImg,
          galleryImages: galleryImages.length > 0 ? galleryImages : undefined
        });

        if (res.success) {
          setSuccess('Product successfully submitted for Admin evaluation & commission approval!');
          setViewMode('list');
          await loadProducts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setSuccess(null), 4000);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save product. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Live calculation of profit margin
  const numCost = Number(costPriceNpr) || 0;
  const numSelling = Number(proposedSellingPriceNpr) || 0;
  const grossMarginNpr = Math.max(0, numSelling - numCost);
  const grossMarginPercent = numSelling > 0 ? Math.round((grossMarginNpr / numSelling) * 100) : 0;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedFilterCategory === 'all' || p.category === selectedFilterCategory;
    return matchesSearch && matchesCategory;
  });

  // KPI Metrics
  const totalApproved = products.filter((p) => p.status === 'approved').length;
  const totalPending = products.filter((p) => p.status === 'pending_approval').length;
  const totalLowStock = products.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 5)).length;

  // =========================================================================
  // VIEW 1: FULL-PAGE PRODUCT UPLOAD & EDIT PAGE (No modal, 100% full screen)
  // =========================================================================
  if (viewMode === 'create' || viewMode === 'edit') {
    const isEdit = viewMode === 'edit';

    return (
      <div className="w-full min-h-screen bg-slate-50/70 pb-16">
        {/* Full-Page Top Header Navigation */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center space-x-1.5 font-bold text-xs shrink-0"
                title="Return to product inventory"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Back to Products</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{isEdit ? 'Edit Product & Photos' : 'Upload New Product'}</span>
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {shop?.name ? `Store: ${shop.name} • ` : ''}
                  Upload high-quality product images and define retail pricing
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md shadow-amber-300/40 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{submitting ? 'Saving Product...' : isEdit ? 'Save Changes' : 'Submit for Review'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Page Form Body Container */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
          
          {/* Policy Notice Banner */}
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Admin Commission & Fair Pricing Policy</p>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Shopkeepers set the verified Cost Price and proposed Selling Price. The JK Mission Nepal Administrator assigns customer cashback and 3-level referral distributions based on your margin to maintain verified profit margins.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 2-Column Responsive Layout for Mobile & Desktop */}
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Visual Photos & Gallery (5 cols on lg, full width on mobile) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-950 text-base flex items-center space-x-2">
                      <span>Product Visuals</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Pick main cover photo & extra angles</p>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                {/* Integrated Responsive Image Gallery */}
                <ImageUploadGallery
                  primaryImage={imageUrl}
                  onChangePrimaryImage={setImageUrl}
                  galleryImages={galleryImages}
                  onChangeGalleryImages={setGalleryImages}
                  label="Photos (Phone Gallery / Device / URL)"
                  helpText="Select clear photos of the product. Take well-lit photos showing packaging and labels."
                />

                {/* Photography Tips Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Photo Guidelines for Nepal Merchants:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[10px]">
                    <li>Use natural or bright indoor lighting</li>
                    <li>Show clear view of brand and expiry date if food/organic</li>
                    <li>Avoid heavy filters or third-party watermarks</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Specifications, Pricing & Stock (7 cols on lg, full width on mobile) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product Basic Info Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-950 text-base">Essential Information</h3>
                  <p className="text-[11px] text-slate-500">Identify product title, category, and catalog code</p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Ilam Black Orthodox Tea (250g)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Include quantity or weight in the title for buyer clarity.</p>
                </div>

                {/* Category & SKU in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">SKU / Item Code</label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[10px] font-bold text-amber-700 hover:underline"
                      >
                        Auto Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. ILAM-TEA-250"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing, Margin & Stock Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-950 text-base">Pricing & Inventory</h3>
                  <p className="text-[11px] text-slate-500">All amounts are denominated in Nepali Rupees (NPR रु)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Cost Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Cost Price (NPR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        रु
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={costPriceNpr}
                        onChange={(e) => setCostPriceNpr(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full pl-8 pr-3 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Your store procurement cost</span>
                  </div>

                  {/* Proposed Selling Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Proposed Selling Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                        रु
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={proposedSellingPriceNpr}
                        onChange={(e) => setProposedSellingPriceNpr(e.target.value)}
                        placeholder="e.g. 680"
                        className="w-full pl-8 pr-3 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Final price shown to buyers</span>
                  </div>

                  {/* Initial Stock */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Available Stock Units *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Units available right now</span>
                  </div>
                </div>

                {/* Live Margin Calculation Preview Box */}
                {numCost > 0 && numSelling > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-amber-900 font-bold block">Estimated Store Gross Margin:</span>
                      <p className="text-[11px] text-amber-800/80">
                        Spread between selling price and procurement cost.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-950 font-mono block">
                        +{formatNPR(grossMarginNpr)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {grossMarginPercent}% Gross Margin
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Detailed Description Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-950 text-base">Description & Specifications</h3>
                  <p className="text-[11px] text-slate-500">Provide detailed quality notes, origin, and instructions</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Product Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how the item is made, its unique Nepali heritage, grade, ingredients, and storage tips..."
                    className="w-full p-4 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  Discard & Back to List
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{submitting ? 'Saving Product...' : isEdit ? 'Save Changes' : 'Submit for Admin Approval'}</span>
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PRODUCT LISTING & MANAGEMENT HUB
  // =========================================================================
  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Store Inventory & Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            Merchant Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store&apos;s product listings, stock levels, and upload high-resolution photos.
          </p>
        </div>

        <button
          onClick={openCreatePage}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-300/30 hover:shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product (Full Page)</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Products</span>
          <p className="text-2xl font-black text-slate-950">{products.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Approved & Live</span>
          <p className="text-2xl font-black text-emerald-600">{totalApproved}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Pending Review</span>
          <p className="text-2xl font-black text-amber-600">{totalPending}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Low Stock Alert</span>
          <p className="text-2xl font-black text-rose-600">{totalLowStock}</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilterCategory === 'all'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.slice(0, 4).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedFilterCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilterCategory === c
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Responsive Cards for Mobile & Clean Table for Desktop */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading catalog submissions...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-base">No matching products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {products.length === 0
                ? 'Your store catalog is empty. Click below to add your first retail product!'
                : 'Try clearing your search query or category filter.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={openCreatePage}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Product</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (Visible on small screens) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku || 'NO-SKU'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.status === 'pending_approval' ? 'Pending' : p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-amber-700 font-semibold">{p.category}</p>
                    </div>
                  </div>

                  {/* Financial & Stock Details */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Cost</span>
                      <strong className="text-slate-700">{formatNPR(p.costPriceNpr)}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Selling</span>
                      <strong className="text-slate-950 font-black">
                        {formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Stock</span>
                      <strong className={`${p.stockQuantity <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {p.stockQuantity} pcs
                      </strong>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => openEditPage(p)}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Product & Photos (Full Page)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout (Visible on medium+ screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Cost Price</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    <th className="py-3.5 px-4 text-center">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Admin Commission Details</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">{p.sku || 'No SKU'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.category}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatNPR(p.costPriceNpr)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        {formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          p.stockQuantity <= 5 ? 'bg-rose-50 text-rose-700 font-black' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.status === 'pending_approval' ? 'Pending Review' : p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        {p.commissionSettings ? (
                          <div className="text-slate-600 space-y-0.5">
                            <p>Cashback: <strong className="text-emerald-700">{p.commissionSettings.customerCashbackType === 'percentage' ? `${p.commissionSettings.customerCashbackValue}%` : formatNPR(p.commissionSettings.customerCashbackValue)}</strong></p>
                            <p>Store Comm: <strong className="text-blue-700">{formatNPR(p.commissionSettings.shopkeeperCommissionValue)}</strong></p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Evaluated upon approval</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditPage(p)}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
                          title="Open Full Page Editor"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit & Photos</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

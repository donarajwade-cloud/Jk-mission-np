import React, { useState, useEffect } from 'react';
import { Product, ProductCommissionSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import {
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Award,
  Pencil,
  X,
  Save,
  Ban,
  Calculator,
  Loader2,
  Check
} from 'lucide-react';
import { ImageUploadGallery } from '../../components/common/ImageUploadGallery.tsx';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Form states for Product-Wise Commission Settings
  const [finalSellingPriceNpr, setFinalSellingPriceNpr] = useState<number>(500);
  const [customerCashbackType, setCustomerCashbackType] = useState<'fixed' | 'percentage'>('fixed');
  const [customerCashbackValue, setCustomerCashbackValue] = useState<number>(30);

  const [referralPoolType, setReferralPoolType] = useState<'fixed' | 'percentage'>('fixed');
  const [referralPoolValue, setReferralPoolValue] = useState<number>(60);
  const [level1Percentage, setLevel1Percentage] = useState<number>(50); // 50% of pool
  const [level2Percentage, setLevel2Percentage] = useState<number>(30); // 30% of pool
  const [level3Percentage, setLevel3Percentage] = useState<number>(20); // 20% of pool

  const [shopkeeperCommissionType, setShopkeeperCommissionType] = useState<'fixed' | 'percentage'>('fixed');
  const [shopkeeperCommissionValue, setShopkeeperCommissionValue] = useState<number>(40);

  const [companyShareNpr, setCompanyShareNpr] = useState<number>(50);
  const [permittedExpensesNpr, setPermittedExpensesNpr] = useState<number>(20);

  const [saving, setSaving] = useState(false);
  const [configModalError, setConfigModalError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts();
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openConfigurator = (prod: Product) => {
    setSelectedProduct(prod);
    setConfigModalError(null);
    const existing = prod.commissionSettings;

    setFinalSellingPriceNpr(prod.finalSellingPriceNpr || prod.proposedSellingPriceNpr);
    if (existing) {
      setCustomerCashbackType(existing.customerCashbackType);
      setCustomerCashbackValue(existing.customerCashbackValue);
      setReferralPoolType(existing.referralPoolType);
      setReferralPoolValue(existing.referralPoolValue);
      setLevel1Percentage(existing.level1Percentage);
      setLevel2Percentage(existing.level2Percentage);
      setLevel3Percentage(existing.level3Percentage);
      setShopkeeperCommissionType(existing.shopkeeperCommissionType);
      setShopkeeperCommissionValue(existing.shopkeeperCommissionValue);
      setCompanyShareNpr(existing.companyShareNpr);
      setPermittedExpensesNpr(existing.permittedExpensesNpr);
    } else {
      // Defaults based on margin
      const margin = (prod.proposedSellingPriceNpr || 500) - prod.costPriceNpr;
      setCustomerCashbackType('fixed');
      setCustomerCashbackValue(Math.max(10, Math.round(margin * 0.15)));
      setReferralPoolType('fixed');
      setReferralPoolValue(Math.max(20, Math.round(margin * 0.35)));
      setLevel1Percentage(50);
      setLevel2Percentage(30);
      setLevel3Percentage(20);
      setShopkeeperCommissionType('fixed');
      setShopkeeperCommissionValue(Math.max(10, Math.round(margin * 0.20)));
      setCompanyShareNpr(Math.max(10, Math.round(margin * 0.20)));
      setPermittedExpensesNpr(Math.max(10, Math.round(margin * 0.10)));
    }
    setConfigModalOpen(true);
  };

  // Live calculation preview
  const costPrice = selectedProduct?.costPriceNpr || 0;
  const sellingPrice = Number(finalSellingPriceNpr) || 0;
  const grossMargin = sellingPrice - costPrice;

  // 1. Cashback preview
  const calcCashbackNpr = customerCashbackType === 'percentage'
    ? Math.round((sellingPrice * (Number(customerCashbackValue) || 0)) / 100)
    : Math.round(Number(customerCashbackValue) || 0);

  // 2. Referral Pool preview
  const calcReferralPoolNpr = referralPoolType === 'percentage'
    ? Math.round((grossMargin * (Number(referralPoolValue) || 0)) / 100)
    : Math.round(Number(referralPoolValue) || 0);

  const calcL1Npr = Math.round((calcReferralPoolNpr * (Number(level1Percentage) || 0)) / 100);
  const calcL2Npr = Math.round((calcReferralPoolNpr * (Number(level2Percentage) || 0)) / 100);
  const calcL3Npr = Math.round((calcReferralPoolNpr * (Number(level3Percentage) || 0)) / 100);

  // 3. Shopkeeper commission preview
  const calcShopkeeperCommNpr = shopkeeperCommissionType === 'percentage'
    ? Math.round((sellingPrice * (Number(shopkeeperCommissionValue) || 0)) / 100)
    : Math.round(Number(shopkeeperCommissionValue) || 0);

  // 4. Expenses & Company Share
  const numCompanyShare = Number(companyShareNpr) || 0;
  const numPermittedExpenses = Number(permittedExpensesNpr) || 0;

  // Total Promised Distribution
  const totalPromisedDistributionNpr =
    calcCashbackNpr +
    calcReferralPoolNpr +
    calcShopkeeperCommNpr +
    numPermittedExpenses +
    numCompanyShare;

  const netCompanyProfitNpr = grossMargin - (totalPromisedDistributionNpr - numCompanyShare);

  const isOverAllocated = totalPromisedDistributionNpr > grossMargin;
  const isReferralOver100 = (Number(level1Percentage) || 0) + (Number(level2Percentage) || 0) + (Number(level3Percentage) || 0) > 100;
  const isNegativeMargin = grossMargin < 0;
  const isValidConfiguration = !isOverAllocated && !isReferralOver100 && !isNegativeMargin && sellingPrice > 0;

  const handleSaveCommissionAndApprove = async () => {
    if (!selectedProduct) return;
    if (!isValidConfiguration) {
      if (isNegativeMargin) {
        setConfigModalError(`Selling price (NPR ${sellingPrice}) cannot be lower than cost price (NPR ${costPrice}).`);
      } else if (isOverAllocated) {
        setConfigModalError(`Total distribution (NPR ${totalPromisedDistributionNpr}) exceeds gross margin (NPR ${grossMargin}) by NPR ${totalPromisedDistributionNpr - grossMargin}. Adjust your figures.`);
      } else if (isReferralOver100) {
        setConfigModalError(`Referral tier percentages total ${Number(level1Percentage) + Number(level2Percentage) + Number(level3Percentage)}%, which exceeds 100%.`);
      } else {
        setConfigModalError('Please check your price and commission values before saving.');
      }
      return;
    }

    setSaving(true);
    setConfigModalError(null);

    const commissionSettings: ProductCommissionSettings = {
      customerCashbackType,
      customerCashbackValue: Number(customerCashbackValue) || 0,
      referralPoolType,
      referralPoolValue: Number(referralPoolValue) || 0,
      level1Percentage: Number(level1Percentage) || 0,
      level2Percentage: Number(level2Percentage) || 0,
      level3Percentage: Number(level3Percentage) || 0,
      shopkeeperCommissionType,
      shopkeeperCommissionValue: Number(shopkeeperCommissionValue) || 0,
      companyShareNpr: numCompanyShare,
      permittedExpensesNpr: numPermittedExpenses
    };

    try {
      const res = await api.configureAndApproveProduct(selectedProduct.id, {
        finalSellingPriceNpr: sellingPrice,
        commissionSettings
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Product "${selectedProduct.name}" approved with selling price NPR ${sellingPrice} and commissions saved!`
        });
        setConfigModalOpen(false);
        // Refresh product in state and reload
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, status: 'approved', finalSellingPriceNpr: sellingPrice, commissionSettings } : p));
        await loadProducts();
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setConfigModalError((res as any).error || 'Failed to save commission settings');
      }
    } catch (err: any) {
      setConfigModalError(err.message || 'Failed to save product settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectReason.trim()) return;
    try {
      const res = await api.rejectProduct(selectedProduct.id, rejectReason.trim());
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `Product "${selectedProduct.name}" rejected.` });
        setRejectModalOpen(false);
        setRejectReason('');
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, status: 'rejected' } : p));
        await loadProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const handleToggleStatus = async (prodId: string) => {
    try {
      const res = await api.toggleProductStatus(prodId);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === prodId ? res.product : p));
        await loadProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    }
  };

  // Product Edit & Photo Upload Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCostPriceNpr, setEditCostPriceNpr] = useState<number>(0);
  const [editSellingPriceNpr, setEditSellingPriceNpr] = useState<number>(0);
  const [editStockQuantity, setEditStockQuantity] = useState<number>(0);
  const [editSku, setEditSku] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category);
    setEditDescription(prod.description || '');
    setEditCostPriceNpr(prod.costPriceNpr);
    setEditSellingPriceNpr(prod.finalSellingPriceNpr || prod.proposedSellingPriceNpr);
    setEditStockQuantity(prod.stockQuantity);
    setEditSku(prod.sku || '');
    setEditImageUrl(prod.imageUrl || '');
    setEditGalleryImages(prod.galleryImages || []);
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim()) {
      setEditError('Product title is required');
      return;
    }
    const cost = Number(editCostPriceNpr);
    const selling = Number(editSellingPriceNpr);

    if (isNaN(cost) || cost <= 0 || isNaN(selling) || selling <= 0) {
      setEditError('Merchant cost price and selling price must be positive numbers');
      return;
    }
    if (selling < cost) {
      setEditError(`Selling price (NPR ${selling}) cannot be less than cost price (NPR ${cost})`);
      return;
    }

    const primaryImg = editImageUrl.trim() || (editGalleryImages.length > 0 ? editGalleryImages[0] : '');
    if (!primaryImg) {
      setEditError('Please upload at least one photo from your device gallery or enter an image URL');
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const payload = {
        name: editName.trim(),
        category: editCategory.trim() || 'General',
        description: editDescription.trim(),
        costPriceNpr: cost,
        proposedSellingPriceNpr: selling,
        finalSellingPriceNpr: selling,
        stockQuantity: Math.max(0, Number(editStockQuantity) || 0),
        sku: editSku.trim(),
        imageUrl: primaryImg,
        galleryImages: editGalleryImages
      };

      const res = await api.updateProduct(editingProduct.id, payload);

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Product "${editName.trim()}" and photos saved successfully!`
        });

        // Instantly update product in local React state
        const updatedProduct: Product = res.product || {
          ...editingProduct,
          ...payload,
          updatedAt: new Date().toISOString()
        };

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        setEditModalOpen(false);

        // Background reload to sync with backend
        loadProducts().catch(() => {});
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setEditError((res as any).error || 'Failed to update product');
      }
    } catch (err: any) {
      console.error('Save product edit error:', err);
      setEditError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');

  const pendingCount = products.filter(p => p.status === 'pending_approval').length;
  const approvedCount = products.filter(p => p.status === 'approved').length;
  const rejectedCount = products.filter(p => p.status === 'rejected').length;

  const sortedProducts = [...products].sort((a, b) => {
    if (a.status === 'pending_approval' && b.status !== 'pending_approval') return -1;
    if (a.status !== 'pending_approval' && b.status === 'pending_approval') return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const filteredProducts = sortedProducts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Critical Financial Oversight &amp; Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            Admin Product Catalog &amp; Commissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Edit product specifications, upload photos from device gallery, and configure 3-level commissions, cashbacks, and merchant shares.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold self-start lg:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              statusFilter === 'pending_approval'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Alert banner if products are waiting */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-xs">
          <div className="flex items-start sm:items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
            <span>
              <strong>{pendingCount} Product Submission{pendingCount > 1 ? 's' : ''} Awaiting Review: </strong>
              Please configure product selling price, cashback, referral pool, and merchant commission before making them live.
            </span>
          </div>
          {statusFilter !== 'pending_approval' && (
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shrink-0 self-start sm:self-auto text-xs"
            >
              Show Pending
            </button>
          )}
        </div>
      )}

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2.5 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Products Catalog: Dedicated Mobile Cards + Desktop Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            <span className="font-bold">Loading catalog items...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
            No products found matching filter &quot;{statusFilter}&quot;.
          </div>
        ) : (
          <>
            {/* 1. DESKTOP TABLE VIEW (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-4">Product &amp; Shop</th>
                    <th className="py-4 px-4 text-right">Cost Price</th>
                    <th className="py-4 px-4 text-right">Selling Price</th>
                    <th className="py-4 px-4 text-right">Gross Margin</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4">Approved Commissions</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const margin = (p.finalSellingPriceNpr || p.proposedSellingPriceNpr) - p.costPriceNpr;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 text-sm truncate max-w-sm">{p.name}</p>
                              <span className="text-xs text-amber-700 font-bold block">{p.shopName}</span>
                              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                <span>Stock: <strong>{p.stockQuantity}</strong></span>
                                <span>•</span>
                                <span>SKU: {p.sku || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-600 font-mono text-sm">
                          {formatNPR(p.costPriceNpr)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-950 font-mono text-sm">
                          {formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 font-mono text-sm">
                          {formatNPR(margin)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : p.status === 'disabled'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                          }`}>
                            {p.status === 'pending_approval' ? 'Pending Approval' : p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-600">
                          {p.commissionSettings ? (
                            <div className="space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <p>Cashback: <strong className="text-emerald-700 font-bold">+{p.commissionSettings.customerCashbackType === 'percentage' ? `${p.commissionSettings.customerCashbackValue}%` : formatNPR(p.commissionSettings.customerCashbackValue)}</strong></p>
                              <p>Ref Pool: <strong className="font-bold">{formatNPR(p.commissionSettings.referralPoolValue)}</strong> (L1: {p.commissionSettings.level1Percentage}%, L2: {p.commissionSettings.level2Percentage}%, L3: {p.commissionSettings.level3Percentage}%)</p>
                              <p>Shopkeeper: <strong className="text-blue-700 font-bold">{formatNPR(p.commissionSettings.shopkeeperCommissionValue)}</strong></p>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-bold italic text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                              Requires configuration
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center space-x-1 transition-colors"
                              title="Edit Product Details & Photos"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit &amp; Photos</span>
                            </button>

                            <button
                              onClick={() => openConfigurator(p)}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                              title="Configure Commissions & Approve"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{p.status === 'approved' ? 'Commissions' : 'Configure & Approve'}</span>
                            </button>

                            {p.status === 'pending_approval' && (
                              <button
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition-colors"
                                title="Reject Product"
                              >
                                Reject
                              </button>
                            )}

                            {p.status !== 'pending_approval' && (
                              <button
                                onClick={() => handleToggleStatus(p.id)}
                                className={`p-1.5 rounded-xl transition-colors ${p.status === 'approved' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'}`}
                                title={p.status === 'approved' ? 'Disable Product' : 'Enable Product'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. DEDICATED MOBILE CARDS VIEW (Clean, professional, thumb-friendly on all mobile screens) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 sm:p-4 space-y-4">
              {filteredProducts.map((p) => {
                const margin = (p.finalSellingPriceNpr || p.proposedSellingPriceNpr) - p.costPriceNpr;
                return (
                  <div key={p.id} className="pt-4 first:pt-0 space-y-3.5 bg-white">
                    {/* Top Row: Photo + Name + Status */}
                    <div className="flex items-start space-x-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-black text-slate-950 text-sm leading-snug truncate">
                            {p.name}
                          </h4>
                          <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            p.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : p.status === 'disabled'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                          }`}>
                            {p.status === 'pending_approval' ? 'Pending' : p.status}
                          </span>
                        </div>
                        <span className="text-xs text-amber-700 font-bold block mt-0.5">{p.shopName}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>Cat: <strong>{p.category}</strong></span>
                          <span>•</span>
                          <span>Stock: <strong>{p.stockQuantity}</strong></span>
                          {p.sku && <span>• SKU: {p.sku}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Financial 3-Box Strip (Cost, Selling, Margin) */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Cost</span>
                        <span className="font-bold text-slate-700 font-mono text-xs">{formatNPR(p.costPriceNpr)}</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Selling</span>
                        <span className="font-black text-slate-950 font-mono text-xs">{formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Margin</span>
                        <span className="font-black text-emerald-700 font-mono text-xs">+{formatNPR(margin)}</span>
                      </div>
                    </div>

                    {/* Commissions summary */}
                    {p.commissionSettings ? (
                      <div className="text-[11px] bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/60 text-slate-700 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Customer Cashback:</span>
                          <strong className="text-emerald-700 font-bold font-mono">
                            +{p.commissionSettings.customerCashbackType === 'percentage' ? `${p.commissionSettings.customerCashbackValue}%` : formatNPR(p.commissionSettings.customerCashbackValue)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Referral Pool:</span>
                          <strong className="font-bold font-mono">{formatNPR(p.commissionSettings.referralPoolValue)} (L1: {p.commissionSettings.level1Percentage}%, L2: {p.commissionSettings.level2Percentage}%, L3: {p.commissionSettings.level3Percentage}%)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Shopkeeper Comm:</span>
                          <strong className="text-blue-700 font-bold font-mono">{formatNPR(p.commissionSettings.shopkeeperCommissionValue)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-center">
                        ⚠️ Commissions not configured yet
                      </div>
                    )}

                    {/* Action Buttons in Full-Width Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-black text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit &amp; Photos</span>
                      </button>

                      <button
                        onClick={() => openConfigurator(p)}
                        className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{p.status === 'approved' ? 'Commissions' : 'Configure'}</span>
                      </button>

                      {p.status === 'pending_approval' ? (
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setRejectModalOpen(true);
                          }}
                          className="col-span-2 py-2 px-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition-colors text-center"
                        >
                          Reject Submission
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className="col-span-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center flex items-center justify-center space-x-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{p.status === 'approved' ? 'Disable Product (Hide from Store)' : 'Enable Product (Publish to Store)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FULL-SCREEN RESPONSIVE COMMISSION CONFIGURATION & VALIDATION MODAL */}
      {configModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden">
            {/* Header (Sticky) */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 bg-amber-50/80 flex items-center justify-between sticky top-0 z-10">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                  Admin Commission Engine
                </span>
                <h3 className="font-black text-slate-950 text-base sm:text-lg mt-1 truncate">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">Merchant: {selectedProduct.shopName}</p>
              </div>
              <button
                type="button"
                onClick={() => setConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 flex items-center justify-center text-lg font-bold border border-slate-200 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Error Message if any */}
            {configModalError && (
              <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{configModalError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Cost & Selling Price Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <span className="text-slate-500 text-[11px] block">Merchant Cost Price:</span>
                  <strong className="text-base text-slate-900 font-mono">{formatNPR(costPrice)}</strong>
                </div>
                <div>
                  <label className="text-slate-700 text-[11px] font-bold block mb-1">
                    Authorized Selling Price (NPR):
                  </label>
                  <input
                    type="number"
                    min={costPrice}
                    value={finalSellingPriceNpr}
                    onChange={(e) => setFinalSellingPriceNpr(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Available Gross Margin:</span>
                  <strong className={`text-base font-black font-mono ${grossMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatNPR(grossMargin)}
                  </strong>
                </div>
              </div>

              {/* Commission Distribution Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. Customer Cashback */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2.5 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>1. Customer Cashback</span>
                    </span>
                    <span className="font-bold text-emerald-700 text-xs font-mono">
                      = {formatNPR(calcCashbackNpr)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={customerCashbackType}
                      onChange={(e) => setCustomerCashbackType(e.target.value as any)}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Price</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={customerCashbackValue}
                      onChange={(e) => setCustomerCashbackValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Value"
                    />
                  </div>
                </div>

                {/* 2. Shopkeeper Commission */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2.5 bg-white shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>2. Shopkeeper Commission</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs font-mono">
                      = {formatNPR(calcShopkeeperCommNpr)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={shopkeeperCommissionType}
                      onChange={(e) => setShopkeeperCommissionType(e.target.value as any)}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Price</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={shopkeeperCommissionValue}
                      onChange={(e) => setShopkeeperCommissionValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Value"
                    />
                  </div>
                </div>

                {/* 3. Referral Commission Pool & 3 Levels */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white md:col-span-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span>3. Referral Commission Pool & 3 Levels</span>
                    </span>
                    <span className="font-bold text-purple-700 text-xs font-mono">
                      Pool Total = {formatNPR(calcReferralPoolNpr)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={referralPoolType}
                      onChange={(e) => setReferralPoolType(e.target.value as any)}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Margin</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={referralPoolValue}
                      onChange={(e) => setReferralPoolValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Pool Value"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Distribution of Referral Pool across 3 Levels (Must not exceed 100% total):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 1 Direct (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level1Percentage}
                        onChange={(e) => setLevel1Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1 font-mono">
                        = {formatNPR(calcL1Npr)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 2 Tier 2 (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level2Percentage}
                        onChange={(e) => setLevel2Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1 font-mono">
                        = {formatNPR(calcL2Npr)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 3 Tier 3 (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level3Percentage}
                        onChange={(e) => setLevel3Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1 font-mono">
                        = {formatNPR(calcL3Npr)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Company Share */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-2xs">
                  <span className="font-extrabold text-slate-900 block">4. Company Share (NPR)</span>
                  <input
                    type="number"
                    min="0"
                    value={companyShareNpr}
                    onChange={(e) => setCompanyShareNpr(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">Retained revenue for operational growth</p>
                </div>

                {/* 5. Permitted Expenses */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-white shadow-2xs">
                  <span className="font-extrabold text-slate-900 block">5. Permitted Expenses (NPR)</span>
                  <input
                    type="number"
                    min="0"
                    value={permittedExpensesNpr}
                    onChange={(e) => setPermittedExpensesNpr(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">Payment gateway fees, packaging, handling</p>
                </div>
              </div>

              {/* CLEAN LIVE CALCULATION & MARGIN AUDIT PREVIEW (FIXED MOBILE ALIGNMENT) */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                isValidConfiguration ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                {/* Header row - stacks cleanly on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-1 border-b border-emerald-200/50">
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                    {isValidConfiguration ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>Financial Distribution Audit</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-slate-500">Allocated / Margin:</span>
                    <span className="font-black text-xs sm:text-sm font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                      {totalPromisedDistributionNpr} / {grossMargin} NPR
                    </span>
                  </div>
                </div>

                {/* 4 Stat Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-white/70 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Cashback:</span>
                    <strong className="text-emerald-700 font-mono text-xs">{formatNPR(calcCashbackNpr)}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Referral Pool:</span>
                    <strong className="text-purple-700 font-mono text-xs">{formatNPR(calcReferralPoolNpr)}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Shopkeeper:</span>
                    <strong className="text-blue-700 font-mono text-xs">{formatNPR(calcShopkeeperCommNpr)}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">Expenses + Co:</span>
                    <strong className="text-slate-800 font-mono text-xs">{formatNPR(numPermittedExpenses + numCompanyShare)}</strong>
                  </div>
                </div>

                {/* Validation Status & Net Margin */}
                <div className="border-t border-slate-200/60 pt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
                  <div>
                    {isOverAllocated && (
                      <p className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Exceeds margin by NPR {totalPromisedDistributionNpr - grossMargin}!</span>
                      </p>
                    )}
                    {isReferralOver100 && (
                      <p className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Referral tiers total {Number(level1Percentage) + Number(level2Percentage) + Number(level3Percentage)}% (&gt; 100%)!</span>
                      </p>
                    )}
                    {isValidConfiguration && (
                      <p className="text-emerald-800 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>Balanced: Distribution fits within margin (Buffer: NPR {grossMargin - totalPromisedDistributionNpr})</span>
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right font-black text-xs sm:text-sm bg-white/80 p-2 sm:p-0 rounded-xl">
                    <span className="text-slate-500 font-normal">Net Profit: </span>
                    <span className="text-emerald-800 font-mono">{formatNPR(grossMargin - totalPromisedDistributionNpr + numCompanyShare)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR (RESPONSIVE FOR ALL SCREEN SIZES) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-0 z-20">
              <span className="text-[11px] text-slate-500 text-center sm:text-left order-2 sm:order-1">
                Changes apply to future sales. Past sales retain immutable ledger snapshots.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCommissionAndApprove}
                  disabled={saving || !isValidConfiguration}
                  className="flex-2 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-950" />
                      <span>Save & Approve Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN RESPONSIVE PRODUCT EDIT & PHOTO UPLOAD MODAL */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl lg:max-w-5xl bg-white sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden">
            {/* Header (Sticky) */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                  Admin Product &amp; Photos Editor
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-slate-950 truncate mt-1">
                  Edit Product Details &amp; Gallery
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Store: <strong className="text-slate-800">{editingProduct.shopName}</strong> • ID: <span className="font-mono">{editingProduct.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center text-lg font-bold border border-slate-200 shrink-0 shadow-xs"
              >
                ✕
              </button>
            </div>

            {/* Error Banner at Top */}
            {editError && (
              <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{editError}</span>
              </div>
            )}

            {/* Scrollable Form Body with Responsive 2-Column Grid */}
            <form onSubmit={handleSaveProductEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs flex flex-col justify-between">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Photos & Gallery Uploader */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <ImageUploadGallery
                      primaryImage={editImageUrl}
                      onChangePrimaryImage={setEditImageUrl}
                      galleryImages={editGalleryImages}
                      onChangeGalleryImages={setEditGalleryImages}
                      label="Product Photos & Device Gallery"
                      helpText="Upload from your computer or phone gallery. Click the star on any photo to set as primary."
                    />
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                    💡 <strong>Pro Tip:</strong> Primary photo will be shown in public storefront and search catalogs. Additional gallery photos are shown on the interactive product detail page.
                  </div>
                </div>

                {/* Right Column: Pricing, Margins, Titles, and Stock */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Product Title */}
                  <div>
                    <label className="block font-black text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                      Product Title / Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Organic Himalayan Honey 500g"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-400 bg-white shadow-2xs"
                    />
                  </div>

                  {/* Category & SKU Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="e.g. Organic & Food, Handicrafts"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                        SKU Identifier Code
                      </label>
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        placeholder="SKU-XXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>
                  </div>

                  {/* Pricing & Gross Margin Calculation Grid */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                      Financial Unit Economics (NPR)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          Merchant Cost Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">रु</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editCostPriceNpr}
                            onChange={(e) => setEditCostPriceNpr(Number(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:border-amber-400 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          Final Selling Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-amber-600 font-bold text-xs">रु</span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editSellingPriceNpr}
                            onChange={(e) => setEditSellingPriceNpr(Number(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-black font-mono text-amber-700 focus:outline-none focus:border-amber-400 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          Calculated Gross Margin
                        </label>
                        <div className={`w-full py-2 px-3 rounded-xl border text-xs sm:text-sm font-black font-mono text-center flex items-center justify-center ${
                          (editSellingPriceNpr - editCostPriceNpr) >= 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {formatNPR(editSellingPriceNpr - editCostPriceNpr)}
                        </div>
                      </div>
                    </div>
                    {editSellingPriceNpr < editCostPriceNpr && (
                      <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Selling price cannot be lower than cost price!</span>
                      </p>
                    )}
                  </div>

                  {/* Stock Units */}
                  <div>
                    <label className="block font-black text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                      Available Stock Inventory (Units) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editStockQuantity}
                      onChange={(e) => setEditStockQuantity(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block font-black text-slate-800 text-xs mb-1.5 uppercase tracking-wide">
                      Product Description &amp; Specifications
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Detailed specifications, features, organic origin, dimensions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer (Sticky at bottom of modal) */}
              <div className="shrink-0 pt-4 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
                <div className="flex-1">
                  {editError ? (
                    <span className="text-xs text-red-600 font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{editError}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Changes will update live across the entire storefront and merchant inventory.
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-2 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {editSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Saving Product...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-slate-950" />
                        <span>Save Product &amp; Photos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-base">Reject Product Submission</h3>
            <p className="text-slate-500">Provide feedback reason to {selectedProduct.shopName}:</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unrealistic proposed price, insufficient description, or category mismatch."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

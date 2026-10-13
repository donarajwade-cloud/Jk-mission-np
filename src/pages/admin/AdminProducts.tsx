import React, { useState, useEffect } from 'react';
import { Product, ProductCommissionSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sliders,
  DollarSign,
  ShieldCheck,
  Percent,
  Calculator,
  Eye,
  Check,
  Ban,
  Award
} from 'lucide-react';

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
      setCustomerCashbackValue(Math.round(margin * 0.15));
      setReferralPoolType('fixed');
      setReferralPoolValue(Math.round(margin * 0.35));
      setLevel1Percentage(50);
      setLevel2Percentage(30);
      setLevel3Percentage(20);
      setShopkeeperCommissionType('fixed');
      setShopkeeperCommissionValue(Math.round(margin * 0.20));
      setCompanyShareNpr(Math.round(margin * 0.20));
      setPermittedExpensesNpr(Math.round(margin * 0.10));
    }
    setConfigModalOpen(true);
  };

  // Live calculation preview
  const costPrice = selectedProduct?.costPriceNpr || 0;
  const sellingPrice = finalSellingPriceNpr;
  const grossMargin = sellingPrice - costPrice;

  // 1. Cashback preview
  const calcCashbackNpr = customerCashbackType === 'percentage'
    ? Math.round((sellingPrice * customerCashbackValue) / 100)
    : Math.round(customerCashbackValue);

  // 2. Referral Pool preview
  const calcReferralPoolNpr = referralPoolType === 'percentage'
    ? Math.round((grossMargin * referralPoolValue) / 100)
    : Math.round(referralPoolValue);

  const calcL1Npr = Math.round((calcReferralPoolNpr * level1Percentage) / 100);
  const calcL2Npr = Math.round((calcReferralPoolNpr * level2Percentage) / 100);
  const calcL3Npr = Math.round((calcReferralPoolNpr * level3Percentage) / 100);

  // 3. Shopkeeper commission preview
  const calcShopkeeperCommNpr = shopkeeperCommissionType === 'percentage'
    ? Math.round((sellingPrice * shopkeeperCommissionValue) / 100)
    : Math.round(shopkeeperCommissionValue);

  // Total Promised Distribution
  const totalPromisedDistributionNpr =
    calcCashbackNpr +
    calcReferralPoolNpr +
    calcShopkeeperCommNpr +
    permittedExpensesNpr +
    companyShareNpr;

  const netCompanyProfitNpr = grossMargin - (totalPromisedDistributionNpr - companyShareNpr);

  const isOverAllocated = totalPromisedDistributionNpr > grossMargin;
  const isReferralOver100 = level1Percentage + level2Percentage + level3Percentage > 100;
  const isNegativeMargin = grossMargin < 0;
  const isValidConfiguration = !isOverAllocated && !isReferralOver100 && !isNegativeMargin;

  const handleSaveCommissionAndApprove = async () => {
    if (!selectedProduct) return;
    if (!isValidConfiguration) {
      alert('Cannot save: Promised distribution exceeds available margin or invalid settings.');
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    const commissionSettings: ProductCommissionSettings = {
      customerCashbackType,
      customerCashbackValue,
      referralPoolType,
      referralPoolValue,
      level1Percentage,
      level2Percentage,
      level3Percentage,
      shopkeeperCommissionType,
      shopkeeperCommissionValue,
      companyShareNpr,
      permittedExpensesNpr
    };

    try {
      const res = await api.configureAndApproveProduct(selectedProduct.id, {
        finalSellingPriceNpr,
        commissionSettings
      });

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `Product "${selectedProduct.name}" approved and commissions configured successfully!` });
        setConfigModalOpen(false);
        // Refresh product in state
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, status: 'approved', finalSellingPriceNpr, commissionSettings } : p));
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to approve product' });
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
      }
    } catch (err: any) {
      alert(err.message || 'Toggle failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Critical Financial Oversight
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Product Approvals & Commission Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Shopkeeper commissions are NOT fixed globally. Every single product has its own custom cashback, 3-level referral pool, and merchant commission configured here.
        </p>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading catalog items...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Product & Shop</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approved Commissions</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const margin = p.finalSellingPriceNpr - p.costPriceNpr;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="text-[10px] text-amber-700 font-semibold">{p.shopName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatNPR(p.costPriceNpr)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatNPR(p.finalSellingPriceNpr || p.proposedSellingPriceNpr)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatNPR(margin)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        {p.commissionSettings ? (
                          <div className="space-y-0.5">
                            <p>Cashback: <strong className="text-emerald-700">+{p.commissionSettings.customerCashbackType === 'percentage' ? `${p.commissionSettings.customerCashbackValue}%` : formatNPR(p.commissionSettings.customerCashbackValue)}</strong></p>
                            <p>Ref Pool: <strong>{formatNPR(p.commissionSettings.referralPoolValue)}</strong> (L1: {p.commissionSettings.level1Percentage}%, L2: {p.commissionSettings.level2Percentage}%, L3: {p.commissionSettings.level3Percentage}%)</p>
                            <p>Shopkeeper: <strong className="text-blue-700">{formatNPR(p.commissionSettings.shopkeeperCommissionValue)}</strong></p>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-semibold italic">Requires commission configuration</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => openConfigurator(p)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                            title="Configure Commissions & Approve"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>{p.status === 'approved' ? 'Edit Settings' : 'Configure & Approve'}</span>
                          </button>

                          {p.status === 'pending_approval' && (
                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setRejectModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                              title="Reject Product"
                            >
                              Reject
                            </button>
                          )}

                          {p.status !== 'pending_approval' && (
                            <button
                              onClick={() => handleToggleStatus(p.id)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
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
        )}
      </div>

      {/* Commission Configuration & Validation Modal */}
      {configModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 bg-amber-50/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Admin Commission Engine
                </span>
                <h3 className="font-black text-slate-950 text-lg mt-1">
                  Configure Commissions: {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500">Merchant: {selectedProduct.shopName}</p>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Cost & Selling Price Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-4">
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
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Available Gross Margin:</span>
                  <strong className={`text-base font-black ${grossMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatNPR(grossMargin)}
                  </strong>
                </div>
              </div>

              {/* Commission Distribution Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Customer Cashback */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>1. Customer Cashback</span>
                    </span>
                    <span className="font-bold text-emerald-700 text-xs">
                      = {formatNPR(calcCashbackNpr)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={customerCashbackType}
                      onChange={(e) => setCustomerCashbackType(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Price</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={customerCashbackValue}
                      onChange={(e) => setCustomerCashbackValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Value"
                    />
                  </div>
                </div>

                {/* 2. Shopkeeper Commission */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>2. Shopkeeper Commission</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs">
                      = {formatNPR(calcShopkeeperCommNpr)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={shopkeeperCommissionType}
                      onChange={(e) => setShopkeeperCommissionType(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Price</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={shopkeeperCommissionValue}
                      onChange={(e) => setShopkeeperCommissionValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Value"
                    />
                  </div>
                </div>

                {/* 3. Referral Commission Pool & 3 Levels */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span>3. Referral Commission Pool Base & 3 Levels</span>
                    </span>
                    <span className="font-bold text-purple-700 text-xs">
                      Pool Total = {formatNPR(calcReferralPoolNpr)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={referralPoolType}
                      onChange={(e) => setReferralPoolType(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold"
                    >
                      <option value="fixed">Fixed NPR</option>
                      <option value="percentage">% of Margin</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={referralPoolValue}
                      onChange={(e) => setReferralPoolValue(Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 font-bold focus:outline-none focus:border-amber-400"
                      placeholder="Pool Value"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Distribution of Referral Pool across 3 Levels (Must not exceed 100%):
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 1 Direct (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level1Percentage}
                        onChange={(e) => setLevel1Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1">
                        = {formatNPR(calcL1Npr)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 2 Tier 2 (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level2Percentage}
                        onChange={(e) => setLevel2Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1">
                        = {formatNPR(calcL2Npr)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Level 3 Tier 3 (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level3Percentage}
                        onChange={(e) => setLevel3Percentage(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded border border-slate-300 font-bold bg-white"
                      />
                      <span className="text-[10px] text-purple-700 font-bold block mt-1">
                        = {formatNPR(calcL3Npr)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Company Share & Expenses */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
                  <span className="font-extrabold text-slate-900 block">4. Company Share (NPR)</span>
                  <input
                    type="number"
                    min="0"
                    value={companyShareNpr}
                    onChange={(e) => setCompanyShareNpr(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-bold"
                  />
                  <p className="text-[10px] text-slate-400">Retained revenue for operational growth</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
                  <span className="font-extrabold text-slate-900 block">5. Permitted Expenses (NPR)</span>
                  <input
                    type="number"
                    min="0"
                    value={permittedExpensesNpr}
                    onChange={(e) => setPermittedExpensesNpr(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-bold"
                  />
                  <p className="text-[10px] text-slate-400">Payment gateway fees, packaging, handling</p>
                </div>
              </div>

              {/* LIVE CALCULATION & MARGIN AUDIT PREVIEW */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isValidConfiguration ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
                    {isValidConfiguration ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>Financial Distribution Audit & Margin Check</span>
                  </span>
                  <span className="font-black text-sm font-mono">
                    {totalPromisedDistributionNpr} / {grossMargin} NPR
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>Cashback: <strong>{formatNPR(calcCashbackNpr)}</strong></div>
                  <div>Referral Pool: <strong>{formatNPR(calcReferralPoolNpr)}</strong></div>
                  <div>Shopkeeper Comm: <strong>{formatNPR(calcShopkeeperCommNpr)}</strong></div>
                  <div>Expenses + Company: <strong>{formatNPR(permittedExpensesNpr + companyShareNpr)}</strong></div>
                </div>

                <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-xs">
                  <div>
                    {isOverAllocated && (
                      <p className="text-red-700 font-bold">
                        ❌ REJECTED: Total promised distribution (NPR {totalPromisedDistributionNpr}) exceeds available margin (NPR {grossMargin}) by NPR {totalPromisedDistributionNpr - grossMargin}!
                      </p>
                    )}
                    {isReferralOver100 && (
                      <p className="text-red-700 font-bold">
                        ❌ REJECTED: Referral tier percentages total {level1Percentage + level2Percentage + level3Percentage}%, exceeding 100%!
                      </p>
                    )}
                    {isValidConfiguration && (
                      <p className="text-emerald-800 font-bold">
                        ✓ Balanced: Distribution fits within margin. Unallocated company safety buffer: NPR {grossMargin - totalPromisedDistributionNpr}.
                      </p>
                    )}
                  </div>
                  <div className="text-right font-black text-sm">
                    Net Margin: {formatNPR(grossMargin - totalPromisedDistributionNpr + companyShareNpr)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Changes apply only to future sales. Past sales retain their immutable snapshots.
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCommissionAndApprove}
                  disabled={saving || !isValidConfiguration}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-40"
                >
                  {saving ? 'Validating & Saving...' : 'Approve & Save Financial Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
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
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold"
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

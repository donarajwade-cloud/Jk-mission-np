import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { CashbackCoupon, CashbackCouponRule, User } from '../../types/index.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  Ticket,
  Save,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gift,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<CashbackCoupon[]>([]);
  const [rule, setRule] = useState<CashbackCouponRule>({
    id: 'rule_cb_default',
    enabled: true,
    title: '3-Level Purchase Cashback Coupon Engine',
    level1Percentage: 10,
    level2Percentage: 15,
    level3Percentage: 20,
    level1MinSpendNpr: 0,
    level2MinSpendNpr: 1000,
    level3MinSpendNpr: 2500,
    validityDays: 30,
    minOrderToApplyNpr: 200,
    maxDiscountNpr: 1000,
    updatedAt: new Date().toISOString()
  });

  const [stats, setStats] = useState({
    totalIssued: 0,
    availableCount: 0,
    usedCount: 0,
    totalSavedNpr: 0
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');

  // Custom Coupon Modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [targetUserId, setTargetUserId] = useState('all');
  const [customLevel, setCustomLevel] = useState<1 | 2 | 3>(1);
  const [customPercentage, setCustomPercentage] = useState(15);
  const [customValidity, setCustomValidity] = useState(30);
  const [customMinOrder, setCustomMinOrder] = useState(200);
  const [customCode, setCustomCode] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getAdminCouponsList();
      if (res.success) {
        setCoupons(res.coupons || []);
        if (res.rule) setRule(res.rule);
        if (res.stats) setStats(res.stats);
      }

      // Load customers for custom coupon recipient dropdown
      const custRes = await api.getAdminCustomers();
      if (custRes.success) {
        setCustomers(custRes.customers || []);
      }
    } catch (err) {
      console.error('Failed to load admin coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateAdminCouponRules(rule);
      if (res.success) {
        setRule(res.rule);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update coupon rules');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateCustomCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLoading(true);
    try {
      const res = await api.createCustomCoupon({
        targetUserId,
        discountPercentage: Number(customPercentage),
        level: customLevel,
        validityDays: Number(customValidity),
        minOrderAmountNpr: Number(customMinOrder),
        customCode: customCode.trim() || undefined
      });
      if (res.success) {
        alert(res.message);
        setCustomModalOpen(false);
        setCustomCode('');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue coupon');
    } finally {
      setCustomLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(q);
      const userMatch = (c.userName || '').toLowerCase().includes(q) || (c.userMobile || '').includes(q);
      const orderMatch = (c.sourceOrderNumber || '').toLowerCase().includes(q);
      return codeMatch || userMatch || orderMatch;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Automated Reward Architecture
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            3-Level Cashback Coupons Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automatic percentage cashback coupons awarded to customers upon product purchase for their next orders.
          </p>
        </div>

        <button
          onClick={() => setCustomModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Custom Coupon</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Coupons Issued</span>
          <p className="text-2xl font-black text-slate-900">{stats.totalIssued}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Active Available</span>
          <p className="text-2xl font-black text-emerald-600">{stats.availableCount}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-blue-600 font-bold uppercase block">Redeemed on Orders</span>
          <p className="text-2xl font-black text-blue-600">{stats.usedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-amber-700 font-bold uppercase block">Customer Savings</span>
          <p className="text-2xl font-black text-amber-600">{formatNPR(stats.totalSavedNpr)}</p>
        </div>
      </div>

      {/* Section 1: 3-Level Rules Configuration Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
              <Sliders className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Admin 3-Level Coupon Rule Settings</h2>
              <p className="text-xs text-slate-500">Define the exact discount percentages and qualification tiers for automatic coupon generation</p>
            </div>
          </div>

          <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) => setRule({ ...rule, enabled: e.target.checked })}
              className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-800">
              {rule.enabled ? 'Automatic Issuance ON' : 'Automatic Issuance PAUSED'}
            </span>
          </label>
        </div>

        <form onSubmit={handleSaveRule} className="space-y-6">
          {/* 3 Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold text-[10px] uppercase">
                  Level 1 Tier
                </span>
                <span className="text-xs font-bold text-slate-500">Initial / Entry</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={rule.level1Percentage}
                    onChange={(e) => setRule({ ...rule, level1Percentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order to Unlock (NPR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={rule.level1MinSpendNpr}
                  onChange={(e) => setRule({ ...rule, level1MinSpendNpr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  placeholder="0"
                />
                <p className="text-[10px] text-slate-400 mt-1">Orders up to Level 2 threshold qualify for Level 1 coupon</p>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[10px] uppercase">
                  Level 2 Tier
                </span>
                <span className="text-xs font-bold text-slate-500">Medium Tier</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={rule.level2Percentage}
                    onChange={(e) => setRule({ ...rule, level2Percentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order to Unlock (NPR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={rule.level2MinSpendNpr}
                  onChange={(e) => setRule({ ...rule, level2MinSpendNpr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  placeholder="1000"
                />
                <p className="text-[10px] text-slate-400 mt-1">Orders ≥ NPR {rule.level2MinSpendNpr} qualify for Level 2 coupon</p>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-purple-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px] uppercase">
                  Level 3 Tier
                </span>
                <span className="text-xs font-bold text-slate-500">Premium / High Value</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={rule.level3Percentage}
                    onChange={(e) => setRule({ ...rule, level3Percentage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order to Unlock (NPR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={rule.level3MinSpendNpr}
                  onChange={(e) => setRule({ ...rule, level3MinSpendNpr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  placeholder="2500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Orders ≥ NPR {rule.level3MinSpendNpr} qualify for Level 3 coupon</p>
              </div>
            </div>
          </div>

          {/* General Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Validity (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={rule.validityDays}
                onChange={(e) => setRule({ ...rule, validityDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400">e.g. 30 days before coupon expires</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Total to Redeem (NPR)</label>
              <input
                type="number"
                min="0"
                required
                value={rule.minOrderToApplyNpr}
                onChange={(e) => setRule({ ...rule, minOrderToApplyNpr: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400">Cart minimum to apply the coupon</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Discount Cap (NPR)</label>
              <input
                type="number"
                min="0"
                value={rule.maxDiscountNpr || 1000}
                onChange={(e) => setRule({ ...rule, maxDiscountNpr: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400">Cap max rupee discount (safety margin)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Rule settings saved successfully! Automatic coupon generation updated.</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs flex items-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving Rules...' : 'Save 3-Level Rules'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Issued Coupons Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">All Issued Cashback Coupons</h3>
            <p className="text-xs text-slate-500">Track automatic and custom coupons awarded across the platform</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, customer, order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400 w-52 sm:w-64"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {(['all', 'available', 'used', 'expired'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    statusFilter === st ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No coupons match your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Level & Discount</th>
                  <th className="py-3 px-4">Trigger / Source Order</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Status & Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{c.userName || 'Customer'}</p>
                      <span className="font-mono text-[10px] text-slate-500">{formatNepalMobile(c.userMobile)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black mr-1 ${
                        c.level === 3 ? 'bg-purple-100 text-purple-900' : c.level === 2 ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        Level {c.level}
                      </span>
                      <strong className="text-amber-600 font-black text-sm">{c.discountPercentage}% OFF</strong>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 font-bold">#{c.sourceOrderNumber || 'N/A'}</span>
                      <p className="text-[10px] text-slate-400">{formatNepaliDate(c.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600">Until {formatNepaliDate(c.expiresAt)}</span>
                      <p className="text-[10px] text-slate-400">Min order: NPR {c.minOrderAmountNpr}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        c.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'used'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                      {c.status === 'used' && c.usedInOrderNumber && (
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          Order #{c.usedInOrderNumber} (Saved NPR {c.discountAppliedNpr})
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Coupon Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Admin Action
                </span>
                <h3 className="font-black text-slate-950 text-base mt-1">Issue Custom Cashback Coupon</h3>
              </div>
              <button
                onClick={() => setCustomModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Customer</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="all">⭐ All Registered Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatNepalMobile(c.mobile)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level Tier</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={1}>Level 1 Tier</option>
                    <option value={2}>Level 2 Tier</option>
                    <option value={3}>Level 3 Tier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customValidity}
                    onChange={(e) => setCustomValidity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (NPR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={customMinOrder}
                    onChange={(e) => setCustomMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VIP25-FESTIVE (leave blank for auto code)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400 uppercase"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customLoading}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{customLoading ? 'Creating...' : 'Issue Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

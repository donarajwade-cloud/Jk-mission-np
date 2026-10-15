import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import {
  Store,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  CreditCard,
  Wifi
} from 'lucide-react';

interface ShopkeeperDashboardProps {
  onNavigate: (view: string, param?: string) => void;
}

export const ShopkeeperDashboard: React.FC<ShopkeeperDashboardProps> = ({ onNavigate }) => {
  const { user, shop, shopkeeperWallet } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(shopkeeperWallet);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [prodRes, ordRes, walRes] = await Promise.all([
          api.getMySubmissions(),
          api.getShopOrders(),
          api.getShopkeeperWallet()
        ]);
        if (prodRes.success) setProducts(prodRes.products);
        if (ordRes.success) setOrders(ordRes.orders);
        if (walRes.success) setWallet(walRes.wallet);
      } catch (err: any) {
        console.warn('Could not load shopkeeper dashboard data:', err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const approvedProds = products.filter(p => p.status === 'approved');
  const pendingProds = products.filter(p => p.status === 'pending_approval');
  const lowStockProds = products.filter(p => p.stockQuantity <= p.lowStockThreshold);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-6 sm:p-8 border border-amber-300 text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
            Verified Merchant Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            {shop?.name || user?.name}
          </h1>
          <p className="text-xs text-slate-800 font-medium">
            Location: {shop?.address}, {shop?.district} • Status: {shop?.isOpen ? 'Active & Open' : 'Pending Verification'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('shopkeeper-products')}
          className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center space-x-2 shadow-md transition-all self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Product</span>
        </button>
      </div>

      {/* Pending Account Review Banner */}
      {(!shop?.isOpen || user?.status === 'pending') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-xs text-amber-950 shadow-xs animate-in fade-in">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-black text-amber-900 text-xs">
              Merchant Application Submitted &amp; Pending Admin Approval
            </h4>
            <p className="text-amber-800 leading-snug">
              Your store registration details have been sent to the Master Administrator for verification. You can start submitting your products right away using &quot;Submit New Product&quot;. Once the admin approves your application and configures product commissions, your shop and products will automatically go live.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Merchant Commission Digital Card Summary */}
        <div 
          onClick={() => onNavigate('shopkeeper-wallet')}
          className="bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 p-6 rounded-3xl border border-sky-400/30 shadow-lg text-white space-y-2 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-sky-300">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-3.5 rounded-xs bg-amber-400/80 border border-amber-200/50" />
              <span className="text-[10px] font-black uppercase tracking-wider">Merchant Card</span>
            </div>
            <Wifi className="w-3.5 h-3.5 rotate-90 text-sky-400/70" />
          </div>
          <p className="text-2xl font-black text-white">{formatNPR(wallet?.availableCommissionNpr)}</p>
          <div className="flex items-center justify-between text-[11px] text-sky-200/70 pt-1 border-t border-white/10">
            <span>Earned: {formatNPR(wallet?.totalEarnedNpr)}</span>
            <span className="text-amber-300 font-bold group-hover:underline">Manage Card &rarr;</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Products</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-950">{approvedProds.length}</p>
          <p className="text-[11px] text-slate-500">Active for online buyers</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-950">{pendingProds.length}</p>
          <p className="text-[11px] text-slate-500">Awaiting Admin commission review</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-950">{orders.length}</p>
          <p className="text-[11px] text-slate-500">Orders containing your products</p>
        </div>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {lowStockProds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Low Stock Alert: </strong>
              {lowStockProds.length} product(s) have fallen below their minimum stock threshold. Update inventory to avoid missing sales.
            </span>
          </div>
          <button
            onClick={() => onNavigate('shopkeeper-inventory')}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-500 shrink-0"
          >
            Update Inventory
          </button>
        </div>
      )}

      {/* Navigation Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('shopkeeper-products')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Product Submissions</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submit new items with cost, SKU, and specifications. Products go live once approved with admin-calculated commissions.
          </p>
        </div>

        <div
          onClick={() => onNavigate('shopkeeper-inventory')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Inventory Management</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monitor real-time product quantities, set low-stock thresholds, and update supplies seamlessly.
          </p>
        </div>

        <div
          onClick={() => onNavigate('shopkeeper-wallet')}
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Commission Wallet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Track sales commissions earned from eligible completed sales and request manual bank/wallet disbursements.
          </p>
        </div>
      </div>
    </div>
  );
};

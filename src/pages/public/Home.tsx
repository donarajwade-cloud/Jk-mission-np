import React, { useState, useEffect } from 'react';
import { Product, Shop } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShoppingBag,
  Award,
  Users,
  Store,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  LogIn,
  LogOut
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectProduct }) => {
  const { user, role, customerWallet, addToCart, login, logout } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoLoginLoading, setDemoLoginLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, shopRes] = await Promise.all([
          api.getProducts(),
          api.getShops()
        ]);
        if (prodRes.success) {
          setFeaturedProducts(prodRes.products.slice(0, 4));
        }
        if (shopRes.success) {
          setShops(shopRes.shops.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickDemoLogin = async (mobile: string, pass: string, label: string) => {
    setDemoLoginLoading(label);
    try {
      const res = await login(mobile, pass);
      if (res.success) {
        if (label === 'Admin') onNavigate('admin-dashboard');
        else if (label === 'Shopkeeper') onNavigate('shopkeeper-dashboard');
        else onNavigate('customer-dashboard');
      }
    } catch {}
    setDemoLoginLoading(null);
  };

  const faqs = [
    {
      q: 'How is customer cashback calculated and credited?',
      a: 'Customer cashback is configured per product by JK Mission administrators. When you complete an order from a verified shop, eligible cashback is automatically and safely credited to your dedicated Customer Cashback Wallet.'
    },
    {
      q: 'How does the 3-Level Referral Commission work?',
      a: 'Your verified mobile number (+977...) serves as your permanent Referral ID. When friends register using your number, they become your Level 1 referrals. When they refer others, those become Level 2, and the next become Level 3. Whenever someone in your 3-level team buys a qualifying product, you earn a percentage from the product\'s designated referral commission pool.'
    },
    {
      q: 'Are commissions generated just by inviting users or registering?',
      a: 'No. JK Mission Nepal strictly prohibits commission generation on registration or mere invites. Commissions are generated exclusively upon completed and verified physical/retail product sales.'
    },
    {
      q: 'Can shopkeepers set their own commissions?',
      a: 'No. Shopkeepers submit products with their cost and proposed selling price. Only authorized JK Mission administrators can configure and approve product cashback, referral pools, and shopkeeper commissions to prevent deficits and protect consumers.'
    },
    {
      q: 'How are manual withdrawals and 15-day settlements processed?',
      a: 'Users can request withdrawals to eSewa, Khalti, or Commercial Bank Transfer from their available income balance. Requests are reviewed and manually disbursed by the Administrator with full payment reference proof on a 15-day settlement reporting schedule.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-200/70 border border-amber-300 text-slate-900 text-xs font-black tracking-wide shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>OFFICIAL NEPAL RETAIL & CASHBACK PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Shop Smart. <span className="text-amber-500 underline decoration-amber-300 underline-offset-4">Save More.</span> Grow Together.
              </h1>

              <p className="text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed font-medium mx-auto lg:mx-0">
                Discover products from participating shops, receive eligible cashback on purchases, and earn referral commissions from qualifying product sales under the platform&apos;s published rules.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center space-x-2 shadow-lg shadow-amber-300/50 hover:shadow-xl transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!user ? (
                  <>
                    <button
                      onClick={() => onNavigate('register-customer')}
                      className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-sm shadow-md transition-all"
                    >
                      Join as Customer
                    </button>

                    <button
                      onClick={() => onNavigate('register-shopkeeper')}
                      className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-sm transition-all"
                    >
                      Register as Shopkeeper
                    </button>

                    <button
                      onClick={() => onNavigate('login')}
                      className="px-4 py-3.5 rounded-2xl text-slate-700 hover:text-slate-950 font-bold text-sm flex items-center space-x-1.5 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-amber-600" />
                      <span>Login Portal</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (role === 'admin') onNavigate('admin-dashboard');
                        else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                        else onNavigate('customer-dashboard');
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-sm shadow-md transition-all flex items-center space-x-2"
                    >
                      <span>Go to {role === 'admin' ? 'Admin Portal' : role === 'shopkeeper' ? 'Shopkeeper Hub' : 'My Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {role === 'customer' && (
                      <button
                        onClick={() => onNavigate('customer-wallets')}
                        className="px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-slate-900 font-bold text-sm transition-all flex items-center space-x-1.5 shadow-xs"
                      >
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>My Wallets</span>
                      </button>
                    )}

                    {role === 'shopkeeper' && (
                      <button
                        onClick={() => onNavigate('shopkeeper-wallet')}
                        className="px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-slate-900 font-bold text-sm transition-all flex items-center space-x-1.5 shadow-xs"
                      >
                        <Store className="w-4 h-4 text-blue-600" />
                        <span>Commission Wallet</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-amber-200/60 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div className="space-y-0.5">
                  <p className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">100%</p>
                  <p className="text-[11px] font-semibold text-slate-600">NPR Currency</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">3-Level</p>
                  <p className="text-[11px] font-semibold text-slate-600">Referral Team</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">15-Day</p>
                  <p className="text-[11px] font-semibold text-slate-600">Settlement Cycle</p>
                </div>
              </div>
            </div>

            {/* Right Card: User Session Summary (Logged In) OR Demo Switcher (Logged Out) */}
            <div className="lg:col-span-5">
              {user ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400/80 relative">
                  <div className="absolute -top-3.5 right-6 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                    <span>Active Session</span>
                  </div>

                  <div className="flex items-center space-x-3 mb-4 pt-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white leading-tight">
                          {user.name}
                        </h3>
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {user.mobile}
                      </p>
                    </div>
                  </div>

                  {/* Role Specific Summary */}
                  {role === 'customer' && (
                    <div className="space-y-3 mb-5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Cashback Wallet
                          </span>
                          <p className="text-base font-black text-white mt-1">
                            {customerWallet ? formatNPR(customerWallet.cashbackAvailableNpr) : 'रु 0.00'}
                          </p>
                        </div>
                        <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Income Wallet
                          </span>
                          <p className="text-base font-black text-white mt-1">
                            {customerWallet ? formatNPR(customerWallet.incomeAvailableNpr) : 'रु 0.00'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Your Sponsor Referral ID</span>
                        <span className="font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {user.referralId || user.mobile}
                        </span>
                      </div>
                    </div>
                  )}

                  {role === 'shopkeeper' && (
                    <div className="space-y-3 mb-5">
                      <div className="bg-blue-950/60 border border-blue-500/40 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" /> Merchant Partner
                        </span>
                        <p className="text-sm font-black text-white mt-1">
                          Verified Shopkeeper Account
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Manage product inventory, track customer orders, and withdraw sales commissions.
                        </p>
                      </div>
                    </div>
                  )}

                  {role === 'admin' && (
                    <div className="space-y-3 mb-5">
                      <div className="bg-purple-950/60 border border-purple-500/40 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Platform Administrator
                        </span>
                        <p className="text-sm font-black text-white mt-1">
                          Super Admin Authority
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Audit trees, approve merchants & products, manage 15-day settlement payouts.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links for Logged in User */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        if (role === 'admin') onNavigate('admin-dashboard');
                        else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                        else onNavigate('customer-dashboard');
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-md"
                    >
                      <span>Open {role === 'admin' ? 'Admin Portal' : role === 'shopkeeper' ? 'Shopkeeper Hub' : 'Customer Dashboard'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {role === 'customer' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigate('customer-wallets')}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors text-center"
                        >
                          Digital Wallets
                        </button>
                        <button
                          onClick={() => onNavigate('customer-orders')}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors text-center"
                        >
                          My Orders
                        </button>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>JK Mission Nepal</span>
                      <button
                        onClick={logout}
                        className="text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-300/80 relative">
                  <div className="absolute -top-3.5 right-6 bg-slate-950 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ready Access</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    1-Click Test Role Access
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Try out each role immediately to test the three distinct dashboards:
                  </p>

                  <div className="space-y-3">
                    {/* Admin Button */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <h4 className="text-xs font-bold text-slate-900">Admin Control Panel</h4>
                        </div>
                        <p className="text-[11px] text-slate-500">Manage commissions, approvals, ledger & settlements</p>
                        <p className="text-[10px] font-mono text-slate-400">+977 9800000000</p>
                      </div>
                      <button
                        onClick={() => handleQuickDemoLogin('+9779800000000', 'Admin@123JK', 'Admin')}
                        disabled={demoLoginLoading !== null}
                        className="px-3 py-2 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
                      >
                        {demoLoginLoading === 'Admin' ? 'Entering...' : 'Open Admin'}
                      </button>
                    </div>

                    {/* Shopkeeper Button */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <h4 className="text-xs font-bold text-slate-900">Shopkeeper Hub</h4>
                        </div>
                        <p className="text-[11px] text-slate-500">Inventory, submit products, track sales</p>
                        <p className="text-[10px] font-mono text-slate-400">+977 9811111111</p>
                      </div>
                      <button
                        onClick={() => handleQuickDemoLogin('+9779811111111', 'Shopkeeper@123', 'Shopkeeper')}
                        disabled={demoLoginLoading !== null}
                        className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-500 transition-colors shrink-0"
                      >
                        {demoLoginLoading === 'Shopkeeper' ? 'Entering...' : 'Open Shop'}
                      </button>
                    </div>

                    {/* Customer Button */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <h4 className="text-xs font-bold text-slate-900">Customer 1 (Aarav - Sponsor)</h4>
                        </div>
                        <p className="text-[11px] text-slate-500">Cashback wallet & 3-level team leader</p>
                        <p className="text-[10px] font-mono text-slate-400">+977 9822222222</p>
                      </div>
                      <button
                        onClick={() => handleQuickDemoLogin('+9779822222222', 'Customer@123', 'Customer')}
                        disabled={demoLoginLoading !== null}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
                      >
                        {demoLoginLoading === 'Customer' ? 'Entering...' : 'Open Customer'}
                      </button>
                    </div>

                    {/* Downline Customer 2 Button */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Customer 2 (Pooja - Level 1)</span>
                        <p className="text-[10px] text-slate-400">+977 9833333333</p>
                      </div>
                      <button
                        onClick={() => handleQuickDemoLogin('+9779833333333', 'Customer@123', 'Customer2')}
                        disabled={demoLoginLoading !== null}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold"
                      >
                        Login L1
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Server-side password hashing with bcrypt</span>
                    <span className="font-bold text-slate-700">JWT Sessions</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Participating Products</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Featured Nepali Products with Cashback
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1 group"
          >
            <span>View All Catalog Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-3xl border border-slate-200/80 hover:border-amber-400 p-4 transition-all hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Cashback badge */}
                    {p.commissionSettings && (
                      <div className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>
                          {p.commissionSettings.customerCashbackType === 'percentage'
                            ? `${p.commissionSettings.customerCashbackValue}% Cashback`
                            : `${formatNPR(p.commissionSettings.customerCashbackValue)} Cashback`}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Stock: {p.stockQuantity}
                    </div>
                  </div>

                  <p className="text-[11px] font-bold text-amber-700 truncate">{p.shopName}</p>
                  <h3
                    onClick={() => onSelectProduct(p.id)}
                    className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-amber-600 cursor-pointer mt-0.5"
                  >
                    {p.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Selling Price</span>
                    <span className="text-base font-black text-slate-950">
                      {formatNPR(p.finalSellingPriceNpr)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-xs"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How Cashback Works (3 Steps) */}
      <section className="bg-amber-50/50 py-16 border-y border-amber-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
              Transparent Customer Savings
            </span>
            <h2 className="text-3xl font-black text-slate-950 mt-1">
              How Real Cashback Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              No points confusion or hidden conversions. Every eligible product displays verified NPR cashback approved directly by JK Mission administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-amber-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Shop Participating Products</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse authentic items from verified Nepali shopkeepers. The product card displays the exact NPR cashback that will be credited.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-amber-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Order Completed & Verified</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When payment is verified and the order completes, our transactional backend executes atomic distribution exactly once.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-amber-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cashback Wallet Credited</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your dedicated Cashback Wallet reflects the NPR balance instantly. Cashback is kept separate from referral income for complete financial clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Level Referral Engine Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                Built-in Referral Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Earn Transparent Commissions up to 3 Levels
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your verified mobile number with Nepal code (<span className="text-amber-300 font-mono">+977</span>) is your permanent Referral ID. Whenever people in your 3-level tree purchase qualified products, earn commissions derived from the product&apos;s authorized referral pool.
              </p>

              {/* Levels visual */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-amber-400 font-bold block mb-1">Level 1 (Direct)</span>
                  <p className="text-2xl font-black text-white">15%</p>
                  <p className="text-[10px] text-slate-400 mt-1">of Referral Pool</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-amber-400 font-bold block mb-1">Level 2 (Tier 2)</span>
                  <p className="text-2xl font-black text-white">10%</p>
                  <p className="text-[10px] text-slate-400 mt-1">of Referral Pool</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-amber-400 font-bold block mb-1">Level 3 (Tier 3)</span>
                  <p className="text-2xl font-black text-white">5%</p>
                  <p className="text-[10px] text-slate-400 mt-1">of Referral Pool</p>
                </div>
              </div>

              <div className="pt-2 text-xs text-amber-200/80 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Default percentages editable per product by Admin. Applied to referral pool, not gross sale.</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-xs space-y-4">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                Example Calculation on a Real Product
              </h3>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Product Selling Price:</span>
                  <strong className="text-white">NPR 1,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Product Cost & Expenses:</span>
                  <strong className="text-white">NPR 650</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span>Gross Margin:</span>
                  <strong className="text-amber-400">NPR 350</strong>
                </div>
                <div className="flex justify-between">
                  <span>Customer Cashback:</span>
                  <strong className="text-emerald-400">NPR 50</strong>
                </div>
                <div className="flex justify-between">
                  <span>Configured Referral Pool:</span>
                  <strong className="text-amber-300">NPR 100</strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Level 1 (50% of pool):</span>
                    <strong className="text-amber-400">NPR 50</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Level 2 (30% of pool):</span>
                    <strong className="text-amber-400">NPR 30</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Level 3 (20% of pool):</span>
                    <strong className="text-amber-400">NPR 20</strong>
                  </div>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Total promised distribution:</span>
                  <span>Never exceeds available margin!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participating Shops Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>Registered Merchants</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Participating Shops Across Nepal
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shops')}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1"
          >
            <span>View All Registered Shops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shops.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <img
                  src={s.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                  alt={s.name}
                  className="w-full h-40 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {s.district}
                  </span>
                  <span className="text-xs font-bold text-slate-700">★ {s.rating}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                <p className="text-xs text-slate-400 mt-2">{s.address}, {s.municipality}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onNavigate('shops')}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-amber-100/70 text-slate-800 text-xs font-bold transition-colors"
                >
                  View Merchant Products
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-amber-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-amber-50/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

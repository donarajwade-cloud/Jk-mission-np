import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Filter,
  Check,
  Truck,
  Percent,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectProduct }) => {
  const { user, role, addToCart } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'cashback'>('featured');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, shopRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getShops(),
          api.getCategories()
        ]);
        if (prodRes.success) {
          setProducts(prodRes.products);
        }
        if (shopRes.success) {
          setShops(shopRes.shops);
        }
        if (catRes.success) {
          setCategories(['All', ...catRes.categories]);
        }
      } catch (err) {
        console.error('Failed to load shopping page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addToCart(p, 1);
    setAddedItemIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  // Filter and sort products for interactive shopping catalog
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shopName?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.finalSellingPriceNpr - b.finalSellingPriceNpr);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.finalSellingPriceNpr - a.finalSellingPriceNpr);
    } else if (sortBy === 'cashback') {
      result.sort((a, b) => {
        const cbA = a.commissionSettings?.customerCashbackValue || 0;
        const cbB = b.commissionSettings?.customerCashbackValue || 0;
        return cbB - cbA;
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const faqs = [
    {
      q: 'How do I shop and receive customer cashback?',
      a: 'Simply choose any product from our verified merchant catalog, add it to your cart, and place your order. Once your delivery and order are completed, your eligible NPR cashback is directly and safely credited to your Customer Cashback Wallet.'
    },
    {
      q: 'How does the 3-Level Referral Program work?',
      a: 'Your registered mobile number is your permanent Referral ID. When friends register with your number, they join your Level 1 downline. When they invite others, those become Level 2 and Level 3. Whenever anyone in your 3-level team buys qualifying products, you earn referral commissions from the approved product pool.'
    },
    {
      q: 'How can local shopkeepers sell on JK Mission?',
      a: 'Shopkeepers can click "Become a Shopkeeper" in the header to register their business. Once approved by our team, you can list items, manage inventory, track customer sales, and withdraw your earned margins with guaranteed 15-day settlement cycles.'
    },
    {
      q: 'Which payment methods are supported for withdrawals?',
      a: 'You can withdraw your wallet earnings directly via eSewa, Khalti, or Commercial Bank Transfer across Nepal. All settlements are processed transparently with transaction reference proof.'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Shopping Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/70 via-amber-50/40 to-white pt-8 sm:pt-10 pb-12 sm:pb-14 px-3 sm:px-6 lg:px-8 border-b border-amber-200/60">
        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-200/80 border border-amber-300 text-slate-950 text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>OFFICIAL SMART RETAIL & CASHBACK PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
              Shop Smart. <span className="text-amber-500 underline decoration-amber-300 underline-offset-4">Get Real Cashback.</span> Support Local Shops.
            </h1>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium max-w-2xl mx-auto">
              Discover authentic products from registered merchants, enjoy verified NPR cashback credited directly to your wallet, and earn 3-level team commissions on qualifying sales.
            </p>
          </div>

          {/* Primary Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl shadow-amber-900/5 border-2 border-amber-300/80 focus-within:border-amber-500 transition-all">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, groceries, tea, spices, apparel..."
                className="w-full py-2.5 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-700 mr-2"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {
                  const el = document.getElementById('shopping-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-sm transition-all"
              >
                Find Items
              </button>
            </div>
          </div>

          {/* Shopping Value Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-950">Real Cashback</p>
                <p className="text-[11px] text-slate-500">Credited directly in NPR</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-950">Verified Shops</p>
                <p className="text-[11px] text-slate-500">Authentic local products</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-950">3-Level Rewards</p>
                <p className="text-[11px] text-slate-500">Earn with your community</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-950">Easy Orders</p>
                <p className="text-[11px] text-slate-500">Fast delivery & support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Spotlight Cards */}
      <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                Instant Cashback
              </span>
              <h3 className="text-xl font-black text-slate-950 leading-tight">
                Save on Every Order
              </h3>
              <p className="text-xs text-slate-900 font-medium">
                Get up to 15% cashback credited to your wallet whenever you buy authentic goods.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('products')}
                className="px-4 py-2 rounded-xl bg-slate-950 text-amber-300 hover:bg-slate-900 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>Browse Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                For Shop Owners
              </span>
              <h3 className="text-xl font-black text-white leading-tight">
                Sell on JK Mission
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Reach thousands of active customers, manage sales, and enjoy 15-day settlement payouts.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('register-shopkeeper')}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Register Store</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-white text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Community Earning
              </span>
              <h3 className="text-xl font-black text-white leading-tight">
                3-Level Referral Rewards
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Share your mobile number and earn commissions across 3 tiers of customer product orders.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('referral')}
                className="px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs flex items-center space-x-1.5 transition-colors"
              >
                <span>How Referral Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer & Merchant Direct Portals (User & Shopkeeper) */}
      <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dedicated Portals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Customer & Merchant Portals
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Choose your gateway to shop, earn cashback, build your referral network, or manage your store in Nepal:
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Fast & Secure NPR System</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Customer / User Portal */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    /user
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Customer & Member Portal</h3>
                  <p className="text-[11px] font-mono text-amber-300 font-semibold mt-0.5">
                    https://jkmissionnp.com/user
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Personal dashboard for shoppers, customer cashback tracking, digital coupons & 3-level referral network commissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('customer-dashboard')}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
              >
                <span>Open Customer Portal (/user)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Shopkeeper Portal */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-blue-400/50 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-blue-500 text-white px-2.5 py-0.5 rounded-full">
                    /shopkeeper
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Shopkeeper Merchant Portal</h3>
                  <p className="text-[11px] font-mono text-blue-300 font-semibold mt-0.5">
                    https://jkmissionnp.com/shopkeeper
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Merchant control room to list products, manage inventory stock, confirm orders & withdraw store commissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('shopkeeper-dashboard')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
              >
                <span>Open Shopkeeper Portal (/shopkeeper)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Shopping Catalog */}
      <section id="shopping-catalog" className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Online Marketplace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Featured Products with Cashback
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Real pricing in NPR (रु) with transparent cashback displayed directly on each item card.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="cashback">Highest Cashback</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any items matching &quot;{searchQuery || selectedCategory}&quot;. Try resetting your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredAndSortedProducts.map((p) => {
              const isAdded = addedItemIds[p.id];
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-amber-400 p-3 sm:p-4 transition-all hover:shadow-xl flex flex-col justify-between cursor-pointer relative"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-100">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Prominent Cashback Badge */}
                      {p.commissionSettings && p.commissionSettings.customerCashbackValue > 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1">
                          <Award className="w-3 h-3 text-slate-950" />
                          <span>
                            {p.commissionSettings.customerCashbackType === 'percentage'
                              ? `${p.commissionSettings.customerCashbackValue}% Cashback`
                              : `${formatNPR(p.commissionSettings.customerCashbackValue)} Cashback`}
                          </span>
                        </div>
                      )}

                      {/* Stock indicator */}
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.stockQuantity > 5 ? `Stock: ${p.stockQuantity}` : `Only ${p.stockQuantity} left`}
                      </div>
                    </div>

                    {/* Merchant / Category Info */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-amber-700 truncate max-w-[140px] flex items-center gap-1">
                        <Store className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{p.shopName}</span>
                      </span>
                      <span className="text-slate-400 capitalize">{p.category}</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-amber-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  {/* Pricing & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                        Price
                      </span>
                      <span className="text-base font-black text-slate-950">
                        {formatNPR(p.finalSellingPriceNpr)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-400 hover:bg-amber-500 text-slate-950 hover:shadow-md'
                      }`}
                      title="Add to shopping cart"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>



      {/* How Shopping & Rewards Work (Clean 3-Step) */}
      <section className="bg-amber-50/50 py-12 sm:py-14 border-y border-amber-200/60">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
              Transparent & Simple
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              How You Save and Earn
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Every step is automated, clear, and visible in your customer digital wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Browse & Order</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose quality items from registered local merchants. Check the exact NPR cashback that will be returned to you.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Instant Wallet Credit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upon order completion, cashback is credited straight into your personal Cashback Wallet with full transaction receipts.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">3. 3-Level Community Rewards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invite friends with your mobile number. When they or their referrals shop, you earn extra commissions from the product referral pool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-700 uppercase tracking-wider">
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
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs"
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

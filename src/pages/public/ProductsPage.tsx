import React, { useState, useEffect } from 'react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatNPR } from '../../utils/format.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Search, Award, ShoppingBag, Filter } from 'lucide-react';

interface ProductsPageProps {
  onSelectProduct: (productId: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onSelectProduct }) => {
  const { addToCart } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({
            category: selectedCategory === 'All' ? undefined : selectedCategory,
            search: searchQuery || undefined
          }),
          api.getCategories()
        ]);
        if (prodRes.success) setProducts(prodRes.products);
        if (catRes.success) setCategories(['All', ...catRes.categories]);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Verified Nepali Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            Products with Real Cashback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Shop directly from registered Nepali merchants in NPR currency.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, spices, tea..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 sm:h-80 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No products match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching for other terms or reset the category filter.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-amber-400 p-3 sm:p-4 transition-all hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => onSelectProduct(p.id)}
                  className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-50 cursor-pointer"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
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
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Selling Price</span>
                  <span className="text-base font-black text-slate-950">
                    {formatNPR(p.finalSellingPriceNpr)}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(p, 1)}
                  disabled={p.stockQuantity <= 0}
                  className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-xs disabled:opacity-40"
                  title="Add to cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

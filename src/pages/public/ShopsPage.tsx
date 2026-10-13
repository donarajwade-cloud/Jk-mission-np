import React, { useState, useEffect } from 'react';
import { Shop } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { Store, MapPin, Phone, Star, Search, Filter } from 'lucide-react';

interface ShopsPageProps {
  onSelectShopProducts?: (shopId: string) => void;
}

export const ShopsPage: React.FC<ShopsPageProps> = ({ onSelectShopProducts }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const districts = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Mustang', 'Ilam'];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getShops({
          district: selectedDistrict === 'All' ? undefined : selectedDistrict,
          search: search || undefined
        });
        if (res.success) setShops(res.shops);
      } catch (err) {
        console.error('Failed to load shops:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedDistrict, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Verified Partner Directory
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Participating Shops in Nepal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered merchants approved to sell and offer real customer cashback.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shop name, address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
          />
        </div>
      </div>

      {/* District filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {districts.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDistrict(d)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDistrict === d
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Shops Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No participating shops found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your district filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <img
                  src={s.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                  alt={s.name}
                  className="w-full h-44 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {s.district} • {s.municipality}
                  </span>
                  <span className="text-xs font-bold text-amber-700 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{s.rating}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-mono text-[11px]">{s.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectShopProducts && onSelectShopProducts(s.id)}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
                >
                  Browse Store Items
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

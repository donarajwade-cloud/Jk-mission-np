import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShoppingBag, 
  Award, 
  TrendingUp, 
  CreditCard, 
  Coffee,
  Zap,
  DollarSign,
  Receipt,
  Sparkles,
  Filter
} from 'lucide-react';
import { formatNPR, formatNepaliDate } from '../../utils/format.ts';

export interface TransactionCardItem {
  id: string;
  title: string;
  category?: 'coffee' | 'grocery' | 'utility' | 'salary' | 'subscription' | 'cashback' | 'referral' | 'withdrawal' | 'order' | 'other';
  date: string | number | Date;
  amountNpr: number;
  type: 'credit' | 'debit';
  currencyPrefix?: string;
  orderNumber?: string;
  details?: string;
  status?: string;
}

interface TransactionHistoryCardViewProps {
  transactions: TransactionCardItem[];
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  className?: string;
}

export const TransactionHistoryCardView: React.FC<TransactionHistoryCardViewProps> = ({
  transactions,
  onClose,
  title = 'Transaction History',
  showCloseButton = true,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit' | 'cashback' | 'referral'>('all');

  // Filter transactions based on search and category
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Category filter
      if (selectedFilter === 'credit' && t.type !== 'credit') return false;
      if (selectedFilter === 'debit' && t.type !== 'debit') return false;
      if (selectedFilter === 'cashback' && t.category !== 'cashback') return false;
      if (selectedFilter === 'referral' && t.category !== 'referral') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchOrder = t.orderNumber?.toLowerCase().includes(q);
        const matchDetails = t.details?.toLowerCase().includes(q);
        const matchAmt = String(t.amountNpr).includes(q);
        if (!matchTitle && !matchOrder && !matchDetails && !matchAmt) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedFilter]);

  // Helper to render the rich category illustration / 3D-styled icon
  const renderCategoryIcon = (category?: string, type?: 'credit' | 'debit', title?: string) => {
    const tLower = (title || '').toLowerCase();

    // 1. Coffee / Cafe / Tea
    if (category === 'coffee' || tLower.includes('coffee') || tLower.includes('tea') || tLower.includes('cafe')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FFF6EE] border border-amber-100 flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden group">
          <div className="w-9 h-9 rounded-full bg-amber-100/80 flex items-center justify-center">
            {/* 3D-styled Coffee Cup in Saucer */}
            <svg className="w-6 h-6 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
        </div>
      );
    }

    // 2. Grocery Store / Fresh Mart / Organic
    if (category === 'grocery' || tLower.includes('grocery') || tLower.includes('store') || tLower.includes('market') || tLower.includes('rice') || tLower.includes('spice')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FFF4ED] border border-orange-100 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            {/* Grocery bag with produce illustration */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>
      );
    }

    // 3. Electricity Bill / Utility / Service Fee
    if (category === 'utility' || tLower.includes('bill') || tLower.includes('electricity') || tLower.includes('water') || tLower.includes('fee')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] border border-sky-100 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="m11 15 2-3h-3l2-3" />
            </svg>
          </div>
        </div>
      );
    }

    // 4. Salary / Level Referral Income / Commission
    if (category === 'salary' || category === 'referral' || tLower.includes('salary') || tLower.includes('commission') || tLower.includes('level') || tLower.includes('income')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EDFDF2] border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            {/* Money envelope illustration */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect width="20" height="13" x="2" y="6" rx="2" />
              <path d="m22 7-10 7L2 7" />
              <circle cx="12" cy="13" r="2" />
            </svg>
          </div>
        </div>
      );
    }

    // 5. Subscription Fee / Digital Services
    if (category === 'subscription' || tLower.includes('subscription') || tLower.includes('membership') || tLower.includes('fee')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] border border-pink-100 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      );
    }

    // 6. Cashback Rewards
    if (category === 'cashback' || tLower.includes('cashback') || tLower.includes('reward')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EBFDF5] border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      );
    }

    // 7. Withdrawals / Bank / eSewa Disbursement
    if (category === 'withdrawal' || tLower.includes('withdraw') || tLower.includes('esewa') || tLower.includes('khalti') || tLower.includes('payout')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#F0F5FF] border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      );
    }

    // Default Fallback Icon
    return (
      <div className={`w-12 h-12 rounded-2xl ${type === 'credit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-600 border border-slate-100'} flex items-center justify-center shrink-0 shadow-xs`}>
        {type === 'credit' ? <ArrowDownRight className="w-5 h-5 text-emerald-600" /> : <ShoppingBag className="w-5 h-5 text-slate-600" />}
      </div>
    );
  };

  // Format date cleanly e.g. "2024-09-20"
  const formatCardDate = (rawDate: string | number | Date) => {
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return String(rawDate);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto space-y-4 ${className}`}>
      
      {/* Header with Circular Black (X) Close Button & Title matching Screenshot */}
      <div className="flex items-center space-x-3.5 px-1 py-1">
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center font-bold transition-all shadow-md active:scale-90 shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Prominent Search Bar with Blue Accent Border from Screenshot */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions..."
          className="w-full px-5 py-3.5 sm:py-4 rounded-2xl border-2 border-[#007AFF] bg-white placeholder-slate-400 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100/80 shadow-xs transition-all"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* Filter Chips / Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({transactions.length})
        </button>
        <button
          onClick={() => setSelectedFilter('credit')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedFilter === 'credit'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Credits (+)
        </button>
        <button
          onClick={() => setSelectedFilter('debit')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedFilter === 'debit'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Debits (-)
        </button>
        <button
          onClick={() => setSelectedFilter('cashback')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedFilter === 'cashback'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Cashback
        </button>
        <button
          onClick={() => setSelectedFilter('referral')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedFilter === 'referral'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Referral Bonus
        </button>
      </div>

      {/* Floating Card Stack matching the Screenshot */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No transactions found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? 'Try clearing your search terms' : 'Transactions will automatically record as you shop or earn.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {filtered.map((item) => {
            const isCredit = item.type === 'credit';
            const sign = isCredit ? '+' : '-';
            
            // Format amount matching screenshot: e.g. "-$4.50" or "+$2000.00"
            // For Nepal currency: formatted with NPR or $ as preferred
            const prefix = item.currencyPrefix !== undefined ? item.currencyPrefix : 'रु ';
            const displayAmt = `${sign}${prefix}${Number(item.amountNpr).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm sm:shadow-md border border-slate-100 flex items-center justify-between gap-3.5 transition-all hover:shadow-lg hover:border-slate-200 group"
              >
                {/* Left Side: Icon Illustration + Title + Date */}
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  {renderCategoryIcon(item.category, item.type, item.title)}

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-950 text-sm sm:text-base leading-snug truncate">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 text-xs font-normal mt-0.5">
                      {formatCardDate(item.date)}
                      {item.orderNumber ? ` • #${item.orderNumber}` : ''}
                    </p>
                  </div>
                </div>

                {/* Right Side: Bright Blue Bold Amount matching Screenshot (#007AFF) */}
                <div className="text-right shrink-0">
                  <span className="text-base sm:text-lg font-bold text-[#007AFF] tracking-tight block">
                    {displayAmt}
                  </span>
                  {item.status && (
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

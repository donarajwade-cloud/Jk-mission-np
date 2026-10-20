import React from 'react';
import { formatNPR } from '../../utils/format.ts';
import { 
  Clock, 
  TrendingUp, 
  Award, 
  ShoppingBag, 
  Users, 
  Store, 
  CreditCard,
  ArrowUpRight
} from 'lucide-react';

export interface WalletCardUIProps {
  type?: 'cashback' | 'income' | 'shopkeeper' | 'pending' | 'lifetime' | 'custom';
  title: string;
  subtitle?: string;
  cardHolderName?: string;
  accountOrId?: string;
  balanceNpr: number;
  totalEarnedNpr?: number;
  totalWithdrawnNpr?: number;
  watermark?: 'clock' | 'trending' | 'users' | 'award' | 'store' | 'shopping';
  badge?: string;
  isActive?: boolean;
  onSelect?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}

export const WalletCardUI: React.FC<WalletCardUIProps> = ({
  type = 'custom',
  title,
  subtitle,
  balanceNpr,
  totalWithdrawnNpr,
  watermark,
  isActive = false,
  onSelect,
  onAction,
  actionLabel,
  secondaryAction,
  className = ''
}) => {
  // Determine watermark icon based on watermark prop or type
  const renderWatermark = () => {
    const wm = watermark || (
      type === 'pending' ? 'clock' :
      type === 'lifetime' || type === 'income' ? 'trending' :
      type === 'cashback' ? 'shopping' :
      type === 'shopkeeper' ? 'store' : 'trending'
    );

    if (wm === 'clock') {
      return (
        <Clock 
          className="w-32 h-32 sm:w-36 sm:h-36 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.4]" 
        />
      );
    }
    if (wm === 'trending') {
      return (
        <TrendingUp 
          className="w-36 h-36 sm:w-40 sm:h-40 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.6]" 
        />
      );
    }
    if (wm === 'users') {
      return (
        <Users 
          className="w-32 h-32 sm:w-36 sm:h-36 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.4]" 
        />
      );
    }
    if (wm === 'shopping') {
      return (
        <ShoppingBag 
          className="w-32 h-32 sm:w-36 sm:h-36 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.4]" 
        />
      );
    }
    if (wm === 'store') {
      return (
        <Store 
          className="w-32 h-32 sm:w-36 sm:h-36 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.4]" 
        />
      );
    }
    return (
      <Award 
        className="w-32 h-32 sm:w-36 sm:h-36 absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none stroke-[1.4]" 
      />
    );
  };

  // Format amount cleanly: ₹0 or रु 0
  const formattedAmount = `रु ${Number(balanceNpr || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2
  })}`;

  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border-[2.5px] border-[#FED766] transition-all duration-200 ${
        onSelect ? 'cursor-pointer hover:shadow-md hover:border-amber-400' : ''
      } ${isActive ? 'ring-4 ring-amber-300/40 border-amber-400 shadow-md' : 'shadow-2xs'} ${className}`}
    >
      {/* Background Watermark Icon on the Right matching the Screenshot */}
      {renderWatermark()}

      {/* Content Container */}
      <div className="relative z-10 space-y-2">
        {/* Top Header Label in Uppercase Muted Gray */}
        <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400 leading-tight">
          {title}
        </h3>

        {/* Big Bold Balance Amount */}
        <div className="pt-1">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
            {formattedAmount}
          </span>
        </div>

        {/* Subtitle / Note */}
        {subtitle ? (
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pt-1 max-w-[85%]">
            {subtitle}
          </p>
        ) : totalWithdrawnNpr !== undefined ? (
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pt-1">
            Total Withdrawn: रु {Number(totalWithdrawnNpr || 0).toLocaleString('en-US')}
          </p>
        ) : null}

        {/* Action Controls if Provided */}
        {(onAction || secondaryAction) && (
          <div className="pt-3 flex items-center space-x-2">
            {onAction && actionLabel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs transition-colors shadow-2xs"
              >
                {actionLabel}
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  secondaryAction.onClick();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

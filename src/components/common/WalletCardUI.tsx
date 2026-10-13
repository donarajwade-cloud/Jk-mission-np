import React, { useState } from 'react';
import { formatNPR } from '../../utils/format.ts';
import { 
  Award, 
  TrendingUp, 
  Store, 
  Copy, 
  Check, 
  ArrowUpRight, 
  CreditCard, 
  Wifi, 
  ShieldCheck, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export type WalletTheme = 'emerald' | 'gold' | 'sapphire' | 'obsidian';

export interface WalletCardUIProps {
  type: 'cashback' | 'income' | 'shopkeeper' | 'custom';
  title: string;
  subtitle?: string;
  cardHolderName?: string;
  accountOrId?: string;
  balanceNpr: number;
  totalEarnedNpr?: number;
  totalWithdrawnNpr?: number;
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
  type,
  title,
  subtitle,
  cardHolderName = 'JK MISSION MEMBER',
  accountOrId,
  balanceNpr,
  totalEarnedNpr,
  totalWithdrawnNpr,
  badge,
  isActive = false,
  onSelect,
  onAction,
  actionLabel,
  actionIcon,
  secondaryAction,
  compact = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Derive theme and visuals based on type
  let gradientBg = 'from-slate-900 via-stone-900 to-black';
  let accentColor = 'text-amber-400';
  let chipColor = 'from-amber-200 via-yellow-400 to-amber-600';
  let borderGlow = isActive ? 'border-amber-400 ring-4 ring-amber-400/25 shadow-amber-900/20' : 'border-white/10';
  let badgeBg = 'bg-amber-400/20 text-amber-300 border-amber-400/30';
  let cardCategory = 'JK MISSION DIGITAL WALLET';
  let cardTier = 'STANDARD';
  let IconComponent = CreditCard;

  if (type === 'cashback') {
    // Rich Emerald & Jade metallic finish
    gradientBg = 'from-emerald-950 via-teal-950 to-slate-950';
    accentColor = 'text-emerald-400';
    chipColor = 'from-amber-200 via-yellow-400 to-amber-600';
    borderGlow = isActive ? 'border-emerald-400 ring-4 ring-emerald-400/25 shadow-emerald-950/40' : 'border-emerald-500/20';
    badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
    cardCategory = 'JK CASHBACK PRIVILEGE';
    cardTier = 'RETAIL REWARD';
    IconComponent = Award;
  } else if (type === 'income') {
    // Luxury Black Gold & Obsidian finish
    gradientBg = 'from-amber-950/90 via-stone-950 to-slate-950';
    accentColor = 'text-amber-400';
    chipColor = 'from-amber-200 via-amber-400 to-yellow-600';
    borderGlow = isActive ? 'border-amber-400 ring-4 ring-amber-400/30 shadow-amber-950/50' : 'border-amber-500/20';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-400/30';
    cardCategory = 'JK 3-LEVEL REFERRAL';
    cardTier = 'COMMISSION BLACK';
    IconComponent = TrendingUp;
  } else if (type === 'shopkeeper') {
    // Deep Midnight Sapphire & Cobalt metallic finish
    gradientBg = 'from-blue-950 via-indigo-950 to-slate-950';
    accentColor = 'text-sky-400';
    chipColor = 'from-sky-200 via-blue-300 to-indigo-400';
    borderGlow = isActive ? 'border-sky-400 ring-4 ring-sky-400/30 shadow-indigo-950/50' : 'border-sky-500/20';
    badgeBg = 'bg-sky-500/20 text-sky-300 border-sky-400/30';
    cardCategory = 'JK MERCHANT SETTLEMENT';
    cardTier = 'COMMERCIAL B2B';
    IconComponent = Store;
  }

  // Format account string to look like masked 16-digit payment card
  const formatCardNumber = (str?: string) => {
    if (!str) return '••••  ••••  ••••  8829';
    const clean = str.replace(/\D/g, '');
    if (clean.length >= 8) {
      const first4 = clean.slice(0, 4);
      const last4 = clean.slice(-4);
      return `${first4}  ••••  ••••  ${last4}`;
    }
    return `••••  ••••  ••••  ${clean.padEnd(4, '0')}`;
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountOrId) return;
    navigator.clipboard.writeText(accountOrId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative select-none rounded-[2rem] bg-gradient-to-br ${gradientBg} p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 border ${borderGlow} ${
        onSelect ? 'cursor-pointer hover:scale-[1.015] hover:shadow-2xl' : ''
      } ${className}`}
    >
      {/* Background Decorative Guilloché & Holographic Lighting effects */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
        {/* Radial sheen spotlight */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.07] rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/[0.06] rounded-full blur-2xl" />
        {/* Subtle geometric grid line accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        {/* Diagonal metallic light streak */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
        {/* Top Bar: Network Name, Chip, NFC Wave, Card Tier Badge */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <IconComponent className={`w-4 h-4 ${accentColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block leading-tight">
                  {cardCategory}
                </span>
                <span className="text-xs font-black tracking-wider text-white">
                  JK MISSION NEPAL
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {badge && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-xs ${badgeBg}`}>
                  {badge}
                </span>
              )}
              {/* Contactless NFC Waves Icon */}
              <div className="text-white/40 group-hover:text-white/80 transition-colors p-1" title="Contactless Digital Card">
                <Wifi className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* EMV Microchip & Hologram Row */}
          <div className="mt-4 flex items-center justify-between">
            {/* Authentic EMV Chip Visual */}
            <div className="flex items-center space-x-3">
              <div className={`relative w-12 h-9 rounded-lg bg-gradient-to-br ${chipColor} p-1 shadow-md border border-yellow-200/50 flex flex-col justify-between overflow-hidden`}>
                {/* Chip circuit contact lines */}
                <div className="absolute inset-x-2 top-0 bottom-0 border-x border-amber-900/30" />
                <div className="absolute inset-y-2 left-0 right-0 border-y border-amber-900/30" />
                <div className="absolute inset-2 border border-amber-900/40 rounded-xs" />
                <div className="w-full h-full bg-transparent relative z-10" />
              </div>

              {/* Security Shield / Verified Badge */}
              <div className="flex items-center space-x-1 text-[10px] text-white/60 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="tracking-wide">LOCKED LEDGER</span>
              </div>
            </div>

            {/* Toggle Balance Visibility */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBalanceVisible(!balanceVisible);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title={balanceVisible ? 'Hide Balance' : 'Show Balance'}
            >
              {balanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center: Available Balance (The Main Highlight) */}
        <div className="my-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-white/40">{subtitle}</span>
            )}
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              {balanceVisible ? formatNPR(balanceNpr) : 'NPR ••••••'}
            </span>
            <span className={`text-xs font-bold ${accentColor} tracking-wider`}>NPR</span>
          </div>
        </div>

        {/* Card Number / ID Row with Copy */}
        <div className="mb-4 flex items-center justify-between bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/5">
          <span className="font-mono text-xs sm:text-sm tracking-[0.2em] font-medium text-white/90">
            {formatCardNumber(accountOrId)}
          </span>
          {accountOrId && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-md text-white/60 hover:text-white transition-colors"
              title="Copy ID / Account"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Card Footer: Cardholder Name, Expiry, and Stats */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">
                CARDHOLDER / ACCOUNT
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-white/95">
                {cardHolderName}
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 text-right">
              {totalEarnedNpr !== undefined && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">
                    TOTAL EARNED
                  </span>
                  <p className="text-xs font-black text-emerald-400">
                    {formatNPR(totalEarnedNpr)}
                  </p>
                </div>
              )}
              {totalWithdrawnNpr !== undefined && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block font-semibold">
                    DISBURSED
                  </span>
                  <p className="text-xs font-black text-amber-300">
                    {formatNPR(totalWithdrawnNpr)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons if provided */}
        {(onAction || secondaryAction) && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {onAction && (
              <button
                type="button"
                onClick={onAction}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-slate-950 hover:bg-amber-300 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                {actionIcon || <ArrowUpRight className="w-3.5 h-3.5" />}
                <span>{actionLabel || 'Manage Wallet'}</span>
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors backdrop-blur-xs"
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

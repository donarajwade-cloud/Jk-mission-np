import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  QrCode, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Send,
  ExternalLink
} from 'lucide-react';
import { formatNepalMobile } from '../../utils/format.ts';

interface ReferralShareBoxProps {
  referralId: string;
  userName?: string;
  className?: string;
}

export const ReferralShareBox: React.FC<ReferralShareBoxProps> = ({
  referralId,
  userName = 'Member',
  className = ''
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Generate complete, absolute shareable referral link
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://jkmission.np.com';
  
  const cleanId = referralId.trim();
  const referralLink = `${origin}/register-customer?ref=${encodeURIComponent(cleanId)}`;

  const shareText = `Namaste! 🙏\nJoin JK Mission Nepal to shop genuine daily essentials, organic foods, teas & spices with guaranteed customer cashback in रु and earn 3-level referral commissions!\n\nRegister with my sponsor referral link:\n${referralLink}\n\nMy Sponsor Referral ID: ${cleanId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(cleanId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join JK Mission Nepal',
          text: shareText,
          url: referralLink
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join JK Mission Nepal with my sponsor ID ${cleanId} for real cashback and 3-level commissions!`)}`;

  // Quick QR preview URL using public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(referralLink)}&color=0b0f19&bgcolor=ffffff`;

  return (
    <div className={`bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-xl space-y-6 ${className}`}>
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Invite &amp; Earn 3-Level Rewards</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Your Personal Referral Share Link
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Share your unique sponsor link with friends, family, and store buyers across Nepal. When they register through your link, they are permanently locked as your Level 1 referrals.
          </p>
        </div>

        {/* Sponsor ID Badge */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-left sm:text-right shrink-0">
          <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold block">
            Your Sponsor Referral ID
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="font-mono text-lg font-black text-white">
              {formatNepalMobile(cleanId)}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-950 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Link Input & Action Buttons */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Direct Customer Sign-up URL
        </label>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={referralLink}
              onClick={handleCopyLink}
              className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/40 font-mono text-xs text-amber-200 select-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 p-1"
              title="Click to copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 stroke-[3] text-emerald-950" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                <span>Copy Referral Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Quick Share Grid */}
      <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* WhatsApp Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 sm:py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all hover:scale-[1.02] active:scale-95"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>Share WhatsApp</span>
        </a>

        {/* Telegram Share Button */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 sm:py-3.5 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all hover:scale-[1.02] active:scale-95"
        >
          <Send className="w-4 h-4 shrink-0" />
          <span>Telegram</span>
        </a>

        {/* Device Native Share */}
        <button
          onClick={handleNativeShare}
          className="p-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-white/15 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Share Link</span>
        </button>

        {/* Toggle QR Code */}
        <button
          onClick={() => setShowQr(!showQr)}
          className="p-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-white/15 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{showQr ? 'Hide QR' : 'Show QR Code'}</span>
        </button>
      </div>

      {/* QR Code Modal / Drawer */}
      {showQr && (
        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-amber-300 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
              Scan to Register
            </span>
            <h3 className="text-lg font-black text-slate-950">
              Scan QR Code to Join Under {userName}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm">
              Point your smartphone camera to immediately open the registration form with Sponsor ID <strong className="font-mono font-bold text-slate-900">{cleanId}</strong> already filled in.
            </p>
            <div className="pt-2">
              <a
                href={referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 font-bold hover:underline inline-flex items-center space-x-1"
              >
                <span>Test Link in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm shrink-0">
            <img 
              src={qrCodeUrl} 
              alt="Referral QR Code" 
              className="w-40 h-40 object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 3-Level Reward Reminder Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-[11px] shrink-0">
            L1
          </div>
          <div>
            <span className="font-bold text-white block">Level 1 Direct</span>
            <span className="text-[10px] text-slate-400">Default ~15% Commission</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-[11px] shrink-0">
            L2
          </div>
          <div>
            <span className="font-bold text-white block">Level 2 Team</span>
            <span className="text-[10px] text-slate-400">Default ~10% Commission</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-[11px] shrink-0">
            L3
          </div>
          <div>
            <span className="font-bold text-white block">Level 3 Network</span>
            <span className="text-[10px] text-slate-400">Default ~5% Commission</span>
          </div>
        </div>
      </div>

    </div>
  );
};

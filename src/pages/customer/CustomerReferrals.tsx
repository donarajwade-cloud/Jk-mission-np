import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { Users, Copy, Check, Share2, Award, ShieldCheck, AlertCircle } from 'lucide-react';
import { ReferralShareBox } from '../../components/common/ReferralShareBox.tsx';

export const CustomerReferrals: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const res = await api.getCustomerReferralTree(user.id);
        if (res.success) setTreeData(res.tree);
      } catch (err: any) {
        console.warn('Could not load referral tree:', err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleCopy = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://jkmission.np.com';
  const shareLink = `${origin}/register-customer?ref=${encodeURIComponent(user?.referralId || '')}`;
  const shareText = `Join JK Mission Nepal with my sponsor referral link to shop authentic products and receive real cashback: ${shareLink}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'JK Mission Referral',
        text: shareText,
        url: shareLink
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Traditional Business Team
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            3-Level Referral Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your traditional business growth and verified sales commissions across Level 1, 2, and 3.
          </p>
        </div>

        {/* Share buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Sponsor ID</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* User's Dedicated Referral Share Box with WhatsApp, Copy, QR & Pre-fills */}
      {user && (
        <ReferralShareBox
          referralId={user.referralId}
          userName={user.name}
        />
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Total Team</span>
          <p className="text-2xl font-black text-slate-950">{treeData?.totalNetworkMembers || 0}</p>
          <span className="text-[10px] text-slate-500">Across 3 Levels</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Level 1 Direct</span>
          <p className="text-2xl font-black text-amber-600">{treeData?.level1?.membersCount || 0}</p>
          <span className="text-[10px] text-slate-500">Registered Sponsor</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Level 2 &amp; 3</span>
          <p className="text-2xl font-black text-blue-600">{(treeData?.level2?.membersCount || 0) + (treeData?.level3?.membersCount || 0)}</p>
          <span className="text-[10px] text-slate-500">Downline Network</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Total Earned</span>
          <p className="text-2xl font-black text-emerald-600">{formatNPR(treeData?.totalNetworkCommissionNpr || 0)}</p>
          <span className="text-[10px] text-slate-500">Withdrawable</span>
        </div>
      </div>

      {/* 3 Level Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Direct Referrals
            </span>
            <span className="font-black text-slate-900">Level 1</span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-950">{treeData?.level1?.membersCount || 0} Members</p>
            <p className="text-xs text-slate-500">Sales count: {treeData?.level1?.salesCount || 0}</p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Commission Earned</span>
            <p className="text-xl font-black text-amber-600">{formatNPR(treeData?.level1?.commissionsEarnedNpr)}</p>
          </div>

          {treeData?.level1?.members?.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Recent direct members:</span>
              <div className="space-y-1 text-xs">
                {treeData.level1.members.map((m: any) => (
                  <div key={m.id} className="flex justify-between text-slate-700">
                    <span className="truncate max-w-[120px]">{m.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{formatNepalMobile(m.mobile)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Tier 2 Referrals
            </span>
            <span className="font-black text-slate-900">Level 2</span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-950">{treeData?.level2?.membersCount || 0} Members</p>
            <p className="text-xs text-slate-500">Sales count: {treeData?.level2?.salesCount || 0}</p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Commission Earned</span>
            <p className="text-xl font-black text-amber-600">{formatNPR(treeData?.level2?.commissionsEarnedNpr)}</p>
          </div>

          {treeData?.level2?.members?.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Tier 2 members:</span>
              <div className="space-y-1 text-xs">
                {treeData.level2.members.map((m: any) => (
                  <div key={m.id} className="flex justify-between text-slate-700">
                    <span className="truncate max-w-[120px]">{m.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{formatNepalMobile(m.mobile)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              Tier 3 Referrals
            </span>
            <span className="font-black text-slate-900">Level 3</span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-950">{treeData?.level3?.membersCount || 0} Members</p>
            <p className="text-xs text-slate-500">Sales count: {treeData?.level3?.salesCount || 0}</p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Commission Earned</span>
            <p className="text-xl font-black text-amber-600">{formatNPR(treeData?.level3?.commissionsEarnedNpr)}</p>
          </div>

          {treeData?.level3?.members?.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Tier 3 members:</span>
              <div className="space-y-1 text-xs">
                {treeData.level3.members.map((m: any) => (
                  <div key={m.id} className="flex justify-between text-slate-700">
                    <span className="truncate max-w-[120px]">{m.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{formatNepalMobile(m.mobile)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Ethical Referral Rule: </strong>
          Adding members or registering accounts does not generate commission. Commissions are credited exclusively upon completed, paid product sales in your traditional business.
        </span>
      </div>
    </div>
  );
};

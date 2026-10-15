import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { Users, Copy, Check, Share2, Award, ShieldCheck, AlertCircle } from 'lucide-react';

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

  const shareText = `Join JK Mission with my Referral ID ${user?.referralId} to shop authentic products and receive real cashback: https://jkmission.np.com`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'JK Mission Referral',
        text: shareText,
        url: 'https://jkmission.np.com'
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            <span>Copy Referral ID</span>
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

      {/* Referral ID Showcase Banner */}
      <div className="bg-slate-950 text-white p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Your Sponsor Referral ID
          </span>
          <p className="text-2xl font-mono font-black text-white">
            {user ? formatNepalMobile(user.referralId) : ''}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Direct sponsor link: <span className="text-slate-300 font-mono">https://jkmission.np.com/register?ref={user?.referralId}</span>
          </p>
        </div>
        <div className="text-left md:text-right text-xs text-slate-400 space-y-1">
          <p>Total Team Members: <strong className="text-white text-base">{treeData?.totalNetworkMembers || 0}</strong></p>
          <p>Total Commission Earned: <strong className="text-amber-400 text-base">{formatNPR(treeData?.totalNetworkCommissionNpr)}</strong></p>
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

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import {
  Users,
  Search,
  Award,
  TrendingUp,
  Ban,
  CheckCircle,
  Eye,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Inspector modal for 3-Level Referral Tree
  const [treeModalOpen, setTreeModalOpen] = useState(false);
  const [selectedCustomerTree, setSelectedCustomerTree] = useState<any>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  // Suspend/activate modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const loadCustomers = async () => {
    try {
      const res = await api.getAdminCustomers(search || undefined);
      if (res.success) setCustomers(res.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const openTreeInspector = async (customerId: string) => {
    setTreeLoading(true);
    setTreeModalOpen(true);
    try {
      const res = await api.getAdminCustomerReferralTree(customerId);
      if (res.success) {
        setSelectedCustomerTree(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'active' | 'suspended') => {
    if (!targetCustomer) return;
    try {
      const res = await api.updateCustomerStatus(targetCustomer.id, {
        status,
        suspendedReason: status === 'suspended' ? suspendReason : undefined
      });
      if (res.success) {
        setStatusModalOpen(false);
        setSuspendReason('');
        await loadCustomers();
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Customer Network
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Customer Directory & Referral Trees
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search customer records, audit 3-level team hierarchies, and manage account statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile (+977)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Referral ID (Mobile)</th>
                  <th className="py-3 px-4">Sponsor Mobile</th>
                  <th className="py-3 px-4 text-right">Cashback Balance</th>
                  <th className="py-3 px-4 text-right">Income Balance</th>
                  <th className="py-3 px-4 text-center">Direct L1s</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {formatNepalMobile(c.referralId)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {c.sponsorReferralId ? formatNepalMobile(c.sponsorReferralId) : <span className="text-slate-300">Root</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      {formatNPR(c.wallet?.cashbackAvailableNpr)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-600">
                      {formatNPR(c.wallet?.incomeAvailableNpr)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {c.directReferralsCount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openTreeInspector(c.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center space-x-1"
                          title="Inspect 3-Level Tree"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>3-Level Tree</span>
                        </button>

                        <button
                          onClick={() => {
                            setTargetCustomer(c);
                            setStatusModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg text-xs ${
                            c.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={c.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3-Level Tree Inspector Modal */}
      {treeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-6 text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Network Tree Inspector
                </span>
                <h3 className="font-black text-slate-950 text-base mt-1">
                  Downline of {selectedCustomerTree?.customer?.name} ({formatNepalMobile(selectedCustomerTree?.customer?.mobile)})
                </h3>
              </div>
              <button
                onClick={() => setTreeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {treeLoading ? (
              <div className="p-8 text-center text-slate-400">Computing 3-level tree downline...</div>
            ) : selectedCustomerTree ? (
              <div className="space-y-4">
                {/* Level 1 Direct */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Level 1 (Direct Referrals): {selectedCustomerTree.tree?.level1?.membersCount} Members
                    </span>
                    <span className="font-bold text-amber-900">
                      Earned: {formatNPR(selectedCustomerTree.tree?.level1?.commissionsEarnedNpr)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedCustomerTree.tree?.level1?.members?.map((m: any) => (
                      <span key={m.id} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-slate-800 font-medium">
                        {m.name} ({formatNepalMobile(m.mobile)})
                      </span>
                    ))}
                    {selectedCustomerTree.tree?.level1?.members?.length === 0 && (
                      <span className="text-slate-400 italic">No direct referrals yet.</span>
                    )}
                  </div>
                </div>

                {/* Level 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Level 2 (Tier 2 Downline): {selectedCustomerTree.tree?.level2?.membersCount} Members
                    </span>
                    <span className="font-bold text-amber-900">
                      Earned: {formatNPR(selectedCustomerTree.tree?.level2?.commissionsEarnedNpr)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedCustomerTree.tree?.level2?.members?.map((m: any) => (
                      <span key={m.id} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                        {m.name} ({formatNepalMobile(m.mobile)})
                      </span>
                    ))}
                    {selectedCustomerTree.tree?.level2?.members?.length === 0 && (
                      <span className="text-slate-400 italic">No Level 2 referrals yet.</span>
                    )}
                  </div>
                </div>

                {/* Level 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Level 3 (Tier 3 Downline): {selectedCustomerTree.tree?.level3?.membersCount} Members
                    </span>
                    <span className="font-bold text-amber-900">
                      Earned: {formatNPR(selectedCustomerTree.tree?.level3?.commissionsEarnedNpr)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedCustomerTree.tree?.level3?.members?.map((m: any) => (
                      <span key={m.id} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium">
                        {m.name} ({formatNepalMobile(m.mobile)})
                      </span>
                    ))}
                    {selectedCustomerTree.tree?.level3?.members?.length === 0 && (
                      <span className="text-slate-400 italic">No Level 3 referrals yet.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="text-right border-t border-slate-100 pt-3">
              <button
                onClick={() => setTreeModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Activate Account Modal */}
      {statusModalOpen && targetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-base">
              {targetCustomer.status === 'active' ? 'Suspend Customer Account' : 'Reactivate Customer Account'}
            </h3>
            <p className="text-slate-600">
              User: <strong>{targetCustomer.name}</strong> ({formatNepalMobile(targetCustomer.mobile)})
            </p>

            {targetCustomer.status === 'active' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Suspension</label>
                <textarea
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Record justification (e.g. fraudulent activity, terms violation)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(targetCustomer.status === 'active' ? 'suspended' : 'active')}
                className={`px-4 py-2 rounded-xl font-bold text-white ${
                  targetCustomer.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {targetCustomer.status === 'active' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

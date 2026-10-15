import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { Store, CheckCircle, XCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const AdminShopkeepers: React.FC = () => {
  const [shopkeepers, setShopkeepers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  const load = async () => {
    try {
      const res = await api.getAdminShopkeepers();
      if (res.success) setShopkeepers(res.shopkeepers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedShopkeeper) return;
    try {
      const res = await api.reviewShopkeeper(selectedShopkeeper.id, {
        status: reviewAction,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason : undefined
      });
      if (res.success) {
        setReviewModalOpen(false);
        setRejectionReason('');
        await load();
      }
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pendingCount = shopkeepers.filter(s => s.status === 'pending').length;
  const approvedCount = shopkeepers.filter(s => s.status === 'approved').length;
  const rejectedCount = shopkeepers.filter(s => s.status === 'rejected').length;

  const sortedShopkeepers = [...shopkeepers].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const filteredShopkeepers = sortedShopkeepers.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Merchant Governance
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Shopkeeper Applications & Stores
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review business credentials, PAN/VAT certificates, and approve stores to sell in Nepal.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All ({shopkeepers.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Alert banner if applications are pending */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
            <span>
              <strong>{pendingCount} Merchant Application{pendingCount > 1 ? 's' : ''} Awaiting Review: </strong>
              Please inspect business details, PAN/VAT certificates, and click &quot;Review & Approve&quot; to activate their merchant account.
            </span>
          </div>
          {statusFilter !== 'pending' && (
            <button
              onClick={() => setStatusFilter('pending')}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shrink-0 ml-2"
            >
              Show Pending
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading merchant applications...</div>
        ) : filteredShopkeepers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No shopkeeper applications found matching filter &quot;{statusFilter}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Merchant Name</th>
                  <th className="py-3 px-4">Shop Name</th>
                  <th className="py-3 px-4">District / Municipality</th>
                  <th className="py-3 px-4 font-mono">PAN / VAT</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-right">Commission Earned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShopkeepers.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      s.status === 'pending' ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <span className="font-mono text-slate-400 text-[10px]">{formatNepalMobile(s.mobile)}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{s.shopName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.district}, {s.municipality}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {s.panOrVatNumber || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {s.productsCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-blue-700">
                      {formatNPR(s.wallet?.totalEarnedNpr)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-200 text-amber-950 font-black animate-pulse'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedShopkeeper(s);
                          setReviewAction(s.status === 'approved' ? 'rejected' : 'approved');
                          setReviewModalOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          s.status === 'pending'
                            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {s.status === 'pending' ? 'Review & Approve' : 'Change Status'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedShopkeeper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-900 text-base">
              Review Shopkeeper Application
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p><strong>Shop:</strong> {selectedShopkeeper.shopName}</p>
              <p><strong>Proprietor:</strong> {selectedShopkeeper.fullName} ({formatNepalMobile(selectedShopkeeper.mobile)})</p>
              <p><strong>Location:</strong> {selectedShopkeeper.shopAddress}, {selectedShopkeeper.district}</p>
              <p><strong>PAN/VAT:</strong> {selectedShopkeeper.panOrVatNumber || 'None'}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Decision</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('approved')}
                  className={`flex-1 py-2 rounded-xl font-bold border ${
                    reviewAction === 'approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Approve Store
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('rejected')}
                  className={`flex-1 py-2 rounded-xl font-bold border ${
                    reviewAction === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Reject Store
                </button>
              </div>
            </div>

            {reviewAction === 'rejected' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why application is rejected..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-5 py-2 rounded-xl bg-slate-900 text-amber-300 font-bold hover:bg-slate-800"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

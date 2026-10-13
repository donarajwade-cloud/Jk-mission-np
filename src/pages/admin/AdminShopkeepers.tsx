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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading merchant applications...</div>
        ) : shopkeepers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No shopkeeper applications found.</div>
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
                {shopkeepers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
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
                          : 'bg-amber-100 text-amber-900'
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
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
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

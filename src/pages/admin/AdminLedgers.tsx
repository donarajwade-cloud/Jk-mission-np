import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { formatNPR, formatNepaliDate, formatNepalMobile } from '../../utils/format.ts';
import { Award, Layers, Store, Download, FileSpreadsheet } from 'lucide-react';

export const AdminLedgers: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cashback' | 'referral' | 'shopkeeper'>('cashback');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getFinancialLedgers();
        if (res.success) setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportCsv = () => {
    if (!data) return;
    let rows: any[] = [];
    let headers: string[] = [];

    if (activeTab === 'cashback') {
      headers = ['ID', 'OrderNumber', 'CustomerMobile', 'ProductName', 'AmountNpr', 'Type', 'CreatedAt'];
      rows = (data.cashbackLedger || []).map((c: any) => [
        c.id, c.orderNumber, c.customerMobile, `"${c.productName.replace(/"/g, '""')}"`, c.amountNpr, c.type, c.createdAt
      ]);
    } else if (activeTab === 'referral') {
      headers = ['ID', 'OrderNumber', 'BeneficiaryMobile', 'ReferralLevel', 'AmountNpr', 'Type', 'CreatedAt'];
      rows = (data.referralLedger || []).map((r: any) => [
        r.id, r.orderNumber, r.beneficiaryMobile, r.referralLevel, r.amountNpr, r.type, r.createdAt
      ]);
    } else {
      headers = ['ID', 'OrderNumber', 'ShopName', 'ProductName', 'AmountNpr', 'Type', 'CreatedAt'];
      rows = (data.shopkeeperLedger || []).map((s: any) => [
        s.id, s.orderNumber, `"${s.shopName.replace(/"/g, '""')}"`, `"${s.productName.replace(/"/g, '""')}"`, s.amountNpr, s.type, s.createdAt
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jkmission_${activeTab}_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
            Immutable Accounting Ledgers
          </span>
          <h1 className="text-3xl font-black text-slate-950 mt-0.5">
            Financial Ledgers & Audit Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction journals for Customer Cashback, 3-Level Referrals, and Shopkeeper Sales.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {activeTab.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('cashback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cashback' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Customer Cashback Ledger ({data?.cashbackLedger?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('referral')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'referral' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          3-Level Referral Ledger ({data?.referralLedger?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('shopkeeper')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'shopkeeper' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Shopkeeper Commission Ledger ({data?.shopkeeperLedger?.length || 0})
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading ledgers...</div>
        ) : activeTab === 'cashback' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Mobile</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.cashbackLedger || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatNepaliDate(e.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{e.orderNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatNepalMobile(e.customerMobile)}</td>
                    <td className="py-3 px-4 text-slate-800">{e.productName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      +{formatNPR(e.amountNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'referral' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Beneficiary Mobile</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.referralLedger || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatNepaliDate(e.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                        Level {e.referralLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{formatNepalMobile(e.beneficiaryMobile)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{e.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">{e.description}</td>
                    <td className="py-3 px-4 text-right font-black text-purple-700">
                      +{formatNPR(e.amountNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Merchant Shop</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4 text-right">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.shopkeeperLedger || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatNepaliDate(e.createdAt)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{e.shopName}</td>
                    <td className="py-3 px-4 text-slate-700">{e.productName}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{e.orderNumber}</td>
                    <td className="py-3 px-4 text-right font-black text-blue-700">
                      +{formatNPR(e.amountNpr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

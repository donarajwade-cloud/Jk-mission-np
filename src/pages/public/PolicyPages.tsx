import React, { useState } from 'react';
import { ShieldCheck, FileText, Award, Users, RotateCcw, CreditCard } from 'lucide-react';

interface PolicyPagesProps {
  initialTab?: string;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({ initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'cashback', label: 'Cashback Policy', icon: Award },
    { id: 'referral', label: 'Referral Policy', icon: Users },
    { id: 'refund', label: 'Refund & Return Policy', icon: RotateCcw },
    { id: 'settlement', label: 'Payment & Settlement Policy', icon: CreditCard }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-black text-slate-950 mt-0.5">
          Platform Governance & Policies
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          JK Mission (https://jkmission.np.com) operates under strict compliance with the laws of Nepal.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                active
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Policy Content */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-600 leading-relaxed">
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">1. Terms and Conditions of Service</h2>
            <p>
              Welcome to <strong>JK Mission</strong> (&quot;the Platform&quot;), operated at <strong>https://jkmission.np.com</strong>. By creating an account as a customer or shopkeeper, you agree to be bound by these Terms and Conditions governed under the laws of Nepal.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. Nature of Platform</h3>
            <p>
              JK Mission Nepal is an online smart retail marketplace connecting verified independent Nepali merchants with customers. All transactions, pricing, and commissions are denominated in Nepalese Rupees (NPR).
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Role-Based Access</h3>
            <p>
              Users are classified into Customers, Shopkeepers, and Platform Administrators. Unauthorized attempts to bypass access controls or alter database records are strictly prohibited.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">C. Mobile Identification</h3>
            <p>
              Each user registers with their verified Nepali mobile number (+977). This number constitutes the customer&apos;s unique, permanent Referral ID and cannot be transferred or spoofed.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">2. Privacy Policy</h2>
            <p>
              Your personal privacy is of paramount importance to JK Mission Nepal. We do not sell or expose customer or merchant private records to unauthorized third parties.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. Data Collected</h3>
            <p>
              We collect full names, mobile contact numbers, shipping addresses within Nepal, business PAN/VAT details for shopkeepers, and transaction records needed to verify orders and process payments.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Security & Encryption</h3>
            <p>
              Passwords are cryptographically hashed using salted bcrypt hashes. Sensitive financial ledgers and wallets are protected behind server-side authorization boundaries.
            </p>
          </div>
        )}

        {activeTab === 'cashback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">3. Customer Cashback Policy</h2>
            <p>
              Customer cashback is a direct purchase reward provided to encourage smart retail shopping with participating Nepali merchants.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. Product-Wise Configuration</h3>
            <p>
              Cashback is not fixed arbitrarily. Each product has an authorized cashback amount or percentage determined by the Admin in accordance with the product’s margin.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Separate Cashback Wallet</h3>
            <p>
              Cashback is credited strictly to the customer&apos;s <strong>Cashback Wallet</strong> and is kept separate from referral commission income. It cannot be falsely counted as MLM or affiliate income.
            </p>
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">4. 3-Level Referral Commission Policy</h2>
            <p>
              Our 3-level referral model is strictly sale-contingent, mathematically bounded, and compliant with consumer protection directives in Nepal.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. Zero Commission on Recruitment</h3>
            <p>
              No commission, bonus, or bounty is awarded simply for signing up members, inviting contacts, or expanding a team. Commissions are triggered ONLY when an eligible product purchase reaches verified completion status.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Referral Pool Base</h3>
            <p>
              Level 1 (default 15%), Level 2 (default 10%), and Level 3 (default 5%) percentages are calculated against the <strong>configured referral pool</strong>, NEVER automatically against the full selling price. Total distributions are validated to never exceed gross margins.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">C. Permanent Sponsor Link</h3>
            <p>
              Once registered under a sponsor&apos;s Referral ID, that sponsor cannot be reassigned or modified.
            </p>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">5. Refund & Return Policy</h2>
            <p>
              Customers may request returns or cancellations according to participating shop terms and product condition guidelines.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. Commission & Cashback Reversals</h3>
            <p>
              When a refund is approved by the Administrator, related cashback and 3-level referral commissions are reversed on the respective wallets while maintaining permanent audit ledger trails.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Inventory Return</h3>
            <p>
              Product stock quantities are restored to the shopkeeper&apos;s inventory upon verified cancellation.
            </p>
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">6. Payment & Settlement Policy</h2>
            <p>
              All disbursements to customers and shopkeepers are executed manually with verified audit trails.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">A. 15-Day Settlement Cycle</h3>
            <p>
              Withdrawal requests are processed across 15-day settlement reporting periods. Minimum withdrawal threshold is NPR 100.
            </p>
            <h3 className="font-bold text-slate-800 text-sm">B. Supported Channels</h3>
            <p>
              Disbursements are paid via eSewa, Khalti, or Commercial Bank Transfer. Administrators must record transaction proof and bank reference numbers before requests can be finalized as Paid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

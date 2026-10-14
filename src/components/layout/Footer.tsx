import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Heart, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  currentView?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentView = 'home' }) => {
  const { user, role, logout } = useAuth();

  const isPanelRoute =
    currentView.startsWith('admin-') ||
    currentView.startsWith('shopkeeper-') ||
    currentView.startsWith('customer-');

  // If inside any panel, show clean workspace management footer
  if (isPanelRoute) {
    return (
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-5 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
              JK
            </div>
            <span className="font-bold text-slate-200">
              JK Mission
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-semibold capitalize">
              {role} Workspace
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span>Official Currency: NPR (रु)</span>
            <span>•</span>
            <span>15-Day Settlement Cycle</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} JK Mission</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      {/* Top Banner - Clean Trust & Official Verification (No Action Buttons) */}
      <div className="bg-amber-400 text-slate-950 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-300 font-black flex items-center justify-center text-base">
              JK
            </div>
            <div>
              <p className="font-extrabold text-slate-950 text-sm sm:text-base leading-tight">
                JK Mission — Smart Retail Network
              </p>
              <p className="text-[11px] text-slate-900 font-semibold">
                Smart Retail, Cashback & Referral Platform • Currency: NPR (रु)
              </p>
            </div>
          </div>

          {/* Clean Trust Badges - Non-interactive */}
          <div className="flex flex-wrap items-center gap-2 justify-center text-[11px] font-bold text-slate-950">
            <span className="flex items-center gap-1 bg-amber-300/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>100% Genuine Retail</span>
            </span>
            <span className="bg-amber-300/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Currency: NPR (रु)
            </span>
            <span className="bg-amber-300/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Direct Bank & eSewa Transfer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: About & Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                JK
              </span>
              <span className="text-white font-extrabold text-lg">JK Mission</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Discover authentic products from verified participating shops, receive eligible cashback on purchases, and earn transparent referral commissions under the platform&apos;s published rules.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>New Road, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <a href="tel:+9779766133831" className="hover:text-amber-300 transition-colors">+977 9766133831</a> / <a href="tel:+9779815837905" className="hover:text-amber-300 transition-colors">+977 9815837905</a>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="mailto:jk5172794@gmail.com" className="hover:text-amber-300 transition-colors font-mono">
                  jk5172794@gmail.com
                </a>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Asia/Kathmandu Timezone (NPR)</span>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-amber-300 transition-colors">
                  Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shops')} className="hover:text-amber-300 transition-colors">
                  Participating Shops
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-amber-300 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cashback')} className="hover:text-amber-300 transition-colors">
                  Cashback System
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('referral')} className="hover:text-amber-300 transition-colors">
                  3-Level Referral Model
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-amber-300 transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Dashboards */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              {!user ? (
                <>
                  <li>
                    <button onClick={() => onNavigate('login')} className="hover:text-amber-300 transition-colors">
                      User Login (Customer/Shop/Admin)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('register-customer')} className="hover:text-amber-300 transition-colors">
                      Customer Registration
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigate('register-shopkeeper')} className="hover:text-amber-300 transition-colors">
                      Shopkeeper Application
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => {
                        if (role === 'admin') onNavigate('admin-dashboard');
                        else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                        else onNavigate('customer-dashboard');
                      }}
                      className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1"
                    >
                      <span>Go to {role === 'admin' ? 'Admin Portal' : role === 'shopkeeper' ? 'Shopkeeper Hub' : 'Customer Dashboard'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </li>
                  {role === 'customer' && (
                    <>
                      <li>
                        <button onClick={() => onNavigate('customer-wallets')} className="hover:text-amber-300 transition-colors">
                          My Wallets & Cashback
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onNavigate('customer-referrals')} className="hover:text-amber-300 transition-colors">
                          3-Level Referral Team
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onNavigate('customer-orders')} className="hover:text-amber-300 transition-colors">
                          My Orders & Invoices
                        </button>
                      </li>
                    </>
                  )}
                  {role === 'shopkeeper' && (
                    <>
                      <li>
                        <button onClick={() => onNavigate('shopkeeper-products')} className="hover:text-amber-300 transition-colors">
                          Manage Products
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onNavigate('shopkeeper-wallet')} className="hover:text-amber-300 transition-colors">
                          Commission Wallet
                        </button>
                      </li>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <li>
                        <button onClick={() => onNavigate('admin-products')} className="hover:text-amber-300 transition-colors">
                          Product Approvals
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onNavigate('admin-ledgers')} className="hover:text-amber-300 transition-colors">
                          Financial Ledgers
                        </button>
                      </li>
                    </>
                  )}
                  <li className="pt-1">
                    <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors font-semibold">
                      Sign Out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Policies & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('policy', 'terms')} className="hover:text-amber-300 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'privacy')} className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'cashback')} className="hover:text-amber-300 transition-colors">
                  Cashback Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'referral')} className="hover:text-amber-300 transition-colors">
                  3-Level Referral Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'refund')} className="hover:text-amber-300 transition-colors">
                  Refund & Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'settlement')} className="hover:text-amber-300 transition-colors">
                  Payment & Settlement Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Partners & Supported methods */}
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Supported Payment & Settlement Channels in Nepal
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400">
                eSewa
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-purple-400">
                Khalti
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-blue-400">
                ConnectIPS
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-red-400">
                Fonepay QR
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                Commercial Bank Transfer
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300">
                Cash on Delivery (COD)
              </span>
            </div>
          </div>
          <div className="text-left md:text-right text-xs text-slate-500 space-y-1 shrink-0">
            <p className="font-semibold text-slate-400">15-Day Settlement Cycle</p>
            <p className="text-[11px]">Minimum withdrawal: NPR 100 • Manual verified disbursements</p>
          </div>
        </div>

        {/* Ethical Disclaimer */}
        <div className="mt-8 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-normal">
          <strong className="text-amber-400 font-bold">Important Notice: </strong>
          JK Mission does not guarantee fixed earnings or investment returns. All cashback and 3-level referral commissions are earned solely upon the purchase and verified completion of eligible physical/retail products sold by participating merchants. Inviting members or account registration alone does not generate commission.
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} JK Mission. All rights reserved.</p>
          <p className="flex items-center justify-center sm:justify-end space-x-1">
            <span>Official Smart Retail & Cashback Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

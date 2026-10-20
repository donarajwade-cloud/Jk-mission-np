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
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-5 px-3 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
            <span>Official Currency: रु (नेपाली रूपैयाँ)</span>
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
      <div className="bg-amber-400 text-slate-950 py-3.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-300 font-black flex items-center justify-center text-base">
              JK
            </div>
            <div>
              <p className="font-extrabold text-slate-950 text-sm sm:text-base leading-tight">
                JK Mission — Smart Retail Traditional Business
              </p>
              <p className="text-[11px] text-slate-900 font-semibold">
                Smart Retail, Cashback & Referral Platform • Currency: रु (नेपाली रूपैयाँ)
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
              Currency: रु (नेपाली रूपैयाँ)
            </span>
            <span className="bg-amber-300/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Direct Bank & eSewa Transfer
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12">
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
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://wa.me/9779766133831?text=Namaste%20JK%20Mission%20Nepal%2C%20I%20need%20support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-colors"
                title="Chat with official support on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp: +977 9766133831</span>
              </a>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Asia/Kathmandu (रु)</span>
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

          {/* Col 3: Portal Dashboards & Direct Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Direct Portals</h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('customer-dashboard')}
                className="w-full text-left p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-850 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-amber-300">Customer Portal</div>
                  <div className="text-[10px] font-mono text-slate-500">https://jkmissionnp.com/user</div>
                </div>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">/user</span>
              </button>

              <button
                onClick={() => onNavigate('shopkeeper-dashboard')}
                className="w-full text-left p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-400/50 hover:bg-slate-850 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-blue-300">Shopkeeper Hub</div>
                  <div className="text-[10px] font-mono text-slate-500">https://jkmissionnp.com/shopkeeper</div>
                </div>
                <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">/shopkeeper</span>
              </button>

              {role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-amber-400">Master Admin</div>
                    <div className="text-[10px] font-mono text-slate-500">https://jkmissionnp.com/admin</div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">/admin</span>
                </button>
              )}
            </div>

            {user && (
              <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-400 capitalize flex items-center justify-between">
                  <span>Logged in as {role}</span>
                  <span className="text-slate-400 text-[10px] font-normal truncate max-w-[120px]">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => {
                      if (role === 'admin') onNavigate('admin-dashboard');
                      else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                      else onNavigate('customer-dashboard');
                    }}
                    className="text-amber-300 hover:underline font-bold"
                  >
                    Open Workspace →
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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
            <p className="text-[11px]">Minimum withdrawal: रु 100 • Manual verified disbursements</p>
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

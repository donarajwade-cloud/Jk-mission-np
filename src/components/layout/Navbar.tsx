import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatNPR } from '../../utils/format.ts';
import {
  ShoppingBag,
  Bell,
  User as UserIcon,
  Menu,
  X,
  Store,
  Layers,
  Award,
  Users,
  LogOut,
  ChevronDown,
  ShieldCheck,
  ShoppingBag as CartIcon,
  Ticket
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onOpenNotifications
}) => {
  const { user, role, customerWallet, cartCount, unreadNotifications, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isPanelRoute =
    currentView.startsWith('admin-') ||
    currentView.startsWith('shopkeeper-') ||
    currentView.startsWith('customer-');

  const navLinks = [
    { id: 'home', label: 'Store', icon: ShoppingBag },
    { id: 'products', label: 'All Products' },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'cashback', label: 'Cashback Info', icon: Award },
    { id: 'referral', label: '3-Level Referral', icon: Users }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Top Banner with Direct Portal Links (/user, /shopkeeper, /admin) */}
      <div className="bg-slate-950 text-slate-300 text-xs font-semibold px-3 py-1.5 border-b border-slate-800">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-black shrink-0">
              JK MISSION NEPAL
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Smart Retail, Real Cashback & 3-Level Referral • Currency: रु (नेपाली रूपैयाँ)
            </span>
            <a
              href="https://wa.me/9779766133831?text=Namaste%20JK%20Mission%20Nepal%2C%20I%20need%20support"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 text-[10px] font-bold border border-[#25D366]/30 transition-colors"
              title="WhatsApp Support: +977 9766133831"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp: +977 9766133831</span>
            </a>
          </div>

          {/* Quick Direct Portal Links */}
          <div className="flex items-center space-x-1.5 text-[11px] font-bold">
            <span className="text-slate-500 mr-1 hidden sm:inline">Direct Portals:</span>
            <button
              onClick={() => onNavigate('customer-dashboard')}
              className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 ${
                currentView.startsWith('customer-')
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Customer Portal: /user"
            >
              <span>👤</span>
              <span>/user</span>
            </button>

            <button
              onClick={() => onNavigate('shopkeeper-dashboard')}
              className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 ${
                currentView.startsWith('shopkeeper-')
                  ? 'bg-blue-500 text-white font-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Shopkeeper Portal: /shopkeeper"
            >
              <span>🏪</span>
              <span>/shopkeeper</span>
            </button>

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-2 py-0.5 rounded transition-colors flex items-center space-x-1 ${
                  currentView.startsWith('admin-')
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="Master Admin Portal: /admin"
              >
                <span>🛡️</span>
                <span>/admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-300/40 text-slate-950 font-black text-xl tracking-tighter group-hover:scale-105 transition-transform">
              JK
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 leading-none uppercase">
                JK Mission
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                    active
                      ? 'bg-amber-100/70 text-amber-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-amber-500" />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Become a Shopkeeper Button */}
            {(!user || role === 'customer') && (
              <button
                onClick={() => onNavigate('register-shopkeeper')}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100/80 text-amber-950 border border-amber-300 transition-all shadow-2xs"
                title="Register your store on JK Mission"
              >
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Become a Shopkeeper</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-amber-50 transition-colors"
              title="Shopping Cart"
            >
              <CartIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-amber-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons / Dropdown */}
            {user ? (
              <div className="flex items-center space-x-2">
                {!isPanelRoute ? (
                  <button
                    onClick={() => {
                      if (role === 'admin') onNavigate('admin-dashboard');
                      else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                      else onNavigate('customer-dashboard');
                    }}
                    className="hidden sm:inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs"
                  >
                    <span>
                      {role === 'admin'
                        ? 'Admin Portal'
                        : role === 'shopkeeper'
                        ? 'Shopkeeper Hub'
                        : 'My Dashboard'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('home')}
                    className="hidden sm:inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-amber-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-200"
                  >
                    <span>Visit Store</span>
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 bg-amber-50 border border-amber-200/80 hover:bg-amber-100/70 text-slate-900 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold leading-tight truncate max-w-[110px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-amber-700 capitalize font-medium">
                        {role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs font-mono text-slate-500">{user.mobile}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                          {role} account
                        </span>
                      </div>

                      {/* Role specific links */}
                      <div className="p-1">
                        {role === 'customer' && (
                          <>
                            <button
                              onClick={() => onNavigate('customer-dashboard')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <span>Customer Dashboard</span>
                              <span className="text-xs font-bold text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded">
                                Hub
                              </span>
                            </button>
                            <button
                              onClick={() => onNavigate('customer-wallets')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <span>Wallets & Cashback</span>
                              <span className="text-xs font-semibold text-emerald-600">
                                {customerWallet ? formatNPR(customerWallet.cashbackAvailableNpr) : ''}
                              </span>
                            </button>
                            <button
                              onClick={() => onNavigate('customer-coupons')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <span>My Cashback Coupons</span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                3-Level
                              </span>
                            </button>
                            <button
                              onClick={() => onNavigate('customer-referrals')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              3-Level Referral Team
                            </button>
                            <button
                              onClick={() => onNavigate('customer-orders')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              My Orders & Invoices
                            </button>
                            <button
                              onClick={() => onNavigate('register-shopkeeper')}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100/80 flex items-center space-x-1.5 mt-1"
                            >
                              <Store className="w-3.5 h-3.5 text-amber-700" />
                              <span>Register as Shopkeeper</span>
                            </button>
                          </>
                        )}

                        {role === 'shopkeeper' && (
                          <>
                            <button
                              onClick={() => onNavigate('shopkeeper-dashboard')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium flex items-center justify-between"
                            >
                              <span>Shopkeeper Dashboard</span>
                              <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                                Shop
                              </span>
                            </button>
                            <button
                              onClick={() => onNavigate('shopkeeper-products')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Submit & View Products
                            </button>
                            <button
                              onClick={() => onNavigate('shopkeeper-inventory')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Inventory & Stock
                            </button>
                            <button
                              onClick={() => onNavigate('shopkeeper-orders')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Orders & Sales
                            </button>
                            <button
                              onClick={() => onNavigate('shopkeeper-wallet')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Commission Wallet
                            </button>
                          </>
                        )}

                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => onNavigate('admin-dashboard')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-bold flex items-center justify-between"
                            >
                              <span>Admin Portal</span>
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                            </button>
                            <button
                              onClick={() => onNavigate('admin-products')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Product Approvals
                            </button>
                            <button
                              onClick={() => onNavigate('admin-customers')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Customer Traditional Business
                            </button>
                            <button
                              onClick={() => onNavigate('admin-shopkeepers')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Shopkeeper Approvals
                            </button>
                            <button
                              onClick={() => onNavigate('admin-coupons')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Customer Cashback Coupons (20%)
                            </button>
                            <button
                              onClick={() => onNavigate('admin-withdrawals')}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-slate-900 font-medium"
                            >
                              Withdrawals & Settlements
                            </button>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 font-medium flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Dedicated Shopkeeper Login */}
                <button
                  onClick={() => onNavigate('login', 'shopkeeper')}
                  className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                  title="Shopkeeper Merchant Login"
                >
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shopkeeper Login</span>
                </button>

                {/* Dedicated User / Customer Login */}
                <button
                  onClick={() => onNavigate('login', 'customer')}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>User Login</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Direct Portal Shortcuts for Mobile */}
          <div className="bg-slate-900 p-2.5 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Direct Subdomain & Path Portals
            </span>
            <div className={`grid ${role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 text-xs font-bold`}>
              <button
                onClick={() => {
                  onNavigate('customer-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-amber-400 text-slate-950 text-center truncate"
                title="Customer Portal: /user"
              >
                👤 /user
              </button>
              <button
                onClick={() => {
                  onNavigate('shopkeeper-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 px-2 rounded-lg bg-blue-600 text-white text-center truncate"
                title="Shopkeeper Portal: /shopkeeper"
              >
                🏪 /shopkeeper
              </button>
              {role === 'admin' && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-amber-500 text-slate-950 text-center truncate"
                  title="Admin Portal: /admin"
                >
                  🛡️ /admin
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2.5 rounded-xl text-left text-sm font-semibold bg-slate-50 hover:bg-amber-50 text-slate-800 flex items-center space-x-2"
              >
                {link.icon && <link.icon className="w-4 h-4 text-amber-500" />}
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {!user ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('login', 'customer');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-black bg-amber-400 text-slate-950 text-center flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <UserIcon className="w-4 h-4" />
                <span>User Login</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('login', 'shopkeeper');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-800 text-center flex items-center justify-center space-x-1.5"
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span>Shopkeeper Login</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('register-shopkeeper');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-50 border border-amber-300 text-center flex items-center justify-center space-x-1"
              >
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Become a Shopkeeper</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('register-customer');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 text-center"
              >
                New Customer? Create Account
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  if (role === 'admin') onNavigate('admin-dashboard');
                  else if (role === 'shopkeeper') onNavigate('shopkeeper-dashboard');
                  else onNavigate('customer-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-slate-950 text-center shadow-xs"
              >
                Go to {role === 'admin' ? 'Admin Portal' : role === 'shopkeeper' ? 'Shopkeeper Panel' : 'Customer Panel'}
              </button>

              {role === 'customer' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigate('customer-wallets');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center"
                  >
                    Wallets & Cashback
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('customer-orders');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center"
                  >
                    My Orders
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-center"
              >
                Sign Out ({user.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

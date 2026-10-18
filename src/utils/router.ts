export interface ParsedRoute {
  view: string;
  param?: string;
}

/**
 * Parses the current browser location (supports pathnames, query params, hash fallback, and subdomains)
 * Specifically supports:
 * - https://jkmissionnp.com/admin
 * - https://jkmissionnp.com/shopkeeper
 * - https://jkmissionnp.com/user
 * as well as subdomains:
 * - admin.jkmissionnp.com
 * - shopkeeper.jkmissionnp.com
 * - user.jkmissionnp.com
 */
export function parseCurrentLocation(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  // Clean pathname and remove trailing slashes or .html extensions
  let rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  rawPath = rawPath.replace(/\.html$/, '');

  const hash = (window.location.hash || '').replace(/^#\/?/, '').replace(/\.html$/, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname.toLowerCase();

  // 0. Query parameter override (e.g. ?portal=admin or ?role=admin)
  const portalQuery = searchParams.get('portal') || searchParams.get('role');
  if (portalQuery === 'admin' && rawPath === '/') {
    return { view: 'admin-dashboard' };
  }
  if (portalQuery === 'shopkeeper' && rawPath === '/') {
    return { view: 'shopkeeper-dashboard' };
  }
  if ((portalQuery === 'user' || portalQuery === 'customer') && rawPath === '/') {
    return { view: 'customer-dashboard' };
  }

  // 1. Subdomain Detection (e.g. admin.jkmissionnp.com, shopkeeper.jkmissionnp.com, user.jkmissionnp.com)
  const isSubdomainAdmin = hostname.startsWith('admin.') || hostname === 'admin';
  const isSubdomainShopkeeper = hostname.startsWith('shopkeeper.') || hostname === 'shopkeeper';
  const isSubdomainUser = hostname.startsWith('user.') || hostname.startsWith('customer.') || hostname === 'user';

  // Use hash if on root and hash route exists (e.g. #/admin or #admin)
  const effectivePath = (rawPath === '/' && hash) ? `/${hash}` : rawPath;
  const segments = effectivePath.split('/').filter(Boolean);
  const first = segments[0] || '';
  const second = segments[1] || '';

  if (isSubdomainAdmin) {
    if (!first || first === 'admin' || first === 'dashboard') return { view: 'admin-dashboard' };
    if (first === 'products') return { view: 'admin-products' };
    if (first === 'customers') return { view: 'admin-customers' };
    if (first === 'shopkeepers') return { view: 'admin-shopkeepers' };
    if (first === 'orders') return { view: 'admin-orders' };
    if (first === 'coupons') return { view: 'admin-coupons' };
    if (first === 'withdrawals') return { view: 'admin-withdrawals' };
    if (first === 'ledgers') return { view: 'admin-ledgers' };
    if (first === 'settings') return { view: 'admin-settings' };
    if (first === 'audit-logs' || first === 'auditlogs') return { view: 'admin-audit-logs' };
    if (first === 'login') return { view: 'admin-dashboard' };
  }

  if (isSubdomainShopkeeper) {
    if (!first || first === 'shopkeeper' || first === 'dashboard') return { view: 'shopkeeper-dashboard' };
    if (first === 'products') return { view: 'shopkeeper-products' };
    if (first === 'inventory') return { view: 'shopkeeper-inventory' };
    if (first === 'orders') return { view: 'shopkeeper-orders' };
    if (first === 'wallet') return { view: 'shopkeeper-wallet' };
    if (first === 'login') return { view: 'shopkeeper-dashboard' };
  }

  if (isSubdomainUser) {
    if (!first || first === 'user' || first === 'customer' || first === 'dashboard') return { view: 'customer-dashboard' };
    if (first === 'wallets' || first === 'wallet') return { view: 'customer-wallets' };
    if (first === 'coupons') return { view: 'customer-coupons' };
    if (first === 'referrals' || first === 'team') return { view: 'customer-referrals' };
    if (first === 'orders') return { view: 'customer-orders' };
    if (first === 'withdrawals') return { view: 'customer-withdrawals' };
    if (first === 'login') return { view: 'customer-dashboard' };
  }

  // 2. ADMIN PORTAL DIRECT PATHS
  // https://jkmissionnp.com/admin
  if (first === 'admin') {
    if (!second || second === 'dashboard' || second === 'login' || second === 'portal') return { view: 'admin-dashboard' };
    if (second === 'products') return { view: 'admin-products' };
    if (second === 'customers') return { view: 'admin-customers' };
    if (second === 'shopkeepers') return { view: 'admin-shopkeepers' };
    if (second === 'orders') return { view: 'admin-orders' };
    if (second === 'coupons') return { view: 'admin-coupons' };
    if (second === 'withdrawals') return { view: 'admin-withdrawals' };
    if (second === 'ledgers') return { view: 'admin-ledgers' };
    if (second === 'settings') return { view: 'admin-settings' };
    if (second === 'audit-logs' || second === 'auditlogs') return { view: 'admin-audit-logs' };
    return { view: 'admin-dashboard' };
  }

  // 3. SHOPKEEPER PORTAL DIRECT PATHS
  // https://jkmissionnp.com/shopkeeper
  if (first === 'shopkeeper' || first === 'merchant') {
    if (!second || second === 'dashboard' || second === 'login' || second === 'portal') return { view: 'shopkeeper-dashboard' };
    if (second === 'products') return { view: 'shopkeeper-products' };
    if (second === 'inventory') return { view: 'shopkeeper-inventory' };
    if (second === 'orders') return { view: 'shopkeeper-orders' };
    if (second === 'wallet') return { view: 'shopkeeper-wallet' };
    return { view: 'shopkeeper-dashboard' };
  }

  // 4. CUSTOMER / USER PORTAL DIRECT PATHS
  // https://jkmissionnp.com/user or https://jkmissionnp.com/customer
  if (first === 'user' || first === 'customer') {
    if (!second || second === 'dashboard' || second === 'login' || second === 'portal') return { view: 'customer-dashboard' };
    if (second === 'wallets' || second === 'wallet') return { view: 'customer-wallets' };
    if (second === 'coupons') return { view: 'customer-coupons' };
    if (second === 'referrals' || second === 'team') return { view: 'customer-referrals' };
    if (second === 'orders') return { view: 'customer-orders' };
    if (second === 'withdrawals') return { view: 'customer-withdrawals' };
    return { view: 'customer-dashboard' };
  }

  // 5. PUBLIC ROUTES
  if (first === 'products') {
    const shopId = searchParams.get('shop') || second || undefined;
    return { view: 'products', param: shopId };
  }
  if (first === 'product') {
    return { view: 'product-detail', param: second || 'prod_1' };
  }
  if (first === 'shops' || first === 'stores') {
    return { view: 'shops' };
  }
  if (first === 'how-it-works' || first === 'howitworks') {
    return { view: 'how-it-works' };
  }
  if (first === 'cashback') {
    return { view: 'cashback' };
  }
  if (first === 'referral' || first === 'referrals') {
    return { view: 'referral' };
  }
  if (first === 'checkout') {
    return { view: 'checkout' };
  }
  if (first === 'order-confirmation' || first === 'order-success' || first === 'track') {
    return { view: 'order-confirmation', param: second || searchParams.get('id') || searchParams.get('orderId') || undefined };
  }
  if (first === 'login') {
    const roleParam = searchParams.get('role') || second;
    if (roleParam === 'admin') return { view: 'admin-dashboard' };
    if (roleParam === 'shopkeeper') return { view: 'shopkeeper-dashboard' };
    if (roleParam === 'customer' || roleParam === 'user') return { view: 'customer-dashboard' };
    return { view: 'login', param: roleParam || undefined };
  }
  if (first === 'register') {
    if (second === 'shopkeeper') return { view: 'register-shopkeeper' };
    return { view: 'register-customer' };
  }
  if (first === 'register-shopkeeper') {
    return { view: 'register-shopkeeper' };
  }
  if (first === 'register-customer') {
    return { view: 'register-customer' };
  }
  if (first === 'policy' || first === 'policies') {
    const tab = searchParams.get('tab') || second || 'terms';
    return { view: 'policy', param: tab };
  }
  if (first === 'contact' || first === 'support') {
    return { view: 'contact' };
  }

  return { view: 'home' };
}

/**
 * Maps a view state and optional parameter to its canonical URL path
 */
export function getViewUrl(view: string, param?: string): string {
  switch (view) {
    case 'home':
      return '/';
    case 'products':
      return param ? `/products?shop=${encodeURIComponent(param)}` : '/products';
    case 'product-detail':
      return param ? `/product/${encodeURIComponent(param)}` : '/products';
    case 'shops':
      return '/shops';
    case 'how-it-works':
      return '/how-it-works';
    case 'cashback':
      return '/cashback';
    case 'referral':
      return '/referral';
    case 'checkout':
      return '/checkout';
    case 'order-confirmation':
      return param ? `/order-confirmation/${encodeURIComponent(param)}` : '/order-confirmation';
    case 'login':
      if (param === 'admin') return '/admin';
      if (param === 'shopkeeper') return '/shopkeeper';
      if (param === 'customer' || param === 'user') return '/user';
      return '/login';
    case 'register-customer':
      return '/register/customer';
    case 'register-shopkeeper':
      return '/register/shopkeeper';
    case 'policy':
      return param ? `/policy?tab=${encodeURIComponent(param)}` : '/policy';
    case 'contact':
      return '/contact';

    // Admin Views (https://jkmissionnp.com/admin)
    case 'admin-dashboard':
      return '/admin';
    case 'admin-products':
      return '/admin/products';
    case 'admin-customers':
      return '/admin/customers';
    case 'admin-shopkeepers':
      return '/admin/shopkeepers';
    case 'admin-orders':
      return '/admin/orders';
    case 'admin-coupons':
      return '/admin/coupons';
    case 'admin-withdrawals':
      return '/admin/withdrawals';
    case 'admin-ledgers':
      return '/admin/ledgers';
    case 'admin-settings':
      return '/admin/settings';
    case 'admin-audit-logs':
      return '/admin/audit-logs';

    // Shopkeeper Views (https://jkmissionnp.com/shopkeeper)
    case 'shopkeeper-dashboard':
      return '/shopkeeper';
    case 'shopkeeper-products':
      return '/shopkeeper/products';
    case 'shopkeeper-inventory':
      return '/shopkeeper/inventory';
    case 'shopkeeper-orders':
      return '/shopkeeper/orders';
    case 'shopkeeper-wallet':
      return '/shopkeeper/wallet';

    // Customer / User Views (https://jkmissionnp.com/user)
    case 'customer-dashboard':
      return '/user';
    case 'customer-wallets':
      return '/user/wallets';
    case 'customer-coupons':
      return '/user/coupons';
    case 'customer-referrals':
      return '/user/referrals';
    case 'customer-orders':
      return '/user/orders';
    case 'customer-withdrawals':
      return '/user/withdrawals';

    default:
      return '/';
  }
}

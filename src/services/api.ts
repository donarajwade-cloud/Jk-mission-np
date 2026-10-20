import {
  User,
  Product,
  Order,
  CustomerWallet,
  ShopkeeperWallet,
  WithdrawalRequest,
  AppNotification,
  AuditLog,
  SystemSettings,
  Shop,
  ProductCommissionSettings,
  CashbackCoupon,
  CashbackCouponRule,
  DeliveryStatus
} from '../types/index.ts';

import { handleLocalFallbackRequest } from './localStore.ts';

const TOKEN_KEY = 'jkmission_auth_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response | null = null;
  let fetchFailed = false;

  try {
    response = await fetch(endpoint, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.warn(`[API Network Failed on ${endpoint}] Falling back to client-side data store:`, netErr);
    fetchFailed = true;
  }

  // If backend is not available, or static hosting returned 404 / HTML non-JSON
  if (fetchFailed || !response) {
    return handleLocalFallbackRequest<T>(endpoint, options);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json') || response.status === 404) {
    console.warn(`[API Non-JSON or 404 on ${endpoint}] Using client-side data fallback (Hostinger static mode)`);
    try {
      return handleLocalFallbackRequest<T>(endpoint, options);
    } catch (fallbackErr: any) {
      const text = await response.text();
      console.error(`[API Non-JSON Response] ${response.status} from ${endpoint}:`, text.slice(0, 200));
      throw new Error(fallbackErr?.message || `Server returned status ${response.status} (${response.statusText || 'Non-JSON response'})`);
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch (err: any) {
    console.warn(`[API Parse Error] on ${endpoint}, falling back to local store:`, err);
    return handleLocalFallbackRequest<T>(endpoint, options);
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth
  registerCustomer: (payload: { name: string; mobile: string; password: string; sponsorReferralMobile?: string; termsAccepted: boolean }) =>
    request<{ success: boolean; token: string; user: User; wallet: CustomerWallet }>('/api/auth/register-customer', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  registerShopkeeper: (payload: { fullName: string; mobile: string; password: string; shopName: string; shopAddress: string; district: string; municipality: string; panOrVatNumber?: string }) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/register-shopkeeper', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { mobile?: string; email?: string; identifier?: string; password: string }) =>
    request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: payload.identifier || payload.email || payload.mobile,
        email: payload.email || payload.identifier,
        mobile: payload.mobile || payload.identifier,
        password: payload.password
      })
    }),

  getMe: () =>
    request<{
      success: boolean;
      user: User;
      customerProfile?: any;
      customerWallet?: CustomerWallet;
      shopkeeperProfile?: any;
      shopkeeperWallet?: ShopkeeperWallet;
      shop?: Shop;
      unreadNotifications: number;
    }>('/api/auth/me'),

  // Products
  getProducts: (params?: { category?: string; search?: string; shopId?: string; minPrice?: number; maxPrice?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.shopId) query.append('shopId', params.shopId);
    if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    return request<{ success: boolean; count: number; products: Product[] }>(`/api/products?${query.toString()}`);
  },

  getProduct: (id: string) =>
    request<{ success: boolean; product: Product }>(`/api/products/${id}`),

  getCategories: () =>
    request<{ success: boolean; categories: string[] }>('/api/products/categories'),

  // Shopkeeper product actions
  submitProduct: (payload: {
    name: string;
    description: string;
    category: string;
    costPriceNpr: number;
    proposedSellingPriceNpr: number;
    stockQuantity: number;
    sku?: string;
    imageUrl?: string;
    galleryImages?: string[];
    specifications?: Record<string, string>;
  }) =>
    request<{ success: boolean; message: string; product: Product }>('/api/products/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMySubmissions: () =>
    request<{ success: boolean; products: Product[] }>('/api/products/my-submissions'),

  updateStock: (productId: string, stockQuantity: number) =>
    request<{ success: boolean; product: Product }>(`/api/products/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stockQuantity })
    }),

  // Admin product actions
  getAdminProducts: () =>
    request<{ success: boolean; products: Product[] }>('/api/products/admin-list'),

  previewCommissions: (payload: { sellingPriceNpr: number; costPriceNpr: number; commissionSettings: ProductCommissionSettings }) =>
    request<{ success: boolean; preview: any }>('/api/products/preview-commissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  configureAndApproveProduct: (id: string, payload: { finalSellingPriceNpr: number; commissionSettings: ProductCommissionSettings }) =>
    request<{ success: boolean; message: string; product: Product }>(`/api/products/${id}/configure-and-approve`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  rejectProduct: (id: string, reason: string) =>
    request<{ success: boolean; message: string }>(`/api/products/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  toggleProductStatus: (id: string) =>
    request<{ success: boolean; product: Product }>(`/api/products/${id}/toggle-status`, {
      method: 'PUT'
    }),

  updateProduct: (id: string, payload: Partial<Product>) =>
    request<{ success: boolean; message: string; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Orders
  createOrder: (payload: {
    items: { productId: string; quantity: number }[];
    paymentMethod: 'esewa' | 'khalti' | 'bank_transfer' | 'cash_on_delivery';
    paymentReference?: string;
    shippingAddress: { fullName: string; mobile: string; street: string; city: string; district: string };
    couponCode?: string;
  }) =>
    request<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMyOrders: () =>
    request<{ success: boolean; orders: Order[] }>('/api/orders/my-orders'),

  getShopOrders: () =>
    request<{ success: boolean; orders: Order[] }>('/api/orders/shop-orders'),

  getAdminOrders: () =>
    request<{ success: boolean; orders: Order[] }>('/api/orders/admin-list'),

  getOrder: (id: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}`),

  verifyOrderPayment: (id: string) =>
    request<{ success: boolean; order: Order }>(`/api/orders/${id}/verify-payment`, {
      method: 'PUT'
    }),

  completeOrderAndReleaseCommissions: (id: string) =>
    request<{ success: boolean; message: string; order: Order }>(`/api/orders/${id}/complete-and-release-commission`, {
      method: 'PUT'
    }),

  refundOrder: (id: string, reason: string) =>
    request<{ success: boolean; message: string; order: Order }>(`/api/orders/${id}/refund`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  updateDeliveryStatus: (
    id: string,
    payload: {
      deliveryStatus: DeliveryStatus;
      courierName?: string;
      trackingNumber?: string;
      deliveryNotes?: string;
      estimatedDeliveryDate?: string;
    }
  ) =>
    request<{ success: boolean; message: string; order: Order }>(`/api/orders/${id}/delivery-status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Wallets & Withdrawals
  getCustomerWallet: () =>
    request<{
      success: boolean;
      wallet: CustomerWallet;
      cashbackHistory: any[];
      referralIncomeHistory: any[];
      withdrawals: WithdrawalRequest[];
    }>('/api/wallets/customer'),

  getShopkeeperWallet: () =>
    request<{
      success: boolean;
      wallet: ShopkeeperWallet;
      commissions: any[];
      withdrawals: WithdrawalRequest[];
    }>('/api/wallets/shopkeeper'),

  requestWithdrawal: (payload: {
    amountNpr: number;
    paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
    accountDetails: { accountNumberOrId: string; accountHolderName: string; bankName?: string; branchName?: string };
  }) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest }>('/api/wallets/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAdminWithdrawals: (status?: string) =>
    request<{ success: boolean; withdrawals: WithdrawalRequest[] }>(`/api/wallets/admin/withdrawals${status ? `?status=${status}` : ''}`),

  approveWithdrawal: (id: string, adminNotes?: string) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest }>(`/api/wallets/admin/withdrawals/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ adminNotes })
    }),

  rejectWithdrawal: (id: string, reason: string) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest }>(`/api/wallets/admin/withdrawals/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  recordWithdrawalPayment: (id: string, payload: { paymentReferenceNumber: string; adminNotes?: string }) =>
    request<{ success: boolean; withdrawal: WithdrawalRequest }>(`/api/wallets/admin/withdrawals/${id}/record-payment`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  getSettlementReport: () =>
    request<{
      success: boolean;
      settlementCycleDays: number;
      summary: any;
      recentWithdrawals: WithdrawalRequest[];
    }>('/api/wallets/admin/settlement-report'),

  // Admin Management
  getAdminOverview: () =>
    request<{ success: boolean; stats: any }>('/api/admin/overview'),

  getAdminCustomers: (search?: string) =>
    request<{ success: boolean; count: number; customers: any[] }>(`/api/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getCustomerReferralTree: (userId?: string) =>
    request<{
      success: boolean;
      customer: any;
      tree: {
        level1: any;
        level2: any;
        level3: any;
        totalNetworkMembers: number;
        totalNetworkCommissionNpr: number;
      };
    }>(`/api/wallets/customer/referral-tree${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),

  getAdminCustomerReferralTree: (userId: string) =>
    request<{
      success: boolean;
      customer: any;
      tree: {
        level1: any;
        level2: any;
        level3: any;
        totalNetworkMembers: number;
        totalNetworkCommissionNpr: number;
      };
    }>(`/api/admin/customers/${userId}/referral-tree`),

  updateCustomerStatus: (userId: string, payload: { status: 'active' | 'suspended'; suspendedReason?: string }) =>
    request<{ success: boolean; user: User }>(`/api/admin/customers/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  getAdminShopkeepers: () =>
    request<{ success: boolean; shopkeepers: any[] }>('/api/admin/shopkeepers'),

  reviewShopkeeper: (id: string, payload: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
    request<{ success: boolean; shopkeeper: any }>(`/api/admin/shopkeepers/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  getFinancialLedgers: () =>
    request<{
      success: boolean;
      cashbackLedger: any[];
      referralLedger: any[];
      shopkeeperLedger: any[];
    }>('/api/admin/financial-ledgers'),

  getSettings: () =>
    request<{ success: boolean; settings: SystemSettings }>('/api/admin/settings'),

  updateSettings: (settings: Partial<SystemSettings>) =>
    request<{ success: boolean; settings: SystemSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  getAuditLogs: () =>
    request<{ success: boolean; logs: AuditLog[] }>('/api/admin/audit-logs'),

  // Shops
  getShops: (params?: { district?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.district) q.append('district', params.district);
    if (params?.search) q.append('search', params.search);
    return request<{ success: boolean; count: number; shops: Shop[] }>(`/api/shops?${q.toString()}`);
  },

  getShopDetails: (id: string) =>
    request<{ success: boolean; shop: Shop; products: Product[] }>(`/api/shops/${id}`),

  // Notifications
  getNotifications: () =>
    request<{ success: boolean; notifications: AppNotification[] }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/mark-all-read', { method: 'PUT' }),

  // Customer 20% Cashback Coupons
  getMyCoupons: () =>
    request<{ success: boolean; coupons: CashbackCoupon[]; rule: CashbackCouponRule }>('/api/coupons/my-coupons'),

  validateCoupon: (code: string, cartTotalNpr: number) =>
    request<{
      success: boolean;
      valid: boolean;
      discountNpr: number;
      finalTotalNpr: number;
      coupon: {
        code: string;
        discountPercentage: number;
        level: 1 | 2 | 3;
        expiresAt: string;
      };
      error?: string;
    }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotalNpr })
    }),

  getAdminCouponRules: () =>
    request<{ success: boolean; rule: CashbackCouponRule }>('/api/coupons/admin/rules'),

  updateAdminCouponRules: (rules: Partial<CashbackCouponRule>) =>
    request<{ success: boolean; message: string; rule: CashbackCouponRule }>('/api/coupons/admin/rules', {
      method: 'PUT',
      body: JSON.stringify(rules)
    }),

  getAdminCouponsList: () =>
    request<{
      success: boolean;
      coupons: CashbackCoupon[];
      rule: CashbackCouponRule;
      stats: {
        totalIssued: number;
        availableCount: number;
        usedCount: number;
        totalSavedNpr: number;
      };
    }>('/api/coupons/admin/list'),

  createCustomCoupon: (payload: {
    targetUserId: string;
    discountPercentage: number;
    level?: 1 | 2 | 3;
    minOrderAmountNpr?: number;
    maxDiscountNpr?: number;
    validityDays?: number;
    customCode?: string;
  }) =>
    request<{ success: boolean; message: string; coupon: CashbackCoupon }>('/api/coupons/admin/create-custom', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

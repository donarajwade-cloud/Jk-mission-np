export type UserRole = 'admin' | 'shopkeeper' | 'customer';

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile: string; // e.g. "+9779812345678"
  role: UserRole;
  referralId: string; // mobile number with +977
  sponsorReferralId?: string; // upline mobile number
  status: 'active' | 'suspended' | 'pending';
  suspendedReason?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  referralId: string;
  sponsorReferralId?: string;
  address?: string;
  city?: string;
  district?: string;
  createdAt: string;
}

export interface ShopkeeperProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  shopName: string;
  shopAddress: string;
  district: string;
  municipality: string;
  panOrVatNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  shopkeeperId: string;
  shopkeeperUserId: string;
  name: string;
  address: string;
  district: string;
  municipality: string;
  phone: string;
  description: string;
  rating: number;
  featured: boolean;
  isOpen: boolean;
  imageUrl?: string;
}

export interface ProductCommissionSettings {
  // Financial breakdown configured by Admin:
  customerCashbackType: 'fixed' | 'percentage';
  customerCashbackValue: number; // NPR or % of selling price
  
  referralPoolType: 'fixed' | 'percentage';
  referralPoolValue: number; // Base referral pool amount in NPR or % of margin
  
  level1Percentage: number; // e.g., 15% of referral pool
  level2Percentage: number; // e.g., 10% of referral pool
  level3Percentage: number; // e.g., 5% of referral pool
  
  shopkeeperCommissionType: 'fixed' | 'percentage';
  shopkeeperCommissionValue: number; // NPR or % of selling price
  
  companyShareNpr: number; // NPR retained by company
  permittedExpensesNpr: number; // Business/handling expenses
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  shopkeeperUserId: string;
  name: string;
  description: string;
  category: string;
  costPriceNpr: number;
  proposedSellingPriceNpr: number;
  finalSellingPriceNpr: number;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string;
  imageUrl: string;
  specifications?: Record<string, string>;
  status: 'pending_approval' | 'approved' | 'rejected' | 'disabled';
  rejectionReason?: string;
  commissionSettings?: ProductCommissionSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  shopkeeperUserId: string;
  quantity: number;
  unitPriceNpr: number;
  unitCostNpr: number;
  totalNpr: number;
  // Snapshot of approved commissions at time of sale
  commissionSnapshot?: {
    cashbackNpr: number;
    referralPoolNpr: number;
    level1Npr: number;
    level2Npr: number;
    level3Npr: number;
    shopkeeperCommissionNpr: number;
    companyShareNpr: number;
    expensesNpr: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  totalAmountNpr: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank_transfer' | 'cash_on_delivery';
  paymentReference?: string;
  paymentStatus: 'pending' | 'verified' | 'failed' | 'refunded';
  orderStatus: 'placed' | 'processing' | 'delivered' | 'completed' | 'cancelled';
  shippingAddress: {
    fullName: string;
    mobile: string;
    street: string;
    city: string;
    district: string;
  };
  commissionProcessed: boolean;
  couponCode?: string;
  couponDiscountNpr?: number;
  awardedCoupon?: {
    code: string;
    discountPercentage: number;
    level: 1 | 2 | 3;
  };
  createdAt: string;
  completedAt?: string;
  refundReason?: string;
}

export interface CashbackCouponRule {
  id: string;
  enabled: boolean;
  title: string;
  level1Percentage: number; // e.g. 10%
  level2Percentage: number; // e.g. 15%
  level3Percentage: number; // e.g. 20%
  level1MinSpendNpr: number; // min order amount to qualify for level 1 (e.g. 0)
  level2MinSpendNpr: number; // min order amount to qualify for level 2 (e.g. 1000)
  level3MinSpendNpr: number; // min order amount to qualify for level 3 (e.g. 2500)
  validityDays: number; // e.g. 30 days
  minOrderToApplyNpr: number; // min order total to redeem this coupon (e.g. 200)
  maxDiscountNpr?: number; // max discount cap (e.g. 1000)
  updatedAt: string;
}

export interface CashbackCoupon {
  id: string;
  code: string; // e.g. "JKMCB-L1-82914"
  userId: string;
  userName: string;
  userMobile: string;
  sourceOrderId: string;
  sourceOrderNumber: string;
  level: 1 | 2 | 3;
  discountPercentage: number;
  minOrderAmountNpr: number;
  maxDiscountNpr?: number;
  status: 'available' | 'used' | 'expired';
  usedInOrderId?: string;
  usedInOrderNumber?: string;
  usedAt?: string;
  discountAppliedNpr?: number;
  expiresAt: string;
  createdAt: string;
}

export interface CashbackLedgerEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerMobile: string;
  productId: string;
  productName: string;
  amountNpr: number;
  type: 'credit' | 'debit_reversal';
  status: 'credited' | 'reversed';
  description: string;
  createdAt: string;
}

export interface ReferralCommissionLedgerEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerCustomerId: string;
  beneficiaryCustomerId: string;
  beneficiaryMobile: string;
  referralLevel: 1 | 2 | 3;
  amountNpr: number;
  type: 'credit' | 'debit_reversal';
  status: 'credited' | 'reversed';
  description: string;
  createdAt: string;
}

export interface ShopkeeperCommissionLedgerEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  shopkeeperUserId: string;
  shopName: string;
  productId: string;
  productName: string;
  amountNpr: number;
  type: 'credit' | 'debit_reversal';
  status: 'credited' | 'reversed';
  description: string;
  createdAt: string;
}

export interface CustomerWallet {
  userId: string;
  // Separate Cashback and Income wallets
  cashbackAvailableNpr: number;
  cashbackPendingNpr: number;
  cashbackTotalEarnedNpr: number;
  
  incomeAvailableNpr: number;
  incomePendingNpr: number;
  incomeTotalEarnedNpr: number;
  incomeTotalWithdrawnNpr: number;
  updatedAt: string;
}

export interface ShopkeeperWallet {
  userId: string;
  availableCommissionNpr: number;
  pendingCommissionNpr: number;
  totalEarnedNpr: number;
  totalWithdrawnNpr: number;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userRole: 'customer' | 'shopkeeper';
  userName: string;
  userMobile: string;
  amountNpr: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
  accountDetails: {
    accountNumberOrId: string;
    accountHolderName: string;
    bankName?: string;
    branchName?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminNotes?: string;
  paymentReferenceNumber?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string; // or 'admin'
  title: string;
  message: string;
  type: 'order' | 'commission' | 'cashback' | 'withdrawal' | 'product' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorUserId: string;
  actorRole: string;
  details: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface SystemSettings {
  websiteName: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  settlementPeriodDays: number;
  minWithdrawalNpr: number;
  maxWithdrawalNpr: number;
  defaultLevel1Percent: number;
  defaultLevel2Percent: number;
  defaultLevel3Percent: number;
  unallocatedPolicy: 'company_pool' | 'reserve_fund';
}

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  CustomerProfile,
  ShopkeeperProfile,
  Shop,
  Product,
  Order,
  CashbackLedgerEntry,
  ReferralCommissionLedgerEntry,
  ShopkeeperCommissionLedgerEntry,
  CustomerWallet,
  ShopkeeperWallet,
  WithdrawalRequest,
  AppNotification,
  AuditLog,
  SystemSettings,
  CashbackCouponRule,
  CashbackCoupon
} from '../src/types/index.ts';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> hashedPassword
  customers: CustomerProfile[];
  shopkeepers: ShopkeeperProfile[];
  shops: Shop[];
  products: Product[];
  orders: Order[];
  cashbackCouponRule: CashbackCouponRule;
  coupons: CashbackCoupon[];
  cashbackLedger: CashbackLedgerEntry[];
  referralLedger: ReferralCommissionLedgerEntry[];
  shopkeeperLedger: ShopkeeperCommissionLedgerEntry[];
  customerWallets: Record<string, CustomerWallet>; // userId -> wallet
  shopkeeperWallets: Record<string, ShopkeeperWallet>; // userId -> wallet
  withdrawals: WithdrawalRequest[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jkmission.json');

let dbState: DatabaseSchema;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function persistDb() {
  ensureDataDir();
  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(dbState, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

function initDefaultSeed(): DatabaseSchema {
  const adminPassHash = bcrypt.hashSync('Admin123@', 10);
  const shopkeeperPassHash = bcrypt.hashSync('Shopkeeper@123', 10);
  const customerPassHash = bcrypt.hashSync('Customer@123', 10);

  const adminUser: User = {
    id: 'user_admin_1',
    name: 'JK Mission Administrator',
    email: 'jk5172794@gmail.com',
    mobile: '+9779766133831',
    role: 'admin',
    referralId: '+9779766133831',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const shopkeeperUser: User = {
    id: 'user_shop_1',
    name: 'Suman Tamang',
    mobile: '+9779811111111',
    role: 'shopkeeper',
    referralId: '+9779811111111',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const customer1: User = {
    id: 'user_cust_1',
    name: 'Aarav Shrestha',
    mobile: '+9779822222222',
    role: 'customer',
    referralId: '+9779822222222',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const customer2: User = {
    id: 'user_cust_2',
    name: 'Pooja Thapa',
    mobile: '+9779833333333',
    role: 'customer',
    referralId: '+9779833333333',
    sponsorReferralId: '+9779822222222', // Level 1 under Aarav
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const customer3: User = {
    id: 'user_cust_3',
    name: 'Bikash Adhikari',
    mobile: '+9779844444444',
    role: 'customer',
    referralId: '+9779844444444',
    sponsorReferralId: '+9779833333333', // Level 2 under Aarav, Level 1 under Pooja
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const shop: Shop = {
    id: 'shop_1',
    shopkeeperId: 'sk_prof_1',
    shopkeeperUserId: 'user_shop_1',
    name: 'Himalayan Organic & Retail Hub',
    address: 'New Road, Ward No. 22',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    phone: '+9779811111111',
    description: 'Premier supplier of authentic Nepali teas, spices, handicrafts, and daily organic grocery essentials.',
    rating: 4.9,
    featured: true,
    isOpen: true,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  };

  const shopkeeperProfile: ShopkeeperProfile = {
    id: 'sk_prof_1',
    userId: 'user_shop_1',
    fullName: 'Suman Tamang',
    mobile: '+9779811111111',
    shopName: 'Himalayan Organic & Retail Hub',
    shopAddress: 'New Road, Ward No. 22',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    panOrVatNumber: '601234987',
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  const products: Product[] = [
    {
      id: 'prod_1',
      shopId: 'shop_1',
      shopName: 'Himalayan Organic & Retail Hub',
      shopkeeperUserId: 'user_shop_1',
      name: 'Ilam Orthodox Green Tea (250g)',
      description: 'Hand-picked first flush organic green tea from high-altitude tea gardens of Ilam, Eastern Nepal. Rich in antioxidants and floral aroma.',
      category: 'Organic & Food',
      costPriceNpr: 320,
      proposedSellingPriceNpr: 550,
      finalSellingPriceNpr: 550,
      stockQuantity: 45,
      lowStockThreshold: 10,
      sku: 'ILAM-TEA-250',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      specifications: { 'Origin': 'Ilam, Nepal', 'Weight': '250g', 'Grade': 'First Flush Super Fine' },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 35, // NPR 35 cashback
        referralPoolType: 'fixed',
        referralPoolValue: 60, // NPR 60 referral pool
        level1Percentage: 50, // 50% of pool = NPR 30
        level2Percentage: 30, // 30% of pool = NPR 18
        level3Percentage: 20, // 20% of pool = NPR 12
        shopkeeperCommissionType: 'fixed',
        shopkeeperCommissionValue: 40, // NPR 40 for shopkeeper
        companyShareNpr: 75,
        permittedExpensesNpr: 20
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      shopId: 'shop_1',
      shopName: 'Himalayan Organic & Retail Hub',
      shopkeeperUserId: 'user_shop_1',
      name: 'Pure Mustang Apple Dried Slices (500g)',
      description: 'Naturally sun-dried sweet and tangy organic apples from Marpha, Mustang. No added sugar or artificial preservatives.',
      category: 'Snacks & Organic',
      costPriceNpr: 450,
      proposedSellingPriceNpr: 780,
      finalSellingPriceNpr: 780,
      stockQuantity: 30,
      lowStockThreshold: 8,
      sku: 'MUST-APP-500',
      imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
      specifications: { 'Origin': 'Mustang, Nepal', 'Weight': '500g', 'Sugar': '0% Added' },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 50,
        referralPoolType: 'fixed',
        referralPoolValue: 90,
        level1Percentage: 50, // NPR 45
        level2Percentage: 30, // NPR 27
        level3Percentage: 20, // NPR 18
        shopkeeperCommissionType: 'fixed',
        shopkeeperCommissionValue: 60,
        companyShareNpr: 100,
        permittedExpensesNpr: 30
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      shopId: 'shop_1',
      shopName: 'Himalayan Organic & Retail Hub',
      shopkeeperUserId: 'user_shop_1',
      name: 'Authentic Nepali Chyangra Pashmina Shawl',
      description: 'Ultra-soft handwoven high mountain cashmere pashmina shawl with traditional fringes. Verified Nepal Chyangra hallmark.',
      category: 'Apparel & Handicrafts',
      costPriceNpr: 2200,
      proposedSellingPriceNpr: 3800,
      finalSellingPriceNpr: 3800,
      stockQuantity: 18,
      lowStockThreshold: 5,
      sku: 'PASH-CHY-01',
      imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80',
      specifications: { 'Material': '100% Chyangra Cashmere', 'Size': '200x70 cm', 'Craft': 'Handloom' },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 250,
        referralPoolType: 'fixed',
        referralPoolValue: 400,
        level1Percentage: 50, // NPR 200
        level2Percentage: 30, // NPR 120
        level3Percentage: 20, // NPR 80
        shopkeeperCommissionType: 'fixed',
        shopkeeperCommissionValue: 300,
        companyShareNpr: 500,
        permittedExpensesNpr: 150
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      shopId: 'shop_1',
      shopName: 'Himalayan Organic & Retail Hub',
      shopkeeperUserId: 'user_shop_1',
      name: 'Handcrafted Himalayan Singly Singing Bowl',
      description: 'Traditional 7-metal hand-hammered meditation bowl tuned to heart chakra with wooden striker and silk cushion.',
      category: 'Handicrafts',
      costPriceNpr: 1200,
      proposedSellingPriceNpr: 2100,
      finalSellingPriceNpr: 2100,
      stockQuantity: 12,
      lowStockThreshold: 3,
      sku: 'SING-BOWL-MED',
      imageUrl: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=600&q=80',
      status: 'pending_approval', // Pending approval to demonstrate Admin review workflow!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const now = new Date().toISOString();

  return {
    users: [adminUser, shopkeeperUser, customer1, customer2, customer3],
    passwords: {
      [adminUser.id]: adminPassHash,
      [shopkeeperUser.id]: shopkeeperPassHash,
      [customer1.id]: customerPassHash,
      [customer2.id]: customerPassHash,
      [customer3.id]: customerPassHash
    },
    customers: [
      {
        id: 'cust_prof_1',
        userId: customer1.id,
        fullName: customer1.name,
        mobile: customer1.mobile,
        referralId: customer1.referralId,
        city: 'Kathmandu',
        district: 'Kathmandu',
        createdAt: now
      },
      {
        id: 'cust_prof_2',
        userId: customer2.id,
        fullName: customer2.name,
        mobile: customer2.mobile,
        referralId: customer2.referralId,
        sponsorReferralId: customer2.sponsorReferralId,
        city: 'Pokhara',
        district: 'Kaski',
        createdAt: now
      },
      {
        id: 'cust_prof_3',
        userId: customer3.id,
        fullName: customer3.name,
        mobile: customer3.mobile,
        referralId: customer3.referralId,
        sponsorReferralId: customer3.sponsorReferralId,
        city: 'Lalitpur',
        district: 'Lalitpur',
        createdAt: now
      }
    ],
    shopkeepers: [shopkeeperProfile],
    shops: [shop],
    products,
    orders: [],
    cashbackCouponRule: {
      id: 'rule_cb_default',
      enabled: true,
      title: '3-Level Purchase Cashback Coupon Engine',
      level1Percentage: 10,
      level2Percentage: 15,
      level3Percentage: 20,
      level1MinSpendNpr: 0,
      level2MinSpendNpr: 1000,
      level3MinSpendNpr: 2500,
      validityDays: 30,
      minOrderToApplyNpr: 200,
      maxDiscountNpr: 1000,
      updatedAt: now
    },
    coupons: [],
    cashbackLedger: [],
    referralLedger: [],
    shopkeeperLedger: [],
    customerWallets: {
      [customer1.id]: {
        userId: customer1.id,
        cashbackAvailableNpr: 140,
        cashbackPendingNpr: 0,
        cashbackTotalEarnedNpr: 140,
        incomeAvailableNpr: 285,
        incomePendingNpr: 0,
        incomeTotalEarnedNpr: 285,
        incomeTotalWithdrawnNpr: 0,
        updatedAt: now
      },
      [customer2.id]: {
        userId: customer2.id,
        cashbackAvailableNpr: 50,
        cashbackPendingNpr: 0,
        cashbackTotalEarnedNpr: 50,
        incomeAvailableNpr: 90,
        incomePendingNpr: 0,
        incomeTotalEarnedNpr: 90,
        incomeTotalWithdrawnNpr: 0,
        updatedAt: now
      },
      [customer3.id]: {
        userId: customer3.id,
        cashbackAvailableNpr: 0,
        cashbackPendingNpr: 0,
        cashbackTotalEarnedNpr: 0,
        incomeAvailableNpr: 0,
        incomePendingNpr: 0,
        incomeTotalEarnedNpr: 0,
        incomeTotalWithdrawnNpr: 0,
        updatedAt: now
      }
    },
    shopkeeperWallets: {
      [shopkeeperUser.id]: {
        userId: shopkeeperUser.id,
        availableCommissionNpr: 420,
        pendingCommissionNpr: 0,
        totalEarnedNpr: 420,
        totalWithdrawnNpr: 0,
        updatedAt: now
      }
    },
    withdrawals: [
      {
        id: 'wdr_sample_1',
        userId: customer1.id,
        userRole: 'customer',
        userName: customer1.name,
        userMobile: customer1.mobile,
        amountNpr: 150,
        paymentMethod: 'esewa',
        accountDetails: {
          accountNumberOrId: '9822222222',
          accountHolderName: 'Aarav Shrestha'
        },
        status: 'pending',
        requestedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    notifications: [
      {
        id: 'notif_1',
        recipientUserId: adminUser.id,
        title: 'Product Awaiting Approval',
        message: 'Himalayan Organic & Retail Hub submitted a new product: Handcrafted Himalayan Singly Singing Bowl',
        type: 'product',
        read: false,
        createdAt: now
      },
      {
        id: 'notif_2',
        recipientUserId: customer1.id,
        title: 'Welcome to JK Mission Nepal',
        message: 'Your account is verified. Your unique Referral ID is +9779822222222.',
        type: 'system',
        read: false,
        createdAt: now
      }
    ],
    auditLogs: [
      {
        id: 'audit_init',
        action: 'SYSTEM_BOOTSTRAP',
        actorUserId: 'system',
        actorRole: 'system',
        details: 'Initial system bootstrap completed with seed data and default administrator.',
        entityType: 'system',
        entityId: 'global',
        timestamp: now
      }
    ],
    systemSettings: {
      websiteName: 'JK Mission',
      websiteUrl: 'https://jkmission.np.com',
      contactEmail: 'jk5172794@gmail.com',
      contactPhone: '+9779766133831 / +9779815837905',
      address: 'New Road, Kathmandu, Nepal',
      currency: 'NPR',
      timezone: 'Asia/Kathmandu',
      settlementPeriodDays: 15,
      minWithdrawalNpr: 100,
      maxWithdrawalNpr: 50000,
      defaultLevel1Percent: 15,
      defaultLevel2Percent: 10,
      defaultLevel3Percent: 5,
      unallocatedPolicy: 'company_pool'
    }
  };
}

export function loadDatabase(): DatabaseSchema {
  ensureDataDir();
  if (dbState) {
    return dbState;
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(content);

      // Ensure Master Admin has current email and mobile
      let migrated = false;
      const admin = dbState.users.find(u => u.role === 'admin' || u.id === 'user_admin_1');
      if (admin) {
        if (admin.email !== 'jk5172794@gmail.com') {
          admin.email = 'jk5172794@gmail.com';
          migrated = true;
        }
        if (admin.mobile === '+9779800000000') {
          admin.mobile = '+9779766133831';
          admin.referralId = '+9779766133831';
          migrated = true;
        }
      }
      if (dbState.systemSettings) {
        if (dbState.systemSettings.contactEmail === 'support@jkmissionnp.com') {
          dbState.systemSettings.contactEmail = 'jk5172794@gmail.com';
          migrated = true;
        }
        if (dbState.systemSettings.contactPhone === '+977-1-4220000') {
          dbState.systemSettings.contactPhone = '+9779766133831 / +9779815837905';
          migrated = true;
        }
        if (dbState.systemSettings.websiteUrl === 'https://www.jkmissionnp.com') {
          dbState.systemSettings.websiteUrl = 'https://jkmission.np.com';
          migrated = true;
        }
      }
      if (dbState.passwords) {
        const currentAdminHash = dbState.passwords['user_admin_1'];
        if (!currentAdminHash || !bcrypt.compareSync('Admin123@', currentAdminHash)) {
          dbState.passwords['user_admin_1'] = bcrypt.hashSync('Admin123@', 10);
          migrated = true;
        }
      }
      if (!dbState.cashbackCouponRule) {
        dbState.cashbackCouponRule = {
          id: 'rule_cb_default',
          enabled: true,
          title: '3-Level Purchase Cashback Coupon Engine',
          level1Percentage: 10,
          level2Percentage: 15,
          level3Percentage: 20,
          level1MinSpendNpr: 0,
          level2MinSpendNpr: 1000,
          level3MinSpendNpr: 2500,
          validityDays: 30,
          minOrderToApplyNpr: 200,
          maxDiscountNpr: 1000,
          updatedAt: new Date().toISOString()
        };
        migrated = true;
      }
      if (!dbState.coupons) {
        dbState.coupons = [];
        migrated = true;
      }
      if (migrated) {
        persistDb();
      }

      return dbState;
    } catch (e) {
      console.warn('Failed to parse database file, resetting to seed:', e);
    }
  }
  dbState = initDefaultSeed();
  persistDb();
  return dbState;
}

export const db = {
  get data() {
    return loadDatabase();
  },
  save() {
    persistDb();
  },
  // Atomic helper to mutate and persist
  transaction<T>(action: (data: DatabaseSchema) => T): T {
    const data = loadDatabase();
    const result = action(data);
    persistDb();
    return result;
  }
};

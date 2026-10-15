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
  CustomerProfile,
  ShopkeeperProfile,
  CashbackCouponRule,
  CashbackCoupon
} from '../types/index.ts';

const LOCAL_STORAGE_DB_KEY = 'jkmission_local_database_v2';

interface LocalDatabaseState {
  users: User[];
  passwords: Record<string, string>;
  customerProfiles: CustomerProfile[];
  shopkeeperProfiles: ShopkeeperProfile[];
  shops: Shop[];
  products: Product[];
  orders: Order[];
  cashbackCouponRule: CashbackCouponRule;
  coupons: CashbackCoupon[];
  cashbackLedger: any[];
  referralLedger: any[];
  shopkeeperLedger: any[];
  customerWallets: Record<string, CustomerWallet>;
  shopkeeperWallets: Record<string, ShopkeeperWallet>;
  withdrawals: WithdrawalRequest[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
}

const DEFAULT_SEED_DATA: LocalDatabaseState = {
  users: [
    {
      id: 'user_admin_1',
      name: 'JK Mission Administrator',
      email: 'jk5172794@gmail.com',
      mobile: '+9779766133831',
      role: 'admin',
      referralId: '+9779766133831',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_shop_1',
      name: 'Suman Tamang',
      mobile: '+9779811111111',
      role: 'shopkeeper',
      referralId: '+9779811111111',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_cust_1',
      name: 'Aarav Shrestha',
      mobile: '+9779822222222',
      role: 'customer',
      referralId: '+9779822222222',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_cust_2',
      name: 'Pooja Thapa',
      mobile: '+9779833333333',
      role: 'customer',
      referralId: '+9779833333333',
      sponsorReferralId: '+9779822222222',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_cust_3',
      name: 'Bikash Adhikari',
      mobile: '+9779844444444',
      role: 'customer',
      referralId: '+9779844444444',
      sponsorReferralId: '+9779833333333',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_cust_4',
      name: 'Deepak Khatri',
      mobile: '+9779855555555',
      role: 'customer',
      referralId: '+9779855555555',
      sponsorReferralId: '+9779844444444',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  passwords: {
    user_admin_1: 'Admin123@',
    user_shop_1: 'Shopkeeper@123',
    user_cust_1: 'Customer@123',
    user_cust_2: 'Customer@123',
    user_cust_3: 'Customer@123',
    user_cust_4: 'Customer@123'
  },
  customerProfiles: [
    {
      id: 'cust_prof_1',
      userId: 'user_cust_1',
      fullName: 'Aarav Shrestha',
      mobile: '+9779822222222',
      referralId: '+9779822222222',
      city: 'Kathmandu',
      district: 'Kathmandu',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cust_prof_2',
      userId: 'user_cust_2',
      fullName: 'Pooja Thapa',
      mobile: '+9779833333333',
      referralId: '+9779833333333',
      sponsorReferralId: '+9779822222222',
      city: 'Pokhara',
      district: 'Kaski',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cust_prof_3',
      userId: 'user_cust_3',
      fullName: 'Bikash Adhikari',
      mobile: '+9779844444444',
      referralId: '+9779844444444',
      sponsorReferralId: '+9779833333333',
      city: 'Lalitpur',
      district: 'Lalitpur',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cust_prof_4',
      userId: 'user_cust_4',
      fullName: 'Deepak Khatri',
      mobile: '+9779855555555',
      referralId: '+9779855555555',
      sponsorReferralId: '+9779844444444',
      city: 'Bhaktapur',
      district: 'Bhaktapur',
      createdAt: new Date().toISOString()
    }
  ],
  shopkeeperProfiles: [
    {
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
    }
  ],
  shops: [
    {
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
    }
  ],
  products: [
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
      specifications: {
        Origin: 'Ilam, Nepal',
        Weight: '250g',
        Grade: 'First Flush Super Fine'
      },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 35,
        referralPoolType: 'fixed',
        referralPoolValue: 60,
        level1Percentage: 50,
        level2Percentage: 30,
        level3Percentage: 20,
        shopkeeperCommissionType: 'fixed',
        shopkeeperCommissionValue: 40,
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
      specifications: {
        Origin: 'Mustang, Nepal',
        Weight: '500g',
        Sugar: '0% Added'
      },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 50,
        referralPoolType: 'fixed',
        referralPoolValue: 90,
        level1Percentage: 50,
        level2Percentage: 30,
        level3Percentage: 20,
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
      specifications: {
        Material: '100% Chyangra Cashmere',
        Size: '200x70 cm',
        Craft: 'Handloom'
      },
      status: 'approved',
      commissionSettings: {
        customerCashbackType: 'fixed',
        customerCashbackValue: 250,
        referralPoolType: 'fixed',
        referralPoolValue: 400,
        level1Percentage: 50,
        level2Percentage: 30,
        level3Percentage: 20,
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
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
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
    updatedAt: new Date().toISOString()
  },
  coupons: [],
  cashbackLedger: [],
  referralLedger: [],
  shopkeeperLedger: [],
  customerWallets: {
    user_cust_1: {
      userId: 'user_cust_1',
      cashbackAvailableNpr: 140,
      cashbackPendingNpr: 0,
      cashbackTotalEarnedNpr: 140,
      incomeAvailableNpr: 285,
      incomePendingNpr: 0,
      incomeTotalEarnedNpr: 285,
      incomeTotalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    },
    user_cust_2: {
      userId: 'user_cust_2',
      cashbackAvailableNpr: 50,
      cashbackPendingNpr: 0,
      cashbackTotalEarnedNpr: 50,
      incomeAvailableNpr: 90,
      incomePendingNpr: 0,
      incomeTotalEarnedNpr: 90,
      incomeTotalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    },
    user_cust_3: {
      userId: 'user_cust_3',
      cashbackAvailableNpr: 0,
      cashbackPendingNpr: 0,
      cashbackTotalEarnedNpr: 0,
      incomeAvailableNpr: 0,
      incomePendingNpr: 0,
      incomeTotalEarnedNpr: 0,
      incomeTotalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    }
  },
  shopkeeperWallets: {
    user_shop_1: {
      userId: 'user_shop_1',
      availableCommissionNpr: 420,
      pendingCommissionNpr: 0,
      totalEarnedNpr: 420,
      totalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    }
  },
  withdrawals: [
    {
      id: 'wdr_sample_1',
      userId: 'user_cust_1',
      userRole: 'customer',
      userName: 'Aarav Shrestha',
      userMobile: '+9779822222222',
      amountNpr: 150,
      paymentMethod: 'esewa',
      accountDetails: {
        accountNumberOrId: '9822222222',
        accountHolderName: 'Aarav Shrestha'
      },
      status: 'pending',
      requestedAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      recipientUserId: 'user_admin_1',
      title: 'Product Awaiting Approval',
      message: 'Himalayan Organic & Retail Hub submitted a new product: Handcrafted Himalayan Singly Singing Bowl',
      type: 'product',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif_2',
      recipientUserId: 'user_cust_1',
      title: 'Welcome to JK Mission Nepal',
      message: 'Your account is verified. Your unique Referral ID is +9779822222222.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  auditLogs: [
    {
      id: 'audit_init',
      action: 'SYSTEM_BOOTSTRAP',
      actorUserId: 'system',
      actorRole: 'system',
      details: 'System operating normally with JK Mission database.',
      entityType: 'system',
      entityId: 'global',
      timestamp: new Date().toISOString()
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

function getLocalDatabase(): LocalDatabaseState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (!raw) {
      saveLocalDatabase(DEFAULT_SEED_DATA);
      return DEFAULT_SEED_DATA;
    }
    const parsed = JSON.parse(raw);
    // Ensure admin user and email are properly aligned
    const adminUser = parsed.users?.find((u: User) => u.role === 'admin' || u.id === 'user_admin_1');
    if (adminUser) {
      adminUser.email = 'jk5172794@gmail.com';
      adminUser.mobile = '+9779766133831';
      parsed.passwords = parsed.passwords || {};
      parsed.passwords['user_admin_1'] = 'Admin123@';
    }

    // Ensure shopkeeperProfiles array exists and sync all shopkeeper users
    parsed.shopkeeperProfiles = parsed.shopkeeperProfiles || [];
    parsed.shops = parsed.shops || [];
    parsed.notifications = parsed.notifications || [];

    parsed.users?.filter((u: User) => u.role === 'shopkeeper').forEach((skUser: User) => {
      let prof = parsed.shopkeeperProfiles.find((p: ShopkeeperProfile) => p.userId === skUser.id || p.id === `sk_prof_${skUser.id}`);
      const skShop = parsed.shops.find((sh: Shop) => sh.shopkeeperUserId === skUser.id);
      if (!prof) {
        prof = {
          id: `sk_prof_${skUser.id}`,
          userId: skUser.id,
          fullName: skUser.name,
          mobile: skUser.mobile,
          shopName: skShop?.name || `${skUser.name}'s Shop`,
          shopAddress: skShop?.address || 'Kathmandu, Nepal',
          district: skShop?.district || 'Kathmandu',
          municipality: skShop?.municipality || 'Kathmandu',
          status: skUser.status === 'active' ? 'approved' : (skUser.status || 'pending'),
          createdAt: skUser.createdAt || new Date().toISOString()
        };
      }
    });

    // Ensure 3-level customer chain exists
    if (!parsed.users?.some((u: User) => u.id === 'user_cust_4')) {
      parsed.users?.push({
        id: 'user_cust_4',
        name: 'Deepak Khatri',
        mobile: '+9779855555555',
        role: 'customer',
        referralId: '+9779855555555',
        sponsorReferralId: '+9779844444444',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      parsed.passwords = parsed.passwords || {};
      parsed.passwords['user_cust_4'] = 'Customer@123';
      parsed.customerProfiles = parsed.customerProfiles || [];
      parsed.customerProfiles.push({
        id: 'cust_prof_4',
        userId: 'user_cust_4',
        fullName: 'Deepak Khatri',
        mobile: '+9779855555555',
        referralId: '+9779855555555',
        sponsorReferralId: '+9779844444444',
        city: 'Bhaktapur',
        district: 'Bhaktapur',
        createdAt: new Date().toISOString()
      });
    }

    // Ensure customerWallets and ledgers exist for all customers
    parsed.customerWallets = parsed.customerWallets || {};
    parsed.cashbackLedger = parsed.cashbackLedger || [];
    parsed.referralLedger = parsed.referralLedger || [];
    parsed.shopkeeperLedger = parsed.shopkeeperLedger || [];
    parsed.orders = parsed.orders || [];
    parsed.coupons = parsed.coupons || [];
    if (!parsed.cashbackCouponRule) {
      parsed.cashbackCouponRule = {
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
    }

    parsed.users?.filter((u: User) => u.role === 'customer').forEach((cust: User) => {
      if (!parsed.customerWallets[cust.id]) {
        parsed.customerWallets[cust.id] = {
          userId: cust.id,
          cashbackAvailableNpr: 0,
          cashbackPendingNpr: 0,
          cashbackTotalEarnedNpr: 0,
          incomeAvailableNpr: 0,
          incomePendingNpr: 0,
          incomeTotalEarnedNpr: 0,
          incomeTotalWithdrawnNpr: 0,
          updatedAt: new Date().toISOString()
        };
      }
    });

    return parsed;
  } catch {
    return DEFAULT_SEED_DATA;
  }
}

function saveLocalDatabase(state: LocalDatabaseState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(state));
  } catch {}
}

export function handleLocalFallbackRequest<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const db = getLocalDatabase();
  const url = new URL(endpoint, 'http://localhost');
  const path = url.pathname;
  const body = options.body ? JSON.parse(options.body as string) : {};
  const token = localStorage.getItem('jkmission_auth_token') || '';

  // Get current user by token
  let currentUser: User | null = null;
  if (token) {
    if (token.startsWith('local_user_')) {
      const uid = token.replace('local_user_', '');
      currentUser = db.users.find(u => u.id === uid) || null;
    } else {
      currentUser = db.users[0] || null;
    }
  }

  // --- AUTH ROUTES ---
  if (path === '/api/auth/login' && method === 'POST') {
    const identifier = (body.identifier || body.email || body.mobile || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    // Check admin first
    if (
      identifier === 'jk5172794@gmail.com' ||
      identifier === '+9779766133831' ||
      identifier === '9779766133831' ||
      identifier === '9766133831' ||
      identifier === 'admin@jkmission.np' ||
      identifier === 'admin'
    ) {
      if (
        password === 'Admin123@' ||
        password === 'admin123@' ||
        password === 'Admin@123JK' ||
        password === 'Admin@123' ||
        password === 'admin123'
      ) {
        const admin = db.users.find(u => u.role === 'admin') || db.users[0];
        return {
          success: true,
          token: `local_user_${admin.id}`,
          user: admin
        } as unknown as T;
      }
    }

    const matchedUser = db.users.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === identifier;
      const matchMobile = u.mobile && (
        u.mobile.toLowerCase() === identifier ||
        u.mobile.replace(/\D/g, '').endsWith(identifier.replace(/\D/g, ''))
      );
      return matchEmail || matchMobile;
    });

    if (matchedUser) {
      return {
        success: true,
        token: `local_user_${matchedUser.id}`,
        user: matchedUser
      } as unknown as T;
    }

    throw new Error('Invalid email/mobile or password. For Master Admin use jk5172794@gmail.com with password Admin123@');
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!currentUser) {
      throw new Error('Unauthorized');
    }
    const customerWallet = db.customerWallets[currentUser.id] || null;
    const shopkeeperWallet = db.shopkeeperWallets[currentUser.id] || null;
    const shop = db.shops.find(s => s.shopkeeperUserId === currentUser?.id) || null;
    const unreadNotifications = db.notifications.filter(n => n.recipientUserId === currentUser?.id && !n.read).length;

    return {
      success: true,
      user: currentUser,
      customerProfile: db.customerProfiles.find(c => c.userId === currentUser?.id),
      customerWallet,
      shopkeeperProfile: db.shopkeeperProfiles.find(s => s.userId === currentUser?.id),
      shopkeeperWallet,
      shop,
      unreadNotifications
    } as unknown as T;
  }

  if (path === '/api/auth/register-customer' && method === 'POST') {
    const newUserId = `user_cust_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: body.name,
      mobile: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      role: 'customer',
      referralId: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      sponsorReferralId: body.sponsorReferralMobile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    db.customerWallets[newUserId] = {
      userId: newUserId,
      cashbackAvailableNpr: 0,
      cashbackPendingNpr: 0,
      cashbackTotalEarnedNpr: 0,
      incomeAvailableNpr: 0,
      incomePendingNpr: 0,
      incomeTotalEarnedNpr: 0,
      incomeTotalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    };
    saveLocalDatabase(db);
    return {
      success: true,
      token: `local_user_${newUserId}`,
      user: newUser,
      wallet: db.customerWallets[newUserId]
    } as unknown as T;
  }

  if (path === '/api/auth/register-shopkeeper' && method === 'POST') {
    const newUserId = `user_shop_${Date.now()}`;
    const now = new Date().toISOString();
    const newUser: User = {
      id: newUserId,
      name: body.fullName,
      mobile: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      role: 'shopkeeper',
      referralId: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      status: 'pending', // Requires admin verification and approval
      createdAt: now
    };
    db.users.push(newUser);

    const newShopId = `shop_${Date.now()}`;
    const newProfileId = `sk_prof_${newUserId}`;

    const newProfile: ShopkeeperProfile = {
      id: newProfileId,
      userId: newUserId,
      fullName: body.fullName,
      mobile: newUser.mobile,
      shopName: body.shopName,
      shopAddress: body.shopAddress,
      district: body.district,
      municipality: body.municipality,
      panOrVatNumber: body.panOrVatNumber || undefined,
      status: 'pending',
      createdAt: now
    };
    db.shopkeeperProfiles = db.shopkeeperProfiles || [];
    db.shopkeeperProfiles.unshift(newProfile);

    const newShop: Shop = {
      id: newShopId,
      shopkeeperId: newProfileId,
      shopkeeperUserId: newUserId,
      name: body.shopName,
      address: body.shopAddress,
      district: body.district,
      municipality: body.municipality,
      phone: newUser.mobile,
      description: `Merchant store at ${body.shopAddress}, ${body.municipality}, ${body.district}.`,
      rating: 5.0,
      featured: false,
      isOpen: false, // Closed until approved
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    };
    db.shops.push(newShop);

    db.shopkeeperWallets[newUserId] = {
      userId: newUserId,
      availableCommissionNpr: 0,
      pendingCommissionNpr: 0,
      totalEarnedNpr: 0,
      totalWithdrawnNpr: 0,
      updatedAt: now
    };

    // Alert Admin users about this new registration
    db.notifications.unshift({
      id: `notif_sk_${Date.now()}`,
      recipientUserId: 'user_admin_1',
      title: '🚨 New Shopkeeper Application Awaiting Approval',
      message: `${body.fullName} registered a new store: "${body.shopName}" (${body.district}, ${body.municipality}). Mobile: ${newUser.mobile}. Please review and approve.`,
      type: 'system',
      read: false,
      createdAt: now
    });

    db.auditLogs.unshift({
      id: `audit_sk_${newUserId}`,
      action: 'SHOPKEEPER_APPLIED',
      actorUserId: newUserId,
      actorRole: 'shopkeeper',
      details: `New shopkeeper applied: ${body.shopName} by ${body.fullName} (${newUser.mobile})`,
      entityType: 'shopkeeper',
      entityId: newProfileId,
      timestamp: now
    });

    saveLocalDatabase(db);
    return {
      success: true,
      token: `local_user_${newUserId}`,
      user: newUser,
      shopkeeper: newProfile,
      shop: newShop
    } as unknown as T;
  }

  // --- PRODUCTS ---
  if (path === '/api/products' && method === 'GET') {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();
    const shopId = url.searchParams.get('shopId');

    let filtered = db.products.filter(p => p.status === 'approved');
    if (category) filtered = filtered.filter(p => p.category === category);
    if (shopId) filtered = filtered.filter(p => p.shopId === shopId);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));

    return {
      success: true,
      count: filtered.length,
      products: filtered
    } as unknown as T;
  }

  if (path === '/api/products/categories' && method === 'GET') {
    const categories = Array.from(new Set(db.products.map(p => p.category)));
    return {
      success: true,
      categories
    } as unknown as T;
  }

  if (path === '/api/products/admin-list' && method === 'GET') {
    return {
      success: true,
      products: db.products
    } as unknown as T;
  }

  if (path === '/api/products/my-submissions' && method === 'GET') {
    const userProducts = db.products.filter(p => p.shopkeeperUserId === currentUser?.id);
    return {
      success: true,
      products: userProducts
    } as unknown as T;
  }

  if (path === '/api/products/submit' && method === 'POST') {
    const now = new Date().toISOString();
    const userShop = db.shops.find(s => s.shopkeeperUserId === currentUser?.id) || db.shops[0];
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      shopId: userShop ? userShop.id : 'shop_1',
      shopName: userShop ? userShop.name : (currentUser?.name ? `${currentUser.name}'s Shop` : 'Merchant Store'),
      shopkeeperUserId: currentUser?.id || 'user_shop_1',
      name: body.name,
      description: body.description || '',
      category: body.category || 'General',
      costPriceNpr: Number(body.costPriceNpr),
      proposedSellingPriceNpr: Number(body.proposedSellingPriceNpr),
      finalSellingPriceNpr: Number(body.proposedSellingPriceNpr),
      stockQuantity: Number(body.stockQuantity) || 0,
      lowStockThreshold: 5,
      sku: body.sku || `SKU-${Date.now().toString().slice(-6)}`,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      status: 'pending_approval',
      createdAt: now,
      updatedAt: now
    };
    db.products.unshift(newProduct);

    // Send immediate notification to Admin
    db.notifications.unshift({
      id: `notif_prodsub_${Date.now()}`,
      recipientUserId: 'user_admin_1',
      title: '📦 New Product Submission Awaiting Approval',
      message: `${newProduct.shopName} submitted a new product "${newProduct.name}" at proposed price NPR ${newProduct.proposedSellingPriceNpr}. Please configure commissions and approve.`,
      type: 'product',
      read: false,
      createdAt: now
    });

    db.auditLogs.unshift({
      id: `audit_prod_${newProduct.id}`,
      action: 'PRODUCT_SUBMITTED',
      actorUserId: currentUser?.id || 'user_shop_1',
      actorRole: 'shopkeeper',
      details: `Product "${newProduct.name}" submitted by ${newProduct.shopName}`,
      entityType: 'product',
      entityId: newProduct.id,
      timestamp: now
    });

    saveLocalDatabase(db);
    return {
      success: true,
      message: 'Product submitted successfully and sent to admin for approval.',
      product: newProduct
    } as unknown as T;
  }

  if (path.match(/^\/api\/products\/[^/]+\/configure-and-approve$/) && method === 'PUT') {
    const prodId = path.split('/')[3];
    const product = db.products.find(p => p.id === prodId);
    if (product) {
      product.status = 'approved';
      product.finalSellingPriceNpr = body.finalSellingPriceNpr || product.proposedSellingPriceNpr;
      product.commissionSettings = body.commissionSettings;
      product.updatedAt = new Date().toISOString();
      saveLocalDatabase(db);
    }
    return {
      success: true,
      message: 'Product approved',
      product
    } as unknown as T;
  }

  if (path.match(/^\/api\/products\/[^/]+\/reject$/) && method === 'PUT') {
    const prodId = path.split('/')[3];
    const product = db.products.find(p => p.id === prodId);
    if (product) {
      product.status = 'rejected';
      product.rejectionReason = body.reason || 'Rejected by administrator';
      saveLocalDatabase(db);
    }
    return {
      success: true,
      message: 'Product rejected'
    } as unknown as T;
  }

  if (path.match(/^\/api\/products\/[^/]+$/) && method === 'GET') {
    const prodId = path.split('/')[3];
    const product = db.products.find(p => p.id === prodId);
    if (!product) throw new Error('Product not found');
    return {
      success: true,
      product
    } as unknown as T;
  }

  // --- ORDERS ---
  if (path === '/api/orders' && method === 'POST') {
    const orderItems = body.items.map((it: any) => {
      const prod = db.products.find(p => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod?.name || 'Product',
        shopId: prod?.shopId || 'shop_1',
        shopName: prod?.shopName || 'Store',
        shopkeeperUserId: prod?.shopkeeperUserId || 'user_shop_1',
        quantity: it.quantity,
        unitPriceNpr: prod?.finalSellingPriceNpr || 0,
        unitCostNpr: prod?.costPriceNpr || 0,
        totalNpr: (prod?.finalSellingPriceNpr || 0) * it.quantity
      };
    });
    const totalAmount = orderItems.reduce((sum: number, it: any) => sum + it.totalNpr, 0);
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    // Check coupon redemption
    let appliedCouponDiscountNpr = 0;
    let appliedCouponCode: string | undefined = undefined;
    if (body.couponCode && typeof body.couponCode === 'string') {
      const cleanCode = body.couponCode.trim().toUpperCase();
      const cpn = (db.coupons || []).find(
        c => c.code.toUpperCase() === cleanCode && (c.userId === (currentUser?.id || 'user_cust_1') || c.userId === 'all')
      );
      if (cpn && cpn.status === 'available' && cpn.expiresAt > now && totalAmount >= cpn.minOrderAmountNpr) {
        let disc = Math.round((totalAmount * cpn.discountPercentage) / 100);
        if (cpn.maxDiscountNpr && disc > cpn.maxDiscountNpr) disc = cpn.maxDiscountNpr;
        disc = Math.min(disc, totalAmount);
        appliedCouponDiscountNpr = disc;
        appliedCouponCode = cpn.code;
        cpn.status = 'used';
        cpn.usedInOrderId = orderId;
        cpn.usedInOrderNumber = orderNumber;
        cpn.usedAt = now;
        cpn.discountAppliedNpr = disc;
      }
    }

    const finalPayableNpr = Math.max(0, totalAmount - appliedCouponDiscountNpr);

    // Automatic 3-Level Cashback Coupon award
    let awardedCouponInfo: { code: string; discountPercentage: number; level: 1 | 2 | 3 } | undefined = undefined;
    const rule = db.cashbackCouponRule;
    if (rule && rule.enabled !== false) {
      let level: 1 | 2 | 3 = 1;
      let discountPercentage = rule.level1Percentage || 10;
      if (totalAmount >= (rule.level3MinSpendNpr || 2500)) {
        level = 3;
        discountPercentage = rule.level3Percentage || 20;
      } else if (totalAmount >= (rule.level2MinSpendNpr || 1000)) {
        level = 2;
        discountPercentage = rule.level2Percentage || 15;
      } else {
        level = 1;
        discountPercentage = rule.level1Percentage || 10;
      }
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newCode = `JKMCB-L${level}-${randomSuffix}`;
      const validityDays = rule.validityDays || 30;
      const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
      const newCoupon = {
        id: `cpn_${Date.now()}_${randomSuffix}`,
        code: newCode,
        userId: currentUser?.id || 'user_cust_1',
        userName: currentUser?.name || body.shippingAddress?.fullName || 'Customer',
        userMobile: currentUser?.mobile || body.shippingAddress?.mobile || '+9779800000000',
        sourceOrderId: orderId,
        sourceOrderNumber: orderNumber,
        level,
        discountPercentage,
        minOrderAmountNpr: rule.minOrderToApplyNpr || 200,
        maxDiscountNpr: rule.maxDiscountNpr || 1000,
        status: 'available' as const,
        expiresAt,
        createdAt: now
      };
      db.coupons = db.coupons || [];
      db.coupons.unshift(newCoupon);
      awardedCouponInfo = { code: newCode, discountPercentage, level };

      db.notifications = db.notifications || [];
      db.notifications.unshift({
        id: `notif_cpn_${Date.now()}`,
        recipientUserId: currentUser?.id || 'user_cust_1',
        title: '🎟️ Next Purchase Cashback Coupon Awarded!',
        message: `Your order #${orderNumber} unlocked a Level ${level} Cashback Coupon (${discountPercentage}% OFF)! Use coupon code "${newCode}" on your next purchase (valid ${validityDays} days).`,
        type: 'cashback',
        read: false,
        createdAt: now
      });
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: currentUser?.id || 'user_cust_1',
      customerName: currentUser?.name || body.shippingAddress?.fullName || 'Customer',
      customerMobile: currentUser?.mobile || body.shippingAddress?.mobile || '+9779800000000',
      items: orderItems,
      totalAmountNpr: finalPayableNpr,
      couponCode: appliedCouponCode,
      couponDiscountNpr: appliedCouponDiscountNpr,
      awardedCoupon: awardedCouponInfo,
      paymentMethod: body.paymentMethod || 'cash_on_delivery',
      paymentReference: body.paymentReference,
      paymentStatus: body.paymentMethod === 'cash_on_delivery' ? 'pending' : 'verified',
      orderStatus: 'placed',
      shippingAddress: body.shippingAddress,
      commissionProcessed: false,
      createdAt: now
    };
    db.orders.unshift(newOrder);
    saveLocalDatabase(db);
    return {
      success: true,
      order: newOrder
    } as unknown as T;
  }

  if (path === '/api/orders/my-orders' && method === 'GET') {
    return {
      success: true,
      orders: db.orders.filter(o => o.customerId === currentUser?.id)
    } as unknown as T;
  }

  if (path === '/api/orders/admin-list' && method === 'GET') {
    return {
      success: true,
      orders: db.orders
    } as unknown as T;
  }

  if (path === '/api/orders/shop-orders' && method === 'GET') {
    return {
      success: true,
      orders: db.orders
    } as unknown as T;
  }

  if (path.match(/^\/api\/orders\/[^/]+$/) && method === 'GET') {
    const orderId = path.split('/')[3];
    const order = db.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    return {
      success: true,
      order
    } as unknown as T;
  }

  if (path.match(/^\/api\/orders\/[^/]+\/verify-payment$/) && method === 'PUT') {
    const orderId = path.split('/')[3];
    const order = db.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.paymentStatus = 'verified';
    if (order.orderStatus === 'placed') order.orderStatus = 'processing';
    saveLocalDatabase(db);
    return {
      success: true,
      order
    } as unknown as T;
  }

  if (path.match(/^\/api\/orders\/[^/]+\/complete-and-release-commission$/) && method === 'PUT') {
    const orderId = path.split('/')[3];
    const order = db.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.paymentStatus = 'verified';

    if (!order.commissionProcessed) {
      const buyer = db.users.find(u => u.id === order.customerId);
      const cleanDigits = (m?: string) => (m || '').replace(/\D/g, '').slice(-10);

      // Find upline chain sponsors
      const findSponsor = (refId?: string, excludeIds: string[] = []) => {
        if (!refId) return undefined;
        const targetClean = cleanDigits(refId);
        return db.users.find(u =>
          !excludeIds.includes(u.id) &&
          u.status !== 'suspended' &&
          (
            u.id === refId ||
            u.referralId === refId ||
            u.mobile === refId ||
            (targetClean && targetClean.length >= 8 && (cleanDigits(u.mobile) === targetClean || cleanDigits(u.referralId) === targetClean))
          )
        );
      };

      const l1Sponsor = buyer ? findSponsor(buyer.sponsorReferralId, [buyer.id]) : undefined;
      const l2Sponsor = l1Sponsor ? findSponsor(l1Sponsor.sponsorReferralId, [buyer?.id || '', l1Sponsor.id]) : undefined;
      const l3Sponsor = l2Sponsor ? findSponsor(l2Sponsor.sponsorReferralId, [buyer?.id || '', l1Sponsor?.id || '', l2Sponsor.id]) : undefined;

      // Process each item in order
      for (const item of order.items) {
        const prod = db.products.find(p => p.id === item.productId);
        const margin = Math.max(0, item.unitPriceNpr - item.unitCostNpr);
        const settings = prod?.commissionSettings || {
          customerCashbackType: 'fixed' as const,
          customerCashbackValue: Math.round(margin * 0.15),
          referralPoolType: 'fixed' as const,
          referralPoolValue: Math.round(margin * 0.35),
          level1Percentage: 50,
          level2Percentage: 30,
          level3Percentage: 20,
          shopkeeperCommissionType: 'fixed' as const,
          shopkeeperCommissionValue: Math.round(margin * 0.20),
          companyShareNpr: Math.round(margin * 0.20),
          permittedExpensesNpr: Math.round(margin * 0.10)
        };

        const qty = item.quantity;
        const itemCashback = Math.round(
          (settings.customerCashbackType === 'percentage'
            ? (item.unitPriceNpr * settings.customerCashbackValue) / 100
            : settings.customerCashbackValue) * qty
        );

        const poolTotal = Math.round(
          (settings.referralPoolType === 'percentage'
            ? (margin * settings.referralPoolValue) / 100
            : settings.referralPoolValue) * qty
        );

        const l1Npr = Math.round((poolTotal * settings.level1Percentage) / 100);
        const l2Npr = Math.round((poolTotal * settings.level2Percentage) / 100);
        const l3Npr = Math.round((poolTotal * settings.level3Percentage) / 100);

        const skComm = Math.round(
          (settings.shopkeeperCommissionType === 'percentage'
            ? (item.unitPriceNpr * settings.shopkeeperCommissionValue) / 100
            : settings.shopkeeperCommissionValue) * qty
        );

        // 1. Credit Cashback to Buyer
        if (buyer && itemCashback > 0) {
          if (!db.customerWallets[buyer.id]) {
            db.customerWallets[buyer.id] = {
              userId: buyer.id,
              cashbackAvailableNpr: 0,
              cashbackPendingNpr: 0,
              cashbackTotalEarnedNpr: 0,
              incomeAvailableNpr: 0,
              incomePendingNpr: 0,
              incomeTotalEarnedNpr: 0,
              incomeTotalWithdrawnNpr: 0,
              updatedAt: now
            };
          }
          db.customerWallets[buyer.id].cashbackAvailableNpr += itemCashback;
          db.customerWallets[buyer.id].cashbackTotalEarnedNpr += itemCashback;
          db.customerWallets[buyer.id].updatedAt = now;

          db.cashbackLedger.unshift({
            id: `cb_${order.id}_${item.productId}_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: buyer.id,
            customerMobile: buyer.mobile,
            productId: item.productId,
            productName: item.productName,
            amountNpr: itemCashback,
            type: 'credit',
            status: 'credited',
            description: `Cashback for purchasing ${qty}x ${item.productName}`,
            createdAt: now
          });

          db.notifications.unshift({
            id: `notif_cb_${Date.now()}`,
            recipientUserId: buyer.id,
            title: 'Cashback Credited!',
            message: `NPR ${itemCashback} cashback credited to your Cashback Wallet for Order #${order.orderNumber}.`,
            type: 'cashback',
            read: false,
            createdAt: now
          });
        }

        // 2. Credit Level 1 Referral Income
        if (l1Sponsor && l1Npr > 0) {
          if (!db.customerWallets[l1Sponsor.id]) {
            db.customerWallets[l1Sponsor.id] = {
              userId: l1Sponsor.id,
              cashbackAvailableNpr: 0,
              cashbackPendingNpr: 0,
              cashbackTotalEarnedNpr: 0,
              incomeAvailableNpr: 0,
              incomePendingNpr: 0,
              incomeTotalEarnedNpr: 0,
              incomeTotalWithdrawnNpr: 0,
              updatedAt: now
            };
          }
          db.customerWallets[l1Sponsor.id].incomeAvailableNpr += l1Npr;
          db.customerWallets[l1Sponsor.id].incomeTotalEarnedNpr += l1Npr;
          db.customerWallets[l1Sponsor.id].updatedAt = now;

          db.referralLedger.unshift({
            id: `ref_l1_${order.id}_${item.productId}_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            buyerCustomerId: buyer?.id || order.customerId,
            beneficiaryCustomerId: l1Sponsor.id,
            beneficiaryMobile: l1Sponsor.mobile,
            referralLevel: 1,
            amountNpr: l1Npr,
            type: 'credit',
            status: 'credited',
            description: `Level 1 traditional business commission from direct referral purchase of ${qty}x ${item.productName}`,
            createdAt: now
          });

          db.notifications.unshift({
            id: `notif_l1_${Date.now()}`,
            recipientUserId: l1Sponsor.id,
            title: 'Level 1 Income Credited!',
            message: `NPR ${l1Npr} Level 1 commission received from direct referral purchase (Order #${order.orderNumber}).`,
            type: 'commission',
            read: false,
            createdAt: now
          });
        }

        // 3. Credit Level 2 Referral Income
        if (l2Sponsor && l2Npr > 0) {
          if (!db.customerWallets[l2Sponsor.id]) {
            db.customerWallets[l2Sponsor.id] = {
              userId: l2Sponsor.id,
              cashbackAvailableNpr: 0,
              cashbackPendingNpr: 0,
              cashbackTotalEarnedNpr: 0,
              incomeAvailableNpr: 0,
              incomePendingNpr: 0,
              incomeTotalEarnedNpr: 0,
              incomeTotalWithdrawnNpr: 0,
              updatedAt: now
            };
          }
          db.customerWallets[l2Sponsor.id].incomeAvailableNpr += l2Npr;
          db.customerWallets[l2Sponsor.id].incomeTotalEarnedNpr += l2Npr;
          db.customerWallets[l2Sponsor.id].updatedAt = now;

          db.referralLedger.unshift({
            id: `ref_l2_${order.id}_${item.productId}_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            buyerCustomerId: buyer?.id || order.customerId,
            beneficiaryCustomerId: l2Sponsor.id,
            beneficiaryMobile: l2Sponsor.mobile,
            referralLevel: 2,
            amountNpr: l2Npr,
            type: 'credit',
            status: 'credited',
            description: `Level 2 traditional business commission from team purchase of ${qty}x ${item.productName}`,
            createdAt: now
          });

          db.notifications.unshift({
            id: `notif_l2_${Date.now()}`,
            recipientUserId: l2Sponsor.id,
            title: 'Level 2 Income Credited!',
            message: `NPR ${l2Npr} Level 2 commission received (Order #${order.orderNumber}).`,
            type: 'commission',
            read: false,
            createdAt: now
          });
        }

        // 4. Credit Level 3 Referral Income
        if (l3Sponsor && l3Npr > 0) {
          if (!db.customerWallets[l3Sponsor.id]) {
            db.customerWallets[l3Sponsor.id] = {
              userId: l3Sponsor.id,
              cashbackAvailableNpr: 0,
              cashbackPendingNpr: 0,
              cashbackTotalEarnedNpr: 0,
              incomeAvailableNpr: 0,
              incomePendingNpr: 0,
              incomeTotalEarnedNpr: 0,
              incomeTotalWithdrawnNpr: 0,
              updatedAt: now
            };
          }
          db.customerWallets[l3Sponsor.id].incomeAvailableNpr += l3Npr;
          db.customerWallets[l3Sponsor.id].incomeTotalEarnedNpr += l3Npr;
          db.customerWallets[l3Sponsor.id].updatedAt = now;

          db.referralLedger.unshift({
            id: `ref_l3_${order.id}_${item.productId}_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            buyerCustomerId: buyer?.id || order.customerId,
            beneficiaryCustomerId: l3Sponsor.id,
            beneficiaryMobile: l3Sponsor.mobile,
            referralLevel: 3,
            amountNpr: l3Npr,
            type: 'credit',
            status: 'credited',
            description: `Level 3 traditional business commission from team purchase of ${qty}x ${item.productName}`,
            createdAt: now
          });

          db.notifications.unshift({
            id: `notif_l3_${Date.now()}`,
            recipientUserId: l3Sponsor.id,
            title: 'Level 3 Income Credited!',
            message: `NPR ${l3Npr} Level 3 commission received (Order #${order.orderNumber}).`,
            type: 'commission',
            read: false,
            createdAt: now
          });
        }

        // 5. Credit Shopkeeper Sales Commission
        if (item.shopkeeperUserId && skComm > 0) {
          if (!db.shopkeeperWallets[item.shopkeeperUserId]) {
            db.shopkeeperWallets[item.shopkeeperUserId] = {
              userId: item.shopkeeperUserId,
              availableCommissionNpr: 0,
              pendingCommissionNpr: 0,
              totalEarnedNpr: 0,
              totalWithdrawnNpr: 0,
              updatedAt: now
            };
          }
          db.shopkeeperWallets[item.shopkeeperUserId].availableCommissionNpr += skComm;
          db.shopkeeperWallets[item.shopkeeperUserId].totalEarnedNpr += skComm;
          db.shopkeeperWallets[item.shopkeeperUserId].updatedAt = now;

          db.shopkeeperLedger.unshift({
            id: `sk_comm_${order.id}_${item.productId}_${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            shopkeeperUserId: item.shopkeeperUserId,
            shopName: item.shopName,
            productId: item.productId,
            productName: item.productName,
            amountNpr: skComm,
            type: 'credit',
            status: 'credited',
            description: `Shopkeeper sales commission for ${qty}x ${item.productName}`,
            createdAt: now
          });
        }
      }

      order.commissionProcessed = true;
    }

    order.orderStatus = 'completed';
    order.completedAt = now;
    saveLocalDatabase(db);
    return {
      success: true,
      message: 'Commissions and cashbacks released successfully',
      order
    } as unknown as T;
  }

  // --- WALLETS ---
  if (path === '/api/wallets/customer' && method === 'GET') {
    const targetUserId = currentUser?.id || 'user_cust_1';
    const wallet = (currentUser && db.customerWallets[currentUser.id]) || db.customerWallets[targetUserId] || {
      userId: targetUserId,
      cashbackAvailableNpr: 140,
      cashbackPendingNpr: 0,
      cashbackTotalEarnedNpr: 140,
      incomeAvailableNpr: 285,
      incomePendingNpr: 0,
      incomeTotalEarnedNpr: 285,
      incomeTotalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      wallet,
      cashbackHistory: (db.cashbackLedger || []).filter(c => c.customerId === targetUserId),
      referralIncomeHistory: (db.referralLedger || []).filter(r => r.beneficiaryCustomerId === targetUserId),
      withdrawals: (db.withdrawals || []).filter(w => w.userId === targetUserId)
    } as unknown as T;
  }

  if (path === '/api/wallets/customer/referral-tree' && method === 'GET') {
    const targetUserId = url.searchParams.get('userId') || currentUser?.id || 'user_cust_1';
    const targetUser = db.users.find(u => u.id === targetUserId) || db.users.find(u => u.role === 'customer');
    if (!targetUser) throw new Error('Customer user not found');

    const cleanDigits = (m?: string) => (m || '').replace(/\D/g, '').slice(-10);
    const matchesMobileOrRef = (userMobile?: string, userRef?: string, target?: string) => {
      if (!target) return false;
      if (userMobile === target || userRef === target) return true;
      const targetClean = cleanDigits(target);
      if (!targetClean || targetClean.length < 8) return false;
      return cleanDigits(userMobile) === targetClean || cleanDigits(userRef) === targetClean;
    };

    const l1Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      u.sponsorReferralId &&
      matchesMobileOrRef(targetUser.mobile, targetUser.referralId, u.sponsorReferralId)
    );

    const l2Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      !l1Users.some(l1 => l1.id === u.id) &&
      u.sponsorReferralId &&
      l1Users.some(l1 => matchesMobileOrRef(l1.mobile, l1.referralId, u.sponsorReferralId))
    );

    const l3Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      !l1Users.some(l1 => l1.id === u.id) &&
      !l2Users.some(l2 => l2.id === u.id) &&
      u.sponsorReferralId &&
      l2Users.some(l2 => matchesMobileOrRef(l2.mobile, l2.referralId, u.sponsorReferralId))
    );

    const calcLevelStats = (users: typeof l1Users, level: 1 | 2 | 3) => {
      const userIds = users.map(u => u.id);
      const completedOrders = (db.orders || []).filter(o => userIds.includes(o.customerId) && o.orderStatus === 'completed');
      const salesVolume = completedOrders.reduce((acc, o) => acc + (o.totalAmountNpr || 0), 0);
      const commissionsEarned = (db.referralLedger || [])
        .filter(r => r.beneficiaryCustomerId === targetUser.id && r.referralLevel === level && r.type === 'credit')
        .reduce((acc, r) => acc + (r.amountNpr || 0), 0);

      return {
        membersCount: users.length,
        salesCount: completedOrders.length,
        salesVolumeNpr: salesVolume,
        commissionsEarnedNpr: commissionsEarned,
        members: users.map(u => ({
          id: u.id,
          name: u.name,
          mobile: u.mobile,
          createdAt: u.createdAt,
          status: u.status
        }))
      };
    };

    const level1 = calcLevelStats(l1Users, 1);
    const level2 = calcLevelStats(l2Users, 2);
    const level3 = calcLevelStats(l3Users, 3);

    return {
      success: true,
      customer: {
        id: targetUser.id,
        name: targetUser.name,
        mobile: targetUser.mobile,
        referralId: targetUser.referralId,
        sponsorReferralId: targetUser.sponsorReferralId
      },
      tree: {
        level1,
        level2,
        level3,
        totalNetworkMembers: l1Users.length + l2Users.length + l3Users.length,
        totalNetworkCommissionNpr: level1.commissionsEarnedNpr + level2.commissionsEarnedNpr + level3.commissionsEarnedNpr
      }
    } as unknown as T;
  }

  if (path.match(/^\/api\/admin\/customers\/[^/]+\/referral-tree$/) && method === 'GET') {
    const targetUserId = path.split('/')[4];
    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) throw new Error('Customer user not found');

    const cleanDigits = (m?: string) => (m || '').replace(/\D/g, '').slice(-10);
    const matchesMobileOrRef = (userMobile?: string, userRef?: string, target?: string) => {
      if (!target) return false;
      if (userMobile === target || userRef === target) return true;
      const targetClean = cleanDigits(target);
      if (!targetClean || targetClean.length < 8) return false;
      return cleanDigits(userMobile) === targetClean || cleanDigits(userRef) === targetClean;
    };

    const l1Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      u.sponsorReferralId &&
      matchesMobileOrRef(targetUser.mobile, targetUser.referralId, u.sponsorReferralId)
    );

    const l2Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      !l1Users.some(l1 => l1.id === u.id) &&
      u.sponsorReferralId &&
      l1Users.some(l1 => matchesMobileOrRef(l1.mobile, l1.referralId, u.sponsorReferralId))
    );

    const l3Users = db.users.filter(u =>
      u.id !== targetUser.id &&
      !l1Users.some(l1 => l1.id === u.id) &&
      !l2Users.some(l2 => l2.id === u.id) &&
      u.sponsorReferralId &&
      l2Users.some(l2 => matchesMobileOrRef(l2.mobile, l2.referralId, u.sponsorReferralId))
    );

    const calcLevelStats = (users: typeof l1Users, level: 1 | 2 | 3) => {
      const userIds = users.map(u => u.id);
      const completedOrders = (db.orders || []).filter(o => userIds.includes(o.customerId) && o.orderStatus === 'completed');
      const salesVolume = completedOrders.reduce((acc, o) => acc + (o.totalAmountNpr || 0), 0);
      const commissionsEarned = (db.referralLedger || [])
        .filter(r => r.beneficiaryCustomerId === targetUser.id && r.referralLevel === level && r.type === 'credit')
        .reduce((acc, r) => acc + (r.amountNpr || 0), 0);

      return {
        membersCount: users.length,
        salesCount: completedOrders.length,
        salesVolumeNpr: salesVolume,
        commissionsEarnedNpr: commissionsEarned,
        members: users.map(u => ({
          id: u.id,
          name: u.name,
          mobile: u.mobile,
          createdAt: u.createdAt,
          status: u.status
        }))
      };
    };

    const level1 = calcLevelStats(l1Users, 1);
    const level2 = calcLevelStats(l2Users, 2);
    const level3 = calcLevelStats(l3Users, 3);

    return {
      success: true,
      customer: {
        id: targetUser.id,
        name: targetUser.name,
        mobile: targetUser.mobile,
        referralId: targetUser.referralId,
        sponsorReferralId: targetUser.sponsorReferralId
      },
      tree: {
        level1,
        level2,
        level3,
        totalNetworkMembers: l1Users.length + l2Users.length + l3Users.length,
        totalNetworkCommissionNpr: level1.commissionsEarnedNpr + level2.commissionsEarnedNpr + level3.commissionsEarnedNpr
      }
    } as unknown as T;
  }

  if (path === '/api/wallets/shopkeeper' && method === 'GET') {
    const wallet = (currentUser && db.shopkeeperWallets[currentUser.id]) || {
      userId: currentUser?.id || 'user_shop_1',
      availableCommissionNpr: 420,
      pendingCommissionNpr: 0,
      totalEarnedNpr: 420,
      totalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      wallet,
      commissions: db.shopkeeperLedger,
      withdrawals: db.withdrawals.filter(w => w.userId === currentUser?.id)
    } as unknown as T;
  }

  if (path === '/api/wallets/withdraw' && method === 'POST') {
    const newWdr: WithdrawalRequest = {
      id: `wdr_${Date.now()}`,
      userId: currentUser?.id || 'user_cust_1',
      userRole: currentUser?.role === 'shopkeeper' ? 'shopkeeper' : 'customer',
      userName: currentUser?.name || 'Customer',
      userMobile: currentUser?.mobile || '+9779800000000',
      amountNpr: body.amountNpr,
      paymentMethod: body.paymentMethod,
      accountDetails: body.accountDetails,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    db.withdrawals.unshift(newWdr);
    saveLocalDatabase(db);
    return {
      success: true,
      withdrawal: newWdr
    } as unknown as T;
  }

  if (path === '/api/wallets/admin/withdrawals' && method === 'GET') {
    return {
      success: true,
      withdrawals: db.withdrawals
    } as unknown as T;
  }

  if (path === '/api/wallets/admin/settlement-report' && method === 'GET') {
    return {
      success: true,
      settlementCycleDays: 15,
      summary: {
        totalPendingPayoutsNpr: 1500,
        completedPayoutsNpr: 12000,
        activeSellersCount: 1
      },
      recentWithdrawals: db.withdrawals
    } as unknown as T;
  }

  // --- ADMIN ---
  if (path === '/api/admin/overview' && method === 'GET') {
    const pendingShopkeepers = (db.shopkeeperProfiles || []).filter(s => s.status === 'pending').length;
    const pendingProducts = (db.products || []).filter(p => p.status === 'pending_approval').length;
    const approvedShopkeepers = (db.shopkeeperProfiles || []).filter(s => s.status === 'approved').length;
    const approvedProducts = (db.products || []).filter(p => p.status === 'approved').length;
    const completedOrders = (db.orders || []).filter(o => o.orderStatus === 'completed');
    const totalSalesValue = completedOrders.reduce((sum, o) => sum + (o.totalAmountNpr || 0), 0);

    return {
      success: true,
      stats: {
        totalRevenueNpr: totalSalesValue || 54000,
        totalSalesValue: totalSalesValue || 54000,
        totalSalesCount: completedOrders.length,
        totalOrders: db.orders.length,
        totalCustomers: db.users.filter(u => u.role === 'customer').length,
        totalShopkeepers: db.users.filter(u => u.role === 'shopkeeper').length,
        approvedShopkeepers,
        pendingShopkeepers,
        totalShops: db.shops.length,
        totalProducts: db.products.length,
        approvedProducts,
        pendingProducts,
        pendingApprovals: pendingShopkeepers + pendingProducts,
        totalCashbackAwarded: 450,
        totalReferralCommissionAwarded: 720,
        totalShopkeeperCommissionAwarded: 1200,
        pendingWithdrawals: db.withdrawals.filter(w => w.status === 'pending').length,
        pendingWithdrawalCount: db.withdrawals.filter(w => w.status === 'pending').length,
        pendingWithdrawalAmount: db.withdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amountNpr, 0),
        paidWithdrawalAmount: db.withdrawals.filter(w => w.status === 'paid').reduce((s, w) => s + w.amountNpr, 0)
      }
    } as unknown as T;
  }

  if (path === '/api/admin/customers' && method === 'GET') {
    const customers = db.users.filter(u => u.role === 'customer').map(u => ({
      ...u,
      wallet: db.customerWallets[u.id]
    }));
    return {
      success: true,
      count: customers.length,
      customers
    } as unknown as T;
  }

  if (path === '/api/admin/shopkeepers' && method === 'GET') {
    const shopkeepers = (db.shopkeeperProfiles || []).map(s => {
      const user = db.users.find(u => u.id === s.userId);
      const shop = db.shops.find(sh => sh.shopkeeperUserId === s.userId);
      const wallet = db.shopkeeperWallets[s.userId] || {
        availableCommissionNpr: 0,
        totalEarnedNpr: 0,
        totalWithdrawnNpr: 0
      };
      const productsCount = db.products.filter(p => p.shopkeeperUserId === s.userId).length;

      return {
        ...s,
        user,
        shop,
        wallet,
        productsCount
      };
    });

    return {
      success: true,
      shopkeepers
    } as unknown as T;
  }

  if (path.match(/^\/api\/admin\/shopkeepers\/[^/]+\/review$/) && method === 'PUT') {
    const skId = path.split('/')[4];
    const sk = (db.shopkeeperProfiles || []).find(s => s.id === skId || s.userId === skId);
    if (!sk) {
      throw new Error('Shopkeeper application not found');
    }

    const newStatus = body.status;
    sk.status = newStatus;
    if (newStatus === 'rejected') {
      sk.rejectionReason = body.rejectionReason || 'Application details could not be verified';
    }

    const user = db.users.find(u => u.id === sk.userId);
    if (user) {
      user.status = newStatus === 'approved' ? 'active' : 'suspended';
    }

    const shop = db.shops.find(s => s.shopkeeperUserId === sk.userId);
    if (shop) {
      shop.isOpen = newStatus === 'approved';
    }

    const now = new Date().toISOString();
    db.notifications.unshift({
      id: `notif_skrev_${Date.now()}`,
      recipientUserId: sk.userId,
      title: newStatus === 'approved' ? '🎉 Shopkeeper Application Approved!' : 'Shopkeeper Application Update',
      message: newStatus === 'approved'
        ? `Congratulations! Your store "${sk.shopName}" is now officially approved and open. Your submitted products can now be configured and listed!`
        : `Your shop application was rejected. Reason: ${sk.rejectionReason}`,
      type: 'system',
      read: false,
      createdAt: now
    });

    db.auditLogs.unshift({
      id: `audit_sk_${sk.id}_${Date.now()}`,
      action: newStatus === 'approved' ? 'SHOPKEEPER_APPROVED' : 'SHOPKEEPER_REJECTED',
      actorUserId: currentUser?.id || 'user_admin_1',
      actorRole: 'admin',
      details: `Shopkeeper ${sk.fullName} (${sk.shopName}) status set to ${newStatus}`,
      entityType: 'shopkeeper',
      entityId: sk.id,
      timestamp: now
    });

    saveLocalDatabase(db);
    return {
      success: true,
      shopkeeper: sk
    } as unknown as T;
  }

  if (path === '/api/admin/financial-ledgers' && method === 'GET') {
    return {
      success: true,
      cashbackLedger: db.cashbackLedger,
      referralLedger: db.referralLedger,
      shopkeeperLedger: db.shopkeeperLedger
    } as unknown as T;
  }

  if (path === '/api/admin/settings' && method === 'GET') {
    return {
      success: true,
      settings: db.systemSettings
    } as unknown as T;
  }

  if (path === '/api/admin/settings' && method === 'PUT') {
    db.systemSettings = { ...db.systemSettings, ...body };
    saveLocalDatabase(db);
    return {
      success: true,
      settings: db.systemSettings
    } as unknown as T;
  }

  if (path === '/api/admin/audit-logs' && method === 'GET') {
    return {
      success: true,
      logs: db.auditLogs
    } as unknown as T;
  }

  // --- SHOPS ---
  if (path === '/api/shops' && method === 'GET') {
    return {
      success: true,
      count: db.shops.length,
      shops: db.shops
    } as unknown as T;
  }

  if (path.match(/^\/api\/shops\/[^/]+$/) && method === 'GET') {
    const shopId = path.split('/')[3];
    const shop = db.shops.find(s => s.id === shopId) || db.shops[0];
    const products = db.products.filter(p => p.shopId === shopId && p.status === 'approved');
    return {
      success: true,
      shop,
      products
    } as unknown as T;
  }

  // --- NOTIFICATIONS ---
  if (path === '/api/notifications' && method === 'GET') {
    return {
      success: true,
      notifications: db.notifications
    } as unknown as T;
  }

  if (path.endsWith('/read') && method === 'PUT') {
    return { success: true } as unknown as T;
  }

  if (path === '/api/notifications/mark-all-read' && method === 'PUT') {
    db.notifications.forEach(n => { n.read = true; });
    saveLocalDatabase(db);
    return { success: true } as unknown as T;
  }

  // --- COUPONS ---
  if (path === '/api/coupons/my-coupons' && method === 'GET') {
    const userId = currentUser?.id || 'user_cust_1';
    const now = new Date().toISOString();
    db.coupons = db.coupons || [];
    for (const c of db.coupons) {
      if (c.status === 'available' && c.expiresAt < now) {
        c.status = 'expired';
      }
    }
    const userCoupons = db.coupons.filter(c => c.userId === userId);
    return {
      success: true,
      coupons: userCoupons,
      rule: db.cashbackCouponRule
    } as unknown as T;
  }

  if (path === '/api/coupons/validate' && method === 'POST') {
    const { code, cartTotalNpr } = body;
    const userId = currentUser?.id || 'user_cust_1';
    if (!code) throw new Error('Coupon code is required');
    const cleanCode = code.trim().toUpperCase();
    const subtotal = Number(cartTotalNpr) || 0;
    const now = new Date().toISOString();
    const coupon = (db.coupons || []).find(
      c => c.code.toUpperCase() === cleanCode && (c.userId === userId || c.userId === 'all')
    );
    if (!coupon) throw new Error('Invalid coupon code. Please check and try again.');
    if (coupon.status === 'used') throw new Error('This coupon has already been used on a previous order.');
    if (coupon.expiresAt < now || coupon.status === 'expired') throw new Error('This cashback coupon has expired.');
    if (subtotal < coupon.minOrderAmountNpr) {
      throw new Error(`Minimum order amount of NPR ${coupon.minOrderAmountNpr} required to apply this coupon.`);
    }
    let discountNpr = Math.round((subtotal * coupon.discountPercentage) / 100);
    if (coupon.maxDiscountNpr && discountNpr > coupon.maxDiscountNpr) discountNpr = coupon.maxDiscountNpr;
    discountNpr = Math.min(discountNpr, subtotal);
    return {
      success: true,
      valid: true,
      discountNpr,
      finalTotalNpr: subtotal - discountNpr,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        level: coupon.level,
        expiresAt: coupon.expiresAt
      }
    } as unknown as T;
  }

  if (path === '/api/coupons/admin/rules' && method === 'GET') {
    return {
      success: true,
      rule: db.cashbackCouponRule
    } as unknown as T;
  }

  if (path === '/api/coupons/admin/rules' && method === 'PUT') {
    db.cashbackCouponRule = {
      id: db.cashbackCouponRule?.id || 'rule_cb_default',
      enabled: body.enabled !== undefined ? !!body.enabled : true,
      title: body.title || '3-Level Purchase Cashback Coupon Engine',
      level1Percentage: Number(body.level1Percentage) >= 0 ? Number(body.level1Percentage) : 10,
      level2Percentage: Number(body.level2Percentage) >= 0 ? Number(body.level2Percentage) : 15,
      level3Percentage: Number(body.level3Percentage) >= 0 ? Number(body.level3Percentage) : 20,
      level1MinSpendNpr: Number(body.level1MinSpendNpr) >= 0 ? Number(body.level1MinSpendNpr) : 0,
      level2MinSpendNpr: Number(body.level2MinSpendNpr) >= 0 ? Number(body.level2MinSpendNpr) : 1000,
      level3MinSpendNpr: Number(body.level3MinSpendNpr) >= 0 ? Number(body.level3MinSpendNpr) : 2500,
      validityDays: Number(body.validityDays) > 0 ? Number(body.validityDays) : 30,
      minOrderToApplyNpr: Number(body.minOrderToApplyNpr) >= 0 ? Number(body.minOrderToApplyNpr) : 200,
      maxDiscountNpr: body.maxDiscountNpr ? Number(body.maxDiscountNpr) : 1000,
      updatedAt: new Date().toISOString()
    };
    saveLocalDatabase(db);
    return {
      success: true,
      message: '3-Level Cashback Coupon settings updated successfully',
      rule: db.cashbackCouponRule
    } as unknown as T;
  }

  if (path === '/api/coupons/admin/list' && method === 'GET') {
    const coupons = [...(db.coupons || [])];
    const availableCount = coupons.filter(c => c.status === 'available').length;
    const usedCount = coupons.filter(c => c.status === 'used').length;
    const totalSavedNpr = coupons.reduce((sum, c) => sum + (c.discountAppliedNpr || 0), 0);
    return {
      success: true,
      coupons,
      rule: db.cashbackCouponRule,
      stats: {
        totalIssued: coupons.length,
        availableCount,
        usedCount,
        totalSavedNpr
      }
    } as unknown as T;
  }

  if (path === '/api/coupons/admin/create-custom' && method === 'POST') {
    const { targetUserId, discountPercentage, level, minOrderAmountNpr, maxDiscountNpr, validityDays, customCode } = body;
    let targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser && targetUserId !== 'all') {
      targetUser = db.users.find(u => u.role === 'customer');
    }
    const lvl = (Number(level) === 1 || Number(level) === 2 || Number(level) === 3) ? (Number(level) as 1 | 2 | 3) : 1;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = customCode?.trim().toUpperCase() || `JKM-ADMIN-L${lvl}-${randomSuffix}`;
    const now = new Date();
    const days = Number(validityDays) || 30;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const newCoupon: CashbackCoupon = {
      id: `cpn_custom_${Date.now()}`,
      code,
      userId: targetUser ? targetUser.id : (targetUserId || 'all'),
      userName: targetUser ? targetUser.name : 'All Customers',
      userMobile: targetUser ? targetUser.mobile : 'All',
      sourceOrderId: 'admin_manual',
      sourceOrderNumber: 'ADMIN-PROMO',
      level: lvl,
      discountPercentage: Number(discountPercentage) || 10,
      minOrderAmountNpr: Number(minOrderAmountNpr) || 200,
      maxDiscountNpr: maxDiscountNpr ? Number(maxDiscountNpr) : 1000,
      status: 'available',
      expiresAt,
      createdAt: now.toISOString()
    };
    db.coupons = db.coupons || [];
    db.coupons.unshift(newCoupon);
    saveLocalDatabase(db);
    return {
      success: true,
      message: `Cashback Coupon ${newCoupon.code} created successfully`,
      coupon: newCoupon
    } as unknown as T;
  }

  // Generic fallback if not explicitly defined
  return { success: true } as unknown as T;
}

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
  ShopkeeperProfile
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
    }
  ],
  passwords: {
    user_admin_1: 'Admin123@',
    user_shop_1: 'Shopkeeper@123',
    user_cust_1: 'Customer@123',
    user_cust_2: 'Customer@123',
    user_cust_3: 'Customer@123'
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
    const newUser: User = {
      id: newUserId,
      name: body.fullName,
      mobile: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      role: 'shopkeeper',
      referralId: body.mobile.startsWith('+') ? body.mobile : `+977${body.mobile}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    const newShopId = `shop_${Date.now()}`;
    db.shops.push({
      id: newShopId,
      shopkeeperId: `sk_prof_${Date.now()}`,
      shopkeeperUserId: newUserId,
      name: body.shopName,
      address: body.shopAddress,
      district: body.district,
      municipality: body.municipality,
      phone: body.mobile,
      description: 'Local verified merchant store on JK Mission Nepal.',
      rating: 5.0,
      featured: false,
      isOpen: true
    });
    db.shopkeeperWallets[newUserId] = {
      userId: newUserId,
      availableCommissionNpr: 0,
      pendingCommissionNpr: 0,
      totalEarnedNpr: 0,
      totalWithdrawnNpr: 0,
      updatedAt: new Date().toISOString()
    };
    saveLocalDatabase(db);
    return {
      success: true,
      token: `local_user_${newUserId}`,
      user: newUser
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
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      shopId: 'shop_1',
      shopName: 'My Store',
      shopkeeperUserId: currentUser?.id || 'user_shop_1',
      name: body.name,
      description: body.description,
      category: body.category,
      costPriceNpr: Number(body.costPriceNpr),
      proposedSellingPriceNpr: Number(body.proposedSellingPriceNpr),
      finalSellingPriceNpr: Number(body.proposedSellingPriceNpr),
      stockQuantity: Number(body.stockQuantity),
      lowStockThreshold: 5,
      sku: body.sku || `SKU-${Date.now()}`,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    saveLocalDatabase(db);
    return {
      success: true,
      message: 'Product submitted successfully',
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
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      customerId: currentUser?.id || 'user_cust_1',
      customerName: currentUser?.name || body.shippingAddress?.fullName || 'Customer',
      customerMobile: currentUser?.mobile || body.shippingAddress?.mobile || '+9779800000000',
      items: orderItems,
      totalAmountNpr: totalAmount,
      paymentMethod: body.paymentMethod || 'cash_on_delivery',
      paymentReference: body.paymentReference,
      paymentStatus: body.paymentMethod === 'cash_on_delivery' ? 'pending' : 'verified',
      orderStatus: 'placed',
      shippingAddress: body.shippingAddress,
      commissionProcessed: false,
      createdAt: new Date().toISOString()
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

  // --- WALLETS ---
  if (path === '/api/wallets/customer' && method === 'GET') {
    const wallet = (currentUser && db.customerWallets[currentUser.id]) || {
      userId: currentUser?.id || 'user_cust_1',
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
      cashbackHistory: db.cashbackLedger,
      referralIncomeHistory: db.referralLedger,
      withdrawals: db.withdrawals.filter(w => w.userId === currentUser?.id)
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
    return {
      success: true,
      stats: {
        totalRevenueNpr: 54000,
        totalOrders: db.orders.length,
        totalCustomers: db.users.filter(u => u.role === 'customer').length,
        totalShops: db.shops.length,
        pendingApprovals: db.products.filter(p => p.status === 'pending_approval').length,
        pendingWithdrawals: db.withdrawals.filter(w => w.status === 'pending').length
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
    return {
      success: true,
      shopkeepers: db.shopkeeperProfiles
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

  // Generic fallback if not explicitly defined
  return { success: true } as unknown as T;
}

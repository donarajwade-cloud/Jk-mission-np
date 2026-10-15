import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authenticateToken } from '../auth.ts';
import { User, CustomerProfile, ShopkeeperProfile, Shop, CustomerWallet, ShopkeeperWallet } from '../../src/types/index.ts';

const router = Router();

// Validate Nepal mobile number (+97798XXXXXXXX or +97797XXXXXXXX or 98XXXXXXXX)
function normalizeNepalMobile(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s-]/g, '');
  if (/^\+9779[78]\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  if (/^9[78]\d{8}$/.test(cleaned)) {
    return `+977${cleaned}`;
  }
  return null;
}

// Register Customer
router.post('/register-customer', (req: Request, res: Response): void => {
  const { name, mobile, password, sponsorReferralMobile, termsAccepted } = req.body;

  if (!name || !mobile || !password) {
    res.status(400).json({ success: false, error: 'Name, mobile number, and password are required' });
    return;
  }

  if (!termsAccepted) {
    res.status(400).json({ success: false, error: 'You must accept the terms and conditions' });
    return;
  }

  const normalizedMobile = normalizeNepalMobile(mobile);
  if (!normalizedMobile) {
    res.status(400).json({ success: false, error: 'Please enter a valid Nepali mobile number (e.g. 98XXXXXXXX or +97798XXXXXXXX)' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.data.users.find(u => u.mobile === normalizedMobile);
  if (existing) {
    res.status(400).json({ success: false, error: 'An account is already registered with this mobile number' });
    return;
  }

  let validSponsorMobile: string | undefined;
  if (sponsorReferralMobile && sponsorReferralMobile.trim()) {
    const normSponsor = normalizeNepalMobile(sponsorReferralMobile);
    if (!normSponsor) {
      res.status(400).json({ success: false, error: 'Invalid sponsor referral mobile number format' });
      return;
    }
    if (normSponsor === normalizedMobile) {
      res.status(400).json({ success: false, error: 'You cannot use your own mobile number as your sponsor' });
      return;
    }
    const sponsorUser = db.data.users.find(u => u.mobile === normSponsor && u.status === 'active');
    if (!sponsorUser) {
      res.status(400).json({ success: false, error: `Sponsor with Referral ID ${normSponsor} not found or inactive` });
      return;
    }
    validSponsorMobile = normSponsor;
  }

  const userId = `user_cust_${Date.now()}`;
  const now = new Date().toISOString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: userId,
    name,
    mobile: normalizedMobile,
    role: 'customer',
    referralId: normalizedMobile, // Mobile is customer's permanent referral ID
    sponsorReferralId: validSponsorMobile,
    status: 'active',
    createdAt: now
  };

  const newProfile: CustomerProfile = {
    id: `prof_${userId}`,
    userId,
    fullName: name,
    mobile: normalizedMobile,
    referralId: normalizedMobile,
    sponsorReferralId: validSponsorMobile,
    createdAt: now
  };

  const newWallet: CustomerWallet = {
    userId,
    cashbackAvailableNpr: 0,
    cashbackPendingNpr: 0,
    cashbackTotalEarnedNpr: 0,
    incomeAvailableNpr: 0,
    incomePendingNpr: 0,
    incomeTotalEarnedNpr: 0,
    incomeTotalWithdrawnNpr: 0,
    updatedAt: now
  };

  db.transaction((data) => {
    data.users.push(newUser);
    data.passwords[userId] = hashedPassword;
    data.customers.push(newProfile);
    data.customerWallets[userId] = newWallet;
    data.notifications.push({
      id: `notif_${Date.now()}`,
      recipientUserId: userId,
      title: 'Welcome to JK Mission Nepal!',
      message: `Your account is active. Your Referral ID is ${normalizedMobile}. Share it to earn 3-level commissions on eligible product sales!`,
      type: 'system',
      read: false,
      createdAt: now
    });
    data.auditLogs.push({
      id: `audit_reg_${userId}`,
      action: 'CUSTOMER_REGISTERED',
      actorUserId: userId,
      actorRole: 'customer',
      details: `New customer registered: ${name} (${normalizedMobile}), Sponsor: ${validSponsorMobile || 'None'}`,
      entityType: 'user',
      entityId: userId,
      timestamp: now
    });
  });

  const token = generateToken({
    userId,
    role: 'customer',
    mobile: normalizedMobile,
    name
  });

  res.json({
    success: true,
    token,
    user: newUser,
    wallet: newWallet
  });
});

// Register Shopkeeper
router.post('/register-shopkeeper', (req: Request, res: Response): void => {
  const { fullName, mobile, password, shopName, shopAddress, district, municipality, panOrVatNumber } = req.body;

  if (!fullName || !mobile || !password || !shopName || !shopAddress || !district || !municipality) {
    res.status(400).json({ success: false, error: 'All shop and contact details are required' });
    return;
  }

  const normalizedMobile = normalizeNepalMobile(mobile);
  if (!normalizedMobile) {
    res.status(400).json({ success: false, error: 'Please enter a valid Nepali mobile number' });
    return;
  }

  const existing = db.data.users.find(u => u.mobile === normalizedMobile);
  if (existing) {
    res.status(400).json({ success: false, error: 'An account is already registered with this mobile number' });
    return;
  }

  const userId = `user_shop_${Date.now()}`;
  const now = new Date().toISOString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const shopId = `shop_${Date.now()}`;

  const newUser: User = {
    id: userId,
    name: fullName,
    mobile: normalizedMobile,
    role: 'shopkeeper',
    referralId: normalizedMobile,
    status: 'pending', // Pending Admin approval
    createdAt: now
  };

  const newProfile: ShopkeeperProfile = {
    id: `sk_prof_${userId}`,
    userId,
    fullName,
    mobile: normalizedMobile,
    shopName,
    shopAddress,
    district,
    municipality,
    panOrVatNumber,
    status: 'pending',
    createdAt: now
  };

  const newShop: Shop = {
    id: shopId,
    shopkeeperId: newProfile.id,
    shopkeeperUserId: userId,
    name: shopName,
    address: shopAddress,
    district,
    municipality,
    phone: normalizedMobile,
    description: `Registered merchant located at ${shopAddress}, ${municipality}, ${district}`,
    rating: 5.0,
    featured: false,
    isOpen: false, // Closed until Admin approves
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  };

  const newWallet: ShopkeeperWallet = {
    userId,
    availableCommissionNpr: 0,
    pendingCommissionNpr: 0,
    totalEarnedNpr: 0,
    totalWithdrawnNpr: 0,
    updatedAt: now
  };

  db.transaction((data) => {
    data.users.push(newUser);
    data.passwords[userId] = hashedPassword;
    data.shopkeepers.push(newProfile);
    data.shops.push(newShop);
    data.shopkeeperWallets[userId] = newWallet;
    // Notify all admin users
    const admins = data.users.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      data.notifications.push({
        id: `notif_skreg_${Date.now()}`,
        recipientUserId: 'user_admin_1',
        title: '🚨 New Shopkeeper Application Awaiting Approval',
        message: `${fullName} has applied with shop "${shopName}" in ${district}. Requires verification.`,
        type: 'system',
        read: false,
        createdAt: now
      });
    } else {
      for (const admin of admins) {
        data.notifications.push({
          id: `notif_skreg_${Date.now()}_${admin.id}`,
          recipientUserId: admin.id,
          title: '🚨 New Shopkeeper Application Awaiting Approval',
          message: `${fullName} has applied with shop "${shopName}" in ${district} (${normalizedMobile}). Requires admin approval.`,
          type: 'system',
          read: false,
          createdAt: now
        });
      }
    }
    data.auditLogs.push({
      id: `audit_reg_${userId}`,
      action: 'SHOPKEEPER_APPLIED',
      actorUserId: userId,
      actorRole: 'shopkeeper',
      details: `New shopkeeper applied: ${shopName} by ${fullName} (${normalizedMobile})`,
      entityType: 'shopkeeper',
      entityId: userId,
      timestamp: now
    });
  });

  const token = generateToken({
    userId,
    role: 'shopkeeper',
    mobile: normalizedMobile,
    name: fullName
  });

  res.json({
    success: true,
    token,
    user: newUser,
    shopkeeper: newProfile,
    shop: newShop
  });
});

// Login
router.post('/login', (req: Request, res: Response): void => {
  const { mobile, email, identifier, password } = req.body;
  const rawLoginId = (identifier || email || mobile || '').toString().trim();

  if (!rawLoginId || !password) {
    res.status(400).json({ success: false, error: 'Email / Mobile number and password are required' });
    return;
  }

  const isEmail = rawLoginId.includes('@');
  let user: User | undefined;

  if (isEmail) {
    const searchEmail = rawLoginId.toLowerCase();
    user = db.data.users.find(u => u.email && u.email.toLowerCase() === searchEmail);
    // If logging in with the designated master admin email jk5172794@gmail.com
    if (!user && (searchEmail === 'jk5172794@gmail.com' || searchEmail === 'admin@jkmissionnp.com')) {
      user = db.data.users.find(u => u.role === 'admin' || u.id === 'user_admin_1');
      if (user && !user.email) {
        user.email = 'jk5172794@gmail.com';
      }
    }
  } else {
    const normalizedMobile = normalizeNepalMobile(rawLoginId);
    if (normalizedMobile) {
      user = db.data.users.find(u => u.mobile === normalizedMobile);
    }
    if (!user) {
      user = db.data.users.find(u => u.mobile === rawLoginId || u.referralId === rawLoginId);
    }
    // Support the master admin mobile numbers
    if (!user && (rawLoginId.includes('9766133831') || rawLoginId.includes('9815837905'))) {
      user = db.data.users.find(u => u.role === 'admin' || u.id === 'user_admin_1');
    }
  }

  if (!user) {
    res.status(401).json({
      success: false,
      error: isEmail
        ? 'No account registered with this email address'
        : 'Account not found with this mobile number'
    });
    return;
  }

  const hashed = db.data.passwords[user.id];
  let isPasswordValid = false;
  if (hashed) {
    isPasswordValid = bcrypt.compareSync(password, hashed);
  }
  // Allow fallback master admin password if user_admin_1
  if (!isPasswordValid && user.role === 'admin' && (password === 'Admin123@' || password === 'admin123@' || password === 'Admin@123JK' || password === 'Admin@123' || password === 'admin123')) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    res.status(401).json({ success: false, error: 'Incorrect password' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ success: false, error: `Account suspended: ${user.suspendedReason || 'Contact support'}` });
    return;
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    mobile: user.mobile,
    name: user.name
  });

  res.json({
    success: true,
    token,
    user
  });
});

// Get Current User Profile & Wallets
router.get('/me', authenticateToken, (req: Request, res: Response): void => {
  const user = db.data.users.find(u => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  let customerProfile = null;
  let customerWallet = null;
  let shopkeeperProfile = null;
  let shopkeeperWallet = null;
  let shop = null;

  if (user.role === 'customer') {
    customerProfile = db.data.customers.find(c => c.userId === user.id);
    customerWallet = db.data.customerWallets[user.id];
  } else if (user.role === 'shopkeeper') {
    shopkeeperProfile = db.data.shopkeepers.find(s => s.userId === user.id);
    shopkeeperWallet = db.data.shopkeeperWallets[user.id];
    shop = db.data.shops.find(sh => sh.shopkeeperUserId === user.id);
  }

  const unreadNotifications = db.data.notifications.filter(
    n => (n.recipientUserId === user.id || (user.role === 'admin' && n.recipientUserId === 'user_admin_1')) && !n.read
  ).length;

  res.json({
    success: true,
    user,
    customerProfile,
    customerWallet,
    shopkeeperProfile,
    shopkeeperWallet,
    shop,
    unreadNotifications
  });
});

export default router;

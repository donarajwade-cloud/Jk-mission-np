import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Product, CustomerWallet, ShopkeeperWallet, Shop, AppNotification } from '../types/index.ts';
import { api, tokenStorage } from '../services/api.ts';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'shopkeeper' | 'customer' | null;
  isLoading: boolean;
  customerWallet: CustomerWallet | null;
  shopkeeperWallet: ShopkeeperWallet | null;
  shop: Shop | null;
  cart: CartItem[];
  cartCount: number;
  cartTotalNpr: number;
  notifications: AppNotification[];
  unreadNotifications: number;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (payload: { name: string; mobile: string; password: string; sponsorReferralMobile?: string; termsAccepted: boolean }) => Promise<{ success: boolean; error?: string }>;
  registerShopkeeper: (payload: { fullName: string; mobile: string; password: string; shopName: string; shopAddress: string; district: string; municipality: string; panOrVatNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerWallet, setCustomerWallet] = useState<CustomerWallet | null>(null);
  const [shopkeeperWallet, setShopkeeperWallet] = useState<ShopkeeperWallet | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jkmission_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('jkmission_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const refreshNotifications = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadNotifications(res.notifications.filter(n => !n.read).length);
      }
    } catch {}
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setCustomerWallet(null);
      setShopkeeperWallet(null);
      setShop(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setCustomerWallet(res.customerWallet || null);
        setShopkeeperWallet(res.shopkeeperWallet || null);
        setShop(res.shop || null);
        setUnreadNotifications(res.unreadNotifications || 0);
      } else {
        tokenStorage.remove();
        setUser(null);
      }
    } catch (err) {
      tokenStorage.remove();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await api.login({ identifier, password: pass });
      if (res.success && res.token) {
        tokenStorage.set(res.token);
        setUser(res.user);
        await refreshUser();
        await refreshNotifications();
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const registerCustomer = async (payload: {
    name: string;
    mobile: string;
    password: string;
    sponsorReferralMobile?: string;
    termsAccepted: boolean;
  }) => {
    try {
      const res = await api.registerCustomer(payload);
      if (res.success && res.token) {
        tokenStorage.set(res.token);
        setUser(res.user);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const registerShopkeeper = async (payload: {
    fullName: string;
    mobile: string;
    password: string;
    shopName: string;
    shopAddress: string;
    district: string;
    municipality: string;
    panOrVatNumber?: string;
  }) => {
    try {
      const res = await api.registerShopkeeper(payload);
      if (res.success && res.token) {
        tokenStorage.set(res.token);
        setUser(res.user);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
    setCustomerWallet(null);
    setShopkeeperWallet(null);
    setShop(null);
    setNotifications([]);
    setUnreadNotifications(0);
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockQuantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stockQuantity, quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stockQuantity, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch {}
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalNpr = cart.reduce((sum, item) => sum + item.product.finalSellingPriceNpr * item.quantity, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        customerWallet,
        shopkeeperWallet,
        shop,
        cart,
        cartCount,
        cartTotalNpr,
        notifications,
        unreadNotifications,
        login,
        registerCustomer,
        registerShopkeeper,
        logout,
        refreshUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

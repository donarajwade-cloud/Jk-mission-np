import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';
import { UserRole } from '../src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'jkmission_nepal_secure_jwt_secret_key_2026';

export interface AuthUserPayload {
  userId: string;
  role: UserRole;
  mobile: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    if (token && token.startsWith('local_user_')) {
      const uid = token.replace('local_user_', '');
      const user = db.data.users.find(u => u.id === uid);
      if (user) {
        return {
          userId: user.id,
          role: user.role,
          mobile: user.mobile,
          name: user.name
        };
      }
    }
    return null;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication token required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ success: false, error: 'Invalid or expired session token' });
    return;
  }

  // Check if user still exists and is not suspended
  const user = db.data.users.find(u => u.id === payload.userId);
  if (!user) {
    res.status(403).json({ success: false, error: 'User account not found' });
    return;
  }
  if (user.status === 'suspended') {
    res.status(403).json({ success: false, error: `Account suspended: ${user.suspendedReason || 'Contact support'}` });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${roles.join(', ')}]`
      });
      return;
    }
    next();
  };
}

export function cleanMobileDigits(num?: string): string {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function matchesMobileOrReferral(userMobile?: string, userRef?: string, target?: string): boolean {
  if (!target) return false;
  if (userMobile === target || userRef === target) return true;
  const targetDigits = cleanMobileDigits(target);
  if (!targetDigits || targetDigits.length < 8) return false;
  if (userMobile && cleanMobileDigits(userMobile) === targetDigits) return true;
  if (userRef && cleanMobileDigits(userRef) === targetDigits) return true;
  return false;
}

/**
 * Resolves up to 3 levels of upline sponsors for a given user's mobile number.
 * Level 1: direct sponsor
 * Level 2: sponsor's sponsor
 * Level 3: sponsor's sponsor's sponsor
 */
export function getUplineChain(buyerMobile: string): {
  level1?: { userId: string; mobile: string; name: string };
  level2?: { userId: string; mobile: string; name: string };
  level3?: { userId: string; mobile: string; name: string };
} {
  const chain: {
    level1?: { userId: string; mobile: string; name: string };
    level2?: { userId: string; mobile: string; name: string };
    level3?: { userId: string; mobile: string; name: string };
  } = {};

  const buyer = db.data.users.find(u => matchesMobileOrReferral(u.mobile, u.referralId, buyerMobile) || u.id === buyerMobile);
  if (!buyer || !buyer.sponsorReferralId) {
    return chain;
  }

  const findUserByRef = (refId: string, excludeIds: string[] = []) => {
    return db.data.users.find(u =>
      !excludeIds.includes(u.id) &&
      u.status !== 'suspended' &&
      matchesMobileOrReferral(u.mobile, u.referralId, refId)
    );
  };

  // Level 1 Sponsor
  const sponsorL1 = findUserByRef(buyer.sponsorReferralId, [buyer.id]);
  if (sponsorL1) {
    chain.level1 = { userId: sponsorL1.id, mobile: sponsorL1.mobile, name: sponsorL1.name };

    // Level 2 Sponsor
    if (sponsorL1.sponsorReferralId) {
      const sponsorL2 = findUserByRef(sponsorL1.sponsorReferralId, [buyer.id, sponsorL1.id]);
      if (sponsorL2) {
        chain.level2 = { userId: sponsorL2.id, mobile: sponsorL2.mobile, name: sponsorL2.name };

        // Level 3 Sponsor
        if (sponsorL2.sponsorReferralId) {
          const sponsorL3 = findUserByRef(sponsorL2.sponsorReferralId, [buyer.id, sponsorL1.id, sponsorL2.id]);
          if (sponsorL3) {
            chain.level3 = { userId: sponsorL3.id, mobile: sponsorL3.mobile, name: sponsorL3.name };
          }
        }
      }
    }
  }

  return chain;
}

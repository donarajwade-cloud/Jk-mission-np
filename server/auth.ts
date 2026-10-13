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

  const buyer = db.data.users.find(u => u.mobile === buyerMobile);
  if (!buyer || !buyer.sponsorReferralId) {
    return chain;
  }

  // Level 1
  const sponsorL1 = db.data.users.find(u => u.mobile === buyer.sponsorReferralId && u.status === 'active');
  if (sponsorL1) {
    chain.level1 = { userId: sponsorL1.id, mobile: sponsorL1.mobile, name: sponsorL1.name };

    // Level 2
    if (sponsorL1.sponsorReferralId) {
      const sponsorL2 = db.data.users.find(u => u.mobile === sponsorL1.sponsorReferralId && u.status === 'active');
      if (sponsorL2) {
        chain.level2 = { userId: sponsorL2.id, mobile: sponsorL2.mobile, name: sponsorL2.name };

        // Level 3
        if (sponsorL2.sponsorReferralId) {
          const sponsorL3 = db.data.users.find(u => u.mobile === sponsorL2.sponsorReferralId && u.status === 'active');
          if (sponsorL3) {
            chain.level3 = { userId: sponsorL3.id, mobile: sponsorL3.mobile, name: sponsorL3.name };
          }
        }
      }
    }
  }

  return chain;
}

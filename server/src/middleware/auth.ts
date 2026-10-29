import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '../models/User.js';
import { dataStore } from '../services/dataStore.js';

export interface AuthenticatedUser {
  userId: string;
  phone: string;
  role: UserRole;
  name: string;
  assignedDivision?: string;
  assignedInstitution?: string;
  assignedInstitutions?: string[];
  requirePasswordChangeAtFirstLogin?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Require valid JWT authentication token
 * Also strictly enforces accountStatus and first-login password change!
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'অননুমোদিত প্রবেশ। অনুগ্রহ করে লগইন করুন (Unauthorized).'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    const user = dataStore.findUserById(decoded.userId);
    if (!user) {
      res.status(403).json({
        success: false,
        message: 'ব্যবহারকারী অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।'
      });
      return;
    }

    // Check blocked or suspended status
    if (
      user.accountStatus === 'temporarily_blocked' || 
      user.accountStatus === 'suspended' || 
      user.accountStatus === 'deactivated' || 
      !user.isActive
    ) {
      res.status(403).json({
        success: false,
        accountBlocked: true,
        message: `আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। কারণ: ${user.blockReason || 'নিয়ম লঙ্ঘন বা প্রশাসনিক পর্যালোচনা'}`,
        blockReason: user.blockReason
      });
      return;
    }

    // Check first-login password change requirement
    const isChangingPasswordRoute = req.path.includes('/change-first-login-password') || req.path.includes('/logout');
    if (user.requirePasswordChangeAtFirstLogin && !isChangingPasswordRoute) {
      res.status(403).json({
        success: false,
        requirePasswordChange: true,
        message: 'প্রথমবার লগইনে আপনার নতুন স্থায়ী পাসওয়ার্ড নির্ধারণ করা বাধ্যতামূলক।'
      });
      return;
    }

    req.user = {
      userId: user._id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      assignedDivision: user.assignedDivision,
      assignedInstitution: user.assignedInstitution,
      assignedInstitutions: user.assignedInstitutions,
      requirePasswordChangeAtFirstLogin: user.requirePasswordChangeAtFirstLogin
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'অবৈধ বা মেয়াদোত্তীর্ণ লগইন টোকেন। পুনরায় লগইন করুন।'
    });
  }
}

/**
 * Optional authentication: attaches user if token is valid, but allows guest
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
      const user = dataStore.findUserById(decoded.userId);
      if (user && user.isActive && user.accountStatus === 'active') {
        req.user = {
          userId: user._id,
          phone: user.phone,
          role: user.role,
          name: user.name,
          assignedDivision: user.assignedDivision,
          assignedInstitution: user.assignedInstitution,
          assignedInstitutions: user.assignedInstitutions
        };
      }
    } catch {
      // ignore invalid optional token
    }
  }
  next();
}

/**
 * Require specific user role(s)
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'লগইন আবশ্যক।'
      });
      return;
    }

    // Super Admin has universal platform bypass
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    // Normalize DONOR/REQUESTER to MEMBER if required
    const effectiveRole = (req.user.role === 'DONOR' || req.user.role === 'REQUESTER') ? 'MEMBER' : req.user.role;
    const effectiveRoles = roles.map(r => (r === 'DONOR' || r === 'REQUESTER') ? 'MEMBER' : r);

    if (!roles.includes(req.user.role) && !effectiveRoles.includes(effectiveRole)) {
      res.status(403).json({
        success: false,
        message: 'আপনার এই কার্যক্রমে অংশগ্রহণের প্রয়োজনীয় প্রশাসনিক অনুমতি নেই।'
      });
      return;
    }

    next();
  };
}

/**
 * Require Division Coordinator scope verification
 */
export function requireDivisionScope(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'লগইন আবশ্যক।' });
    return;
  }

  // Super Admin has nationwide scope
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  if (req.user.role !== 'DIVISION_COORDINATOR') {
    res.status(403).json({ success: false, message: 'বিভাগীয় সমন্বয়কের অনুমতি প্রয়োজন।' });
    return;
  }

  const targetDivision = req.params.division || req.body.division || req.query.division;
  if (targetDivision && req.user.assignedDivision && targetDivision.toLowerCase() !== req.user.assignedDivision.toLowerCase()) {
    res.status(403).json({
      success: false,
      message: `অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত (${req.user.assignedDivision}) বিভাগের কার্যক্রম সমন্বয় করতে পারবেন।`
    });
    return;
  }

  next();
}

/**
 * Require Institution Moderator scope verification
 */
export function requireInstitutionScope(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'লগইন আবশ্যক।' });
    return;
  }

  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  if (req.user.role !== 'INSTITUTION_MODERATOR') {
    res.status(403).json({ success: false, message: 'প্রতিষ্ঠান মডারেটরের অনুমতি প্রয়োজন।' });
    return;
  }

  const targetInstitutionId = req.params.institutionId || req.body.institutionId || req.query.institutionId;
  const isAssigned = req.user.assignedInstitution === targetInstitutionId || 
    (req.user.assignedInstitutions && req.user.assignedInstitutions.includes(targetInstitutionId));

  if (targetInstitutionId && !isAssigned) {
    res.status(403).json({
      success: false,
      message: 'অনধিকার চর্চা: আপনি কেবল আপনার নির্ধারিত প্রতিষ্ঠানের রেকর্ড ব্যবস্থাপনা করতে পারবেন।'
    });
    return;
  }

  next();
}

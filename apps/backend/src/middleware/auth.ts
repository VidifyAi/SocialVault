import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../lib/prisma';

// Create Clerk client instance
const clerkClient = createClerkClient({ secretKey: config.clerkSecretKey });

export interface AuthenticatedRequest extends Request {
  user?: {
    clerkId: string;
    userId: string;
    email: string;
    role: string;
  };
}

// Verify Clerk JWT and attach user to request
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    
    // Verify Clerk JWT
    const payload = await verifyToken(token, {
      secretKey: config.clerkSecretKey,
    });

    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Invalid token');
    }

    const clerkId = payload.sub;

    // Idempotent fetch-or-create to prevent duplicate users on concurrent requests
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const username = clerkUser.username || email.split('@')[0] || `user_${clerkId.slice(-8)}`;

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        // Keep core profile fields in sync with Clerk
        email,
        username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId,
        email,
        username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      },
      select: { id: true, clerkId: true, email: true, role: true, status: true },
    });

    if (user.status !== 'active') {
      throw new ForbiddenError('Account is suspended or banned');
    }

    req.user = {
      clerkId: user.clerkId,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else {
      console.error('Auth error:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}

// Optional auth - continues without user if no token
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    const payload = await verifyToken(token, {
      secretKey: config.clerkSecretKey,
    });

    if (payload && payload.sub) {
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
        select: { id: true, clerkId: true, email: true, role: true, status: true },
      });

      if (user && user.status === 'active') {
        req.user = {
          clerkId: user.clerkId,
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }

    next();
  } catch {
    // Ignore errors in optional auth
    next();
  }
}

// Authorize specific roles
export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { prisma } from '../lib/prisma';
import { ForbiddenError } from '../utils/errors';

export async function requireKyc(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { kycStatus: true },
  });

  if (!user || user.kycStatus !== 'verified') {
    return next(new ForbiddenError('KYC verification required to perform this action'));
  }

  next();
}

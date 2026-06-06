import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const COOKIE_NAME = 'pranya_token';

export function extractToken(req: Request): string | null {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Не авторизован' });
    return;
  }
  try {
    const payload = verifyJwt(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyJwt(token);
      req.userId = payload.userId;
    } catch {
      // ignore — treated as guest
    }
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Не авторизован' });
    return;
  }
  try {
    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Доступ запрещён: нужны права админа' });
      return;
    }
    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}

export const TOKEN_COOKIE_NAME = COOKIE_NAME;

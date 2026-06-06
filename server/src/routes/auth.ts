import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signJwt } from '../lib/jwt.js';
import { env } from '../lib/env.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import { TOKEN_COOKIE_NAME, requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  path: '/',
};

function publicUser(u: { id: number; email: string; name: string; avatar: string | null; role: 'USER' | 'ADMIN' }) {
  return { id: u.id, email: u.email, name: u.name, avatar: u.avatar, role: u.role };
}

// ─── REGISTER ──────────────────────────────────────────────────
authRouter.post('/register', async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().trim().min(1, 'Введите имя').max(100),
      email: z.string().trim().toLowerCase().email('Неверный email'),
      password: z.string().min(6, 'Минимум 6 символов').max(100),
    }).parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) {
      res.status(409).json({ error: 'Этот email уже зарегистрирован' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        avatar: '🌸',
      },
    });

    const token = signJwt({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, cookieOpts);
    res.status(201).json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// ─── LOGIN ─────────────────────────────────────────────────────
authRouter.post('/login', async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().trim().toLowerCase().email('Неверный email'),
      password: z.string().min(1, 'Введите пароль'),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const token = signJwt({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, cookieOpts);
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// ─── LOGOUT ────────────────────────────────────────────────────
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, { ...cookieOpts, maxAge: 0 });
  res.json({ ok: true });
});

// ─── ME ────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

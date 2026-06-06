import { Router } from 'express';
import { z } from 'zod';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const usersRouter = Router();

function shapeUser(u: {
  id: number; email: string; name: string; avatar: string | null;
  role: UserRole; createdAt: Date;
  _count?: { orders: number };
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    createdAt: u.createdAt,
    ordersCount: u._count?.orders ?? 0,
  };
}

// GET /api/users — все пользователи (admin)
usersRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { orders: true } } },
    });
    res.json(users.map(shapeUser));
  } catch (e) {
    next(e);
  }
});

// PATCH /api/users/:id — сменить роль/имя (admin)
usersRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = z.object({
      role: z.nativeEnum(UserRole).optional(),
      name: z.string().trim().min(1).max(100).optional(),
    }).parse(req.body);

    // Защита: нельзя снять с себя роль ADMIN, иначе можно случайно остаться без админа
    if (input.role && input.role !== 'ADMIN' && req.userId === id) {
      res.status(400).json({ error: 'Нельзя снять с себя роль администратора' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: input,
      include: { _count: { select: { orders: true } } },
    });
    res.json(shapeUser(updated));
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    next(e);
  }
});

// DELETE /api/users/:id (admin)
usersRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    if (req.userId === id) {
      res.status(400).json({ error: 'Нельзя удалить самого себя' });
      return;
    }
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(409).json({ error: 'Нельзя удалить: у пользователя есть заказы' });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    next(e);
  }
});

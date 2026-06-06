import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const contactRouter = Router();

const inputSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя').max(100),
  email: z.string().trim().toLowerCase().email('Неверный email').max(255),
  message: z.string().trim().min(5, 'Минимум 5 символов').max(5000),
});

// POST /api/contact — публичная отправка сообщения
contactRouter.post('/', async (req, res, next) => {
  try {
    const input = inputSchema.parse(req.body);
    const created = await prisma.contactMessage.create({ data: input });
    res.status(201).json({ id: created.id, ok: true });
  } catch (e) {
    next(e);
  }
});

// GET /api/contact (admin) — список + счётчик непрочитанных
contactRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const [messages, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);
    res.json({ messages, unreadCount });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/contact/:id (admin) — отметить прочитанным/непрочитанным
contactRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const { isRead } = z.object({ isRead: z.boolean() }).parse(req.body);
    const updated = await prisma.contactMessage.update({ where: { id }, data: { isRead } });
    res.json(updated);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Сообщение не найдено' });
      return;
    }
    next(e);
  }
});

// DELETE /api/contact/:id (admin)
contactRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await prisma.contactMessage.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Сообщение не найдено' });
      return;
    }
    next(e);
  }
});

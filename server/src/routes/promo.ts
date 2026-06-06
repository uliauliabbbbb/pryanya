import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const promoRouter = Router();

const promoInputSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(50),
  discount: z.coerce.number().min(0).max(1),
  isActive: z.boolean().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

function shape(p: {
  code: string; discount: { toString(): string };
  isActive: boolean; validUntil: Date | null;
}) {
  return {
    code: p.code,
    discount: Number(p.discount),
    isActive: p.isActive,
    validUntil: p.validUntil,
  };
}

// GET /api/promo/:code/check — публичная проверка кода
promoRouter.get('/:code/check', async (req, res, next) => {
  try {
    const code = z.string().trim().toUpperCase().min(1).max(50).parse(req.params.code);
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) {
      res.status(404).json({ error: 'Промокод не найден или неактивен' });
      return;
    }
    if (promo.validUntil && promo.validUntil <= new Date()) {
      res.status(404).json({ error: 'Срок действия промокода истёк' });
      return;
    }
    res.json({
      code: promo.code,
      discount: Number(promo.discount),
      validUntil: promo.validUntil,
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/promo — все промокоды (admin)
promoRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const codes = await prisma.promoCode.findMany({ orderBy: { code: 'asc' } });
    res.json(codes.map(shape));
  } catch (e) {
    next(e);
  }
});

// POST /api/promo (admin)
promoRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const input = promoInputSchema.parse(req.body);
    const created = await prisma.promoCode.create({
      data: {
        code: input.code,
        discount: new Prisma.Decimal(input.discount),
        isActive: input.isActive ?? true,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
      },
    });
    res.status(201).json(shape(created));
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      res.status(409).json({ error: 'Промокод с таким кодом уже существует' });
      return;
    }
    next(e);
  }
});

// PATCH /api/promo/:code (admin) — обновить (без смены кода)
promoRouter.patch('/:code', requireAdmin, async (req, res, next) => {
  try {
    const code = z.string().trim().toUpperCase().min(1).max(50).parse(req.params.code);
    const input = promoInputSchema.omit({ code: true }).partial().parse(req.body);
    const updated = await prisma.promoCode.update({
      where: { code },
      data: {
        ...(input.discount !== undefined && { discount: new Prisma.Decimal(input.discount) }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.validUntil !== undefined && {
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
        }),
      },
    });
    res.json(shape(updated));
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Промокод не найден' });
      return;
    }
    next(e);
  }
});

// DELETE /api/promo/:code (admin)
promoRouter.delete('/:code', requireAdmin, async (req, res, next) => {
  try {
    const code = z.string().trim().toUpperCase().min(1).max(50).parse(req.params.code);
    await prisma.promoCode.delete({ where: { code } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Промокод не найден' });
      return;
    }
    next(e);
  }
});

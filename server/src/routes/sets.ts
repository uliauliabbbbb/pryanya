import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const setsRouter = Router();

const setItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().positive(),
});

const setInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  count: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().positive().nullable().optional(),
  description: z.string().trim().min(1),
  photo: z.string().trim().max(255).nullable().optional(),
  isFeatured: z.boolean().optional(),
  items: z.array(setItemSchema).min(1, 'Должен быть хотя бы один товар').optional(),
});

function shapeSet(s: {
  id: number; name: string; count: number;
  price: { toString(): string }; oldPrice: { toString(): string } | null;
  description: string; photo: string | null; isFeatured: boolean;
  items: Array<{ productId: number; qty: number }>;
}) {
  return {
    id: s.id,
    name: s.name,
    count: s.count,
    price: Number(s.price),
    oldPrice: s.oldPrice === null ? null : Number(s.oldPrice),
    description: s.description,
    photo: s.photo,
    isFeatured: s.isFeatured,
    items: s.items,
  };
}

setsRouter.get('/', async (_req, res, next) => {
  try {
    const sets = await prisma.set.findMany({
      include: { items: true },
      orderBy: { id: 'asc' },
    });
    res.json(sets.map(s => shapeSet(s)));
  } catch (e) {
    next(e);
  }
});

setsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const input = setInputSchema.parse(req.body);
    const items = input.items ?? [];
    const created = await prisma.set.create({
      data: {
        name: input.name,
        count: input.count,
        price: new Prisma.Decimal(input.price),
        oldPrice: input.oldPrice == null ? null : new Prisma.Decimal(input.oldPrice),
        description: input.description,
        photo: input.photo ?? null,
        isFeatured: input.isFeatured ?? false,
        items: { create: items.map(i => ({ productId: i.productId, qty: i.qty })) },
      },
      include: { items: true },
    });
    res.status(201).json(shapeSet(created));
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(400).json({ error: 'Один из товаров в составе не существует' });
      return;
    }
    next(e);
  }
});

setsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = setInputSchema.partial().parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      if (input.items !== undefined) {
        await tx.setItem.deleteMany({ where: { setId: id } });
        if (input.items.length > 0) {
          await tx.setItem.createMany({
            data: input.items.map(i => ({ setId: id, productId: i.productId, qty: i.qty })),
          });
        }
      }
      return tx.set.update({
        where: { id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.count !== undefined && { count: input.count }),
          ...(input.price !== undefined && { price: new Prisma.Decimal(input.price) }),
          ...(input.oldPrice !== undefined && {
            oldPrice: input.oldPrice == null ? null : new Prisma.Decimal(input.oldPrice),
          }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.photo !== undefined && { photo: input.photo }),
          ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        },
        include: { items: true },
      });
    });

    res.json(shapeSet(updated));
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(400).json({ error: 'Один из товаров в составе не существует' });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Сет не найден' });
      return;
    }
    next(e);
  }
});

setsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await prisma.set.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(409).json({ error: 'Нельзя удалить: сет используется в заказах' });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Сет не найден' });
      return;
    }
    next(e);
  }
});

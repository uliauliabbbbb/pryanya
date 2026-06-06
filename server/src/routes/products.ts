import { Router } from 'express';
import { z } from 'zod';
import { BadgeType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const productsRouter = Router();

const BADGE_RU: Record<string, string> = {
  HIT: 'Хит',
  NEW: 'Новинка',
  SEASONAL: 'Сезонный',
  PREMIUM: 'Премиум',
};

const BADGE_FROM_RU: Record<string, BadgeType> = {
  'Хит':      BadgeType.HIT,
  'Новинка':  BadgeType.NEW,
  'Сезонный': BadgeType.SEASONAL,
  'Премиум':  BadgeType.PREMIUM,
};

const productInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().positive().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  photo: z.string().trim().min(1).max(255),
  badge: z.enum(['Хит', 'Новинка', 'Сезонный', 'Премиум']).nullable().optional(),
  description: z.string().trim().min(1),
  brandBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'HEX-цвет вида #RRGGBB'),
  brandIsDark: z.boolean().optional(),
});

function shapeProduct(p: {
  id: number; name: string; price: { toString(): string }; oldPrice: { toString(): string } | null;
  photo: string; badge: string | null; description: string;
  brandBg: string; brandIsDark: boolean;
  ratingAvg: { toString(): string }; reviewsCount: number;
  category: { id: number; name: string; slug: string };
  ingredients?: Array<{ ingredient: { name: string } }>;
}) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    oldPrice: p.oldPrice === null ? null : Number(p.oldPrice),
    photo: p.photo,
    badge: p.badge ? BADGE_RU[p.badge] : null,
    description: p.description,
    brandBg: p.brandBg,
    brandIsDark: p.brandIsDark,
    ratingAvg: Number(p.ratingAvg),
    reviewsCount: p.reviewsCount,
    category: p.category,
    ingredients: p.ingredients?.map(pi => pi.ingredient.name),
  };
}

// GET /api/products
productsRouter.get('/', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    res.json(products.map(p => shapeProduct(p)));
  } catch (e) {
    next(e);
  }
});

// GET /api/products/:id
productsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        ingredients: {
          include: { ingredient: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!product) {
      res.status(404).json({ error: 'Пряник не найден' });
      return;
    }
    res.json(shapeProduct(product));
  } catch (e) {
    next(e);
  }
});

// GET /api/products/:id/related
productsRouter.get('/:id/related', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: 'Не найдено' });
      return;
    }
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: id } },
      include: { category: true },
      take: 4,
    });
    res.json(related.map(p => shapeProduct(p)));
  } catch (e) {
    next(e);
  }
});

// ─── ADMIN: CRUD ────────────────────────────────────────────────

// POST /api/products — создать пряник (admin)
productsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const input = productInputSchema.parse(req.body);
    const created = await prisma.product.create({
      data: {
        name: input.name,
        price: new Prisma.Decimal(input.price),
        oldPrice: input.oldPrice == null ? null : new Prisma.Decimal(input.oldPrice),
        categoryId: input.categoryId,
        photo: input.photo,
        badge: input.badge ? BADGE_FROM_RU[input.badge] : null,
        description: input.description,
        brandBg: input.brandBg,
        brandIsDark: input.brandIsDark ?? false,
      },
      include: { category: true },
    });
    res.status(201).json(shapeProduct(created));
  } catch (e) {
    next(e);
  }
});

// PATCH /api/products/:id — обновить пряник (admin)
productsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = productInputSchema.partial().parse(req.body);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.price !== undefined && { price: new Prisma.Decimal(input.price) }),
        ...(input.oldPrice !== undefined && {
          oldPrice: input.oldPrice == null ? null : new Prisma.Decimal(input.oldPrice),
        }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.photo !== undefined && { photo: input.photo }),
        ...(input.badge !== undefined && {
          badge: input.badge ? BADGE_FROM_RU[input.badge] : null,
        }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.brandBg !== undefined && { brandBg: input.brandBg }),
        ...(input.brandIsDark !== undefined && { brandIsDark: input.brandIsDark }),
      },
      include: { category: true },
    });
    res.json(shapeProduct(updated));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/products/:id (admin)
productsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(409).json({
        error: 'Нельзя удалить: пряник используется в наборах или заказах',
      });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Пряник не найден' });
      return;
    }
    next(e);
  }
});

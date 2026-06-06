import { Router } from 'express';
import { z } from 'zod';
import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

const itemSchema = z.object({
  kind: z.enum(['product', 'set']),
  refId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().positive(),
});

const orderInputSchema = z.object({
  items: z.array(itemSchema).min(1, 'Корзина пустая'),
  promoCode: z.string().trim().toUpperCase().nullable().optional(),
  notes: z.string().max(1000).optional().nullable(),
  address: z.object({
    city: z.string().trim().min(1),
    street: z.string().trim().min(1),
    building: z.string().trim().min(1),
    apartment: z.string().trim().optional().nullable(),
    postalCode: z.string().trim().optional().nullable(),
  }).optional(),
});

// POST /api/orders — оформить заказ из корзины
ordersRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const input = orderInputSchema.parse(req.body);
    const userId = req.userId!;

    // Подтянуть продукты и сеты целиком (для snapshot)
    const productIds = input.items.filter(i => i.kind === 'product').map(i => i.refId);
    const setIds = input.items.filter(i => i.kind === 'set').map(i => i.refId);

    const [products, sets] = await Promise.all([
      productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } } }) : [],
      setIds.length ? prisma.set.findMany({ where: { id: { in: setIds } } }) : [],
    ]);

    const productMap = new Map(products.map(p => [p.id, p]));
    const setMap     = new Map(sets.map(s => [s.id, s]));

    let subtotal = new Prisma.Decimal(0);
    const orderItems = input.items.map(it => {
      if (it.kind === 'product') {
        const p = productMap.get(it.refId);
        if (!p) throw Object.assign(new Error(`Пряник #${it.refId} не найден`), { status: 400 });
        subtotal = subtotal.plus(p.price.times(it.qty));
        return {
          productId: p.id,
          setId: null,
          nameSnap: p.name,
          priceSnap: p.price,
          photoSnap: p.photo,
          qty: it.qty,
        };
      } else {
        const s = setMap.get(it.refId);
        if (!s) throw Object.assign(new Error(`Сет #${it.refId} не найден`), { status: 400 });
        subtotal = subtotal.plus(s.price.times(it.qty));
        return {
          productId: null,
          setId: s.id,
          nameSnap: s.name,
          priceSnap: s.price,
          photoSnap: s.photo,
          qty: it.qty,
        };
      }
    });

    // Применить промокод если есть
    let discount = new Prisma.Decimal(0);
    let promoCode: string | null = null;
    if (input.promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode } });
      if (promo?.isActive && (!promo.validUntil || promo.validUntil > new Date())) {
        discount = subtotal.times(promo.discount).toDecimalPlaces(2);
        promoCode = promo.code;
      }
    }

    const total = subtotal.minus(discount);

    // Создать (опционально) адрес и заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      let addressId: number | null = null;
      if (input.address) {
        const a = await tx.address.create({
          data: {
            userId,
            city:        input.address.city,
            street:      input.address.street,
            building:    input.address.building,
            apartment:   input.address.apartment ?? null,
            postalCode:  input.address.postalCode ?? null,
          },
        });
        addressId = a.id;
      }

      return tx.order.create({
        data: {
          userId,
          subtotal,
          discount,
          total,
          promoCode,
          addressId,
          notes: input.notes ?? null,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    res.status(201).json({
      id: order.id,
      formattedId: `#PR-${String(order.id).padStart(4, '0')}`,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        id: i.id,
        name: i.nameSnap,
        price: Number(i.priceSnap),
        photo: i.photoSnap,
        qty: i.qty,
      })),
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/orders — история заказов текущего юзера
ordersRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId! },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(
      orders.map(o => ({
        id: o.id,
        formattedId: `#PR-${String(o.id).padStart(4, '0')}`,
        total: Number(o.total),
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        status: o.status,
        createdAt: o.createdAt,
        itemsCount: o.items.reduce((s, i) => s + i.qty, 0),
      }))
    );
  } catch (e) {
    next(e);
  }
});

// ─── ADMIN ──────────────────────────────────────────────────────

// GET /api/orders/all — все заказы (admin)
ordersRouter.get('/all', requireAdmin, async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { id: true, email: true, name: true } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(
      orders.map(o => ({
        id: o.id,
        formattedId: `#PR-${String(o.id).padStart(4, '0')}`,
        status: o.status,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        total: Number(o.total),
        promoCode: o.promoCode,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        user: o.user,
        address: o.address,
        items: o.items.map(i => ({
          id: i.id,
          name: i.nameSnap,
          price: Number(i.priceSnap),
          photo: i.photoSnap,
          qty: i.qty,
          productId: i.productId,
          setId: i.setId,
        })),
      }))
    );
  } catch (e) {
    next(e);
  }
});

// PATCH /api/orders/:id/status — сменить статус (admin)
ordersRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const { status } = z.object({
      status: z.nativeEnum(OrderStatus),
    }).parse(req.body);

    const updated = await prisma.order.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    res.json({
      id: updated.id,
      formattedId: `#PR-${String(updated.id).padStart(4, '0')}`,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Заказ не найден' });
      return;
    }
    next(e);
  }
});

// DELETE /api/orders/:id (admin)
ordersRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await prisma.order.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Заказ не найден' });
      return;
    }
    next(e);
  }
});

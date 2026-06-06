import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

export const categoriesRouter = Router();

const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
  slug: z.string().trim().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug: a-z, 0-9, дефис'),
});

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

categoriesRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const input = categoryInputSchema.parse(req.body);
    const created = await prisma.category.create({ data: input });
    res.status(201).json(created);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      res.status(409).json({ error: 'Категория с таким name или slug уже есть' });
      return;
    }
    next(e);
  }
});

categoriesRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = categoryInputSchema.partial().parse(req.body);
    const updated = await prisma.category.update({ where: { id }, data: input });
    res.json(updated);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      res.status(409).json({ error: 'Категория с таким name или slug уже есть' });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Категория не найдена' });
      return;
    }
    next(e);
  }
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      res.status(409).json({ error: 'Нельзя удалить: в категории есть товары' });
      return;
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      res.status(404).json({ error: 'Категория не найдена' });
      return;
    }
    next(e);
  }
});

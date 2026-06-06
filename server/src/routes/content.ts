import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const contentRouter = Router();

contentRouter.get('/faq', async (_req, res, next) => {
  try {
    const items = await prisma.faqItem.findMany({ orderBy: { position: 'asc' } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

contentRouter.get('/team', async (_req, res, next) => {
  try {
    const items = await prisma.teamMember.findMany({ orderBy: { position: 'asc' } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

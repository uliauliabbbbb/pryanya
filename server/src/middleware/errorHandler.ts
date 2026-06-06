import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Ошибка валидации',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Запись уже существует', meta: err.meta });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Не найдено' });
      return;
    }
  }

  console.error('[errorHandler]', err);
  const status = (err as { status?: number }).status ?? 500;
  const message = (err as { message?: string }).message ?? 'Внутренняя ошибка сервера';
  res.status(status).json({ error: message });
};

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './lib/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter } from './routes/categories.js';
import { setsRouter } from './routes/sets.js';
import { ordersRouter } from './routes/orders.js';
import { contentRouter } from './routes/content.js';
import { usersRouter } from './routes/users.js';
import { promoRouter } from './routes/promo.js';
import { uploadRouter } from './routes/upload.js';
import { contactRouter } from './routes/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// За HTTPS-прокси (Render). Нужно, чтобы secure-cookie выставлялись корректно.
app.set('trust proxy', 1);

app.use(cors({
  origin: env.clientOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth',       authRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sets',       setsRouter);
app.use('/api/orders',     ordersRouter);
app.use('/api/content',    contentRouter);
app.use('/api/users',      usersRouter);
app.use('/api/promo',      promoRouter);
app.use('/api/upload',     uploadRouter);
app.use('/api/contact',    contactRouter);

// Раздача загруженных файлов
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 404 только для несуществующих API-маршрутов
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint не найден' });
});

// В продакшене Express отдаёт собранный фронтенд (client/dist).
// Любой не-API маршрут возвращает index.html, дальнейшую маршрутизацию
// берёт на себя React Router в браузере.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Сервер на http://localhost:${env.port} (${env.nodeEnv})`);
  console.log(`   CORS: ${env.clientOrigin}`);
});

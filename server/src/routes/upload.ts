import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// server/src/routes -> server/uploads
const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const PRODUCTS_DIR = path.join(UPLOAD_ROOT, 'products');
if (!existsSync(PRODUCTS_DIR)) mkdirSync(PRODUCTS_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
]);
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRODUCTS_DIR),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = randomBytes(8).toString('hex') + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const extOk  = ALLOWED_EXT.has(path.extname(file.originalname).toLowerCase());
    const mimeOk = ALLOWED_MIME.has(file.mimetype);
    if (!extOk || !mimeOk) {
      cb(new Error('Допустимы только изображения (png/jpg/webp/gif/svg)'));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

// POST /api/upload/product-photo  (multipart/form-data, поле `file`)
uploadRouter.post('/product-photo', requireAdmin, (req, res, next) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
      res.status(400).json({ error: msg });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'Файл не передан (поле `file`)' });
      return;
    }
    const publicPath = `/uploads/products/${req.file.filename}`;
    res.status(201).json({ path: publicPath, size: req.file.size });
    next;
  });
});

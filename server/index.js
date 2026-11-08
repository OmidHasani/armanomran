import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { ensureAdmin } from './bootstrap.js';
import { connectDb, safeError } from './db.js';
import { api } from './routes.js';
import { AppError } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

await connectDb();
await ensureAdmin();

const app = express();
const publicDir = path.join(__dirname, '../public');
const fontDir = path.join(__dirname, '../node_modules/@fontsource/vazirmatn/files');

app.set('trust proxy', 1);
app.disable('x-powered-by');
const httpsOnly = process.env.COOKIE_SECURE === 'true';
app.use(helmet({
  strictTransportSecurity: httpsOnly,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: httpsOnly ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(session({
  name: 'arman.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: mongoose.connection.name,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 14,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
}));

app.use('/api', api);
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'مسیر پیدا نشد' });
});
app.use('/fonts', express.static(path.join(publicDir, 'fonts'), { maxAge: '30d' }));
app.use('/fonts', express.static(fontDir, { maxAge: '30d', fallthrough: false }));

app.get(['/admin', '/admin/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});
app.use('/admin', express.static(path.join(publicDir, 'admin'), {
  etag: true,
  index: false,
  setHeaders(res, filePath) {
    if (/\.(html|js|css)$/.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
  },
}));

app.use(express.static(publicDir, {
  etag: true,
  setHeaders(res, filePath) {
    if (/\.(html|js|css)$/.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
  },
}));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err instanceof AppError ? err.status : (err.status || 500);
  if (status >= 500) console.error(safeError(err));
  res.status(status).json({
    message: status >= 500 ? 'خطای داخلی سرور' : err.message,
    version: err.version,
  });
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const server = app.listen(port, host, () => {
  console.log(`Arman CRM listening on ${host}:${port}`);
});

function shutdown() {
  server.close(() => {
    mongoose.disconnect().finally(() => process.exit(0));
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

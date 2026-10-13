import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes.ts';
import productRoutes from './server/routes/productRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import walletRoutes from './server/routes/walletRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import shopRoutes from './server/routes/shopRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import { loadDatabase } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB
loadDatabase();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/notifications', notificationRoutes);

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'JK Mission Nepal',
    domain: 'www.jkmissionnp.com',
    currency: 'NPR',
    country: 'Nepal',
    timezone: 'Asia/Kathmandu',
    timestamp: new Date().toISOString()
  });
});

// Explicit JSON 404 handler for any unhandled /api/* requests so they NEVER fall through to Vite index.html
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.method} ${req.originalUrl} not found` });
});

// Express error handler for /api routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Server Error]:', err);
  if (req.originalUrl.startsWith('/api')) {
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  } else {
    next(err);
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JK Mission Nepal] Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start JK Mission server:', err);
});

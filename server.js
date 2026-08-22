import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { runSeed } from './database/seed.js';
import { getLocalStore } from './config/database.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import stopsRoutes from './routes/stops.routes.js';
import activitiesRoutes from './routes/activities.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import communityRoutes from './routes/community.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GlobeTrotter API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', stopsRoutes);
app.use('/api', activitiesRoutes);
app.use('/api', catalogRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Auto-seed if database is brand new
async function initializeServer() {
  const store = getLocalStore();
  if (!store.users || store.users.length === 0) {
    console.log('Database is empty, triggering automatic seeding...');
    await runSeed();
  }

  app.listen(PORT, () => {
    console.log(`🚀 GlobeTrotter Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
}

initializeServer().catch(err => {
  console.error('Failed to initialize server:', err);
});

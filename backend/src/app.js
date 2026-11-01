import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';

export const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  // P0001 = RAISE EXCEPTION en Triggers/Procedures | 23514 = Violación de CHECK (ej. stock < 0) | 23505 = UNIQUE duplicado
  if (['P0001', '23514', '23505', '23503'].includes(error.code)) {
    return res.status(400).json({ error: error.message });
  }
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Error interno del servidor.' });
});
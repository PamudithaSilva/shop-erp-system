import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// ── Test route ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '✅ Shop ERP API is running!' });
});

// ── Start ──
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
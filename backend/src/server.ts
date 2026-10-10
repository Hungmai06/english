import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Global Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'English Learning Platform API',
    version: '2.0.0',
  });
});

// Mount API v1 Specification Routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint ${req.originalUrl} was not found on this server`,
    },
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` LinguaCore Backend API Service v2.0`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` API Base:   http://localhost:${PORT}/api/v1`);
  console.log(` Health:     http://localhost:${PORT}/health`);
  console.log(`=================================================`);
});

export default app;

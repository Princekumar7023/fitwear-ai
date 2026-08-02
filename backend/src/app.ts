import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { wardrobeRouter } from './routes/wardrobe.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

// Configure CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// High body size limit for base64 images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Register routes
app.use(wardrobeRouter);

// Global Error Handler
app.use(errorHandler);

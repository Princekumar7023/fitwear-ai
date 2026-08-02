import { Router } from 'express';
import { handleWardrobeGenerate } from '../controllers/wardrobe.controller.js';

export const wardrobeRouter = Router();

wardrobeRouter.post('/api/wardrobe', handleWardrobeGenerate);

wardrobeRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

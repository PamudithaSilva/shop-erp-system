import { Response } from 'express';
import InventoryMovement from '../models/InventoryMovement';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';

export const listInventoryMovements = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = typeof req.query.product === 'string' ? req.query.product : undefined;
  const limitValue = Number(req.query.limit);
  const limit = Number.isInteger(limitValue) ? Math.min(Math.max(limitValue, 1), 200) : 100;

  const movements = await InventoryMovement.find(product ? { product } : {})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'name sku unit')
    .populate('createdBy', 'name');

  res.json({ success: true, data: movements });
});

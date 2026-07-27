import { Response } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Product from '../models/Product';
import InventoryMovement from '../models/InventoryMovement';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';

export const listSales = catchAsync(async (_req: AuthRequest, res: Response) => {
  const sales = await Sale.find().populate('customer', 'name').sort({ createdAt: -1 });
  res.json(sales);
});

export const createSale = catchAsync(async (req: AuthRequest, res: Response) => {
  const { customer, items, discount = 0 } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Add at least one item' });
  const session = await mongoose.startSession();
  try {
    let sale: any;
    await session.withTransaction(async () => {
      const normalizedItems = [];
      const stockMovements: Array<{
        product: mongoose.Types.ObjectId;
        type: 'sale';
        quantityChange: number;
        stockBefore: number;
        stockAfter: number;
        createdBy: mongoose.Types.ObjectId;
      }> = [];
      for (const item of items) {
        const quantity = Number(item.quantity);
        const product = await Product.findOne({ _id: item.productId, isActive: true }).session(session);
        if (!product) throw new Error('One of the selected products no longer exists');
        if (!Number.isFinite(quantity) || quantity < 1) throw new Error('Quantity must be at least 1');
        if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
        const stockBefore = product.stock;
        product.stock -= quantity;
        await product.save({ session });
        stockMovements.push({
          product: product._id,
          type: 'sale',
          quantityChange: -quantity,
          stockBefore,
          stockAfter: product.stock,
          createdBy: req.user!._id,
        });
        normalizedItems.push({ product: product._id, productName: product.name, quantity, unitPrice: product.price, total: product.price * quantity });
      }
      const subtotal = normalizedItems.reduce((total, item) => total + item.total, 0);
      const numericDiscount = Number(discount) || 0;
      if (numericDiscount < 0 || numericDiscount > subtotal) throw new Error('Discount must be between zero and the subtotal');
      [sale] = await Sale.create([{ customer: customer || undefined, items: normalizedItems, subtotal, discount: numericDiscount, totalAmount: subtotal - numericDiscount, createdBy: req.user!._id }], { session });
      await InventoryMovement.create(stockMovements.map((movement) => ({
        ...movement,
        reference: sale._id,
        referenceType: 'Sale' as const,
      })), { session });
    });
    res.status(201).json(await sale.populate('customer', 'name'));
  } finally { await session.endSession(); }
});

export const refundSale = catchAsync(async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  try {
    let sale: any;
    await session.withTransaction(async () => {
      sale = await Sale.findById(req.params.id).session(session);
      if (!sale) throw Object.assign(new Error('Sale not found'), { statusCode: 404 });
      if (sale.status === 'refunded') throw new Error('Sale has already been refunded');
      for (const item of sale.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error(`Product from sale ${sale.saleNumber} no longer exists`);
        const stockBefore = product.stock;
        product.stock += item.quantity;
        await product.save({ session });
        await InventoryMovement.create([{
          product: product._id,
          type: 'refund',
          quantityChange: item.quantity,
          stockBefore,
          stockAfter: product.stock,
          reference: sale._id,
          referenceType: 'Sale',
          createdBy: req.user!._id,
        }], { session });
      }
      sale.status = 'refunded'; await sale.save({ session });
    });
    res.json(sale);
  } finally { await session.endSession(); }
});

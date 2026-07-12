import { Response } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Product from '../models/Product';
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
      for (const item of items) {
        const quantity = Number(item.quantity);
        const product = await Product.findOne({ _id: item.productId, isActive: true }).session(session);
        if (!product) throw new Error('One of the selected products no longer exists');
        if (!Number.isFinite(quantity) || quantity < 1) throw new Error('Quantity must be at least 1');
        if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
        product.stock -= quantity;
        await product.save({ session });
        normalizedItems.push({ product: product._id, productName: product.name, quantity, unitPrice: product.price, total: product.price * quantity });
      }
      const subtotal = normalizedItems.reduce((total, item) => total + item.total, 0);
      const numericDiscount = Number(discount) || 0;
      if (numericDiscount < 0 || numericDiscount > subtotal) throw new Error('Discount must be between zero and the subtotal');
      [sale] = await Sale.create([{ customer: customer || undefined, items: normalizedItems, subtotal, discount: numericDiscount, totalAmount: subtotal - numericDiscount, createdBy: req.user!._id }], { session });
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
      for (const item of sale.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
      sale.status = 'refunded'; await sale.save({ session });
    });
    res.json(sale);
  } finally { await session.endSession(); }
});

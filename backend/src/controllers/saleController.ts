import { Response } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale';
import Product from '../models/Product';
import InventoryMovement from '../models/InventoryMovement';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const listSales = catchAsync(async (_req: AuthRequest, res: Response) => {
  const sales = await Sale.find().populate('customer', 'name').sort({ createdAt: -1 });
  res.json(sales);
});

export const createSale = catchAsync(async (req: AuthRequest, res: Response) => {
  const { customer, items, discount = 0 } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw new AppError('Add at least one item');

  const quantitiesByProduct = new Map<string, number>();
  for (const item of items) {
    const productId = typeof item?.productId === 'string' ? item.productId : '';
    const quantity = Number(item?.quantity);
    if (!mongoose.isObjectIdOrHexString(productId)) throw new AppError('Each sale item must have a valid product');
    if (!Number.isFinite(quantity) || quantity < 1) throw new AppError('Quantity must be at least 1');
    quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + quantity);
  }
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
      for (const [productId, quantity] of quantitiesByProduct) {
        const product = await Product.findOne({ _id: productId, isActive: true }).session(session);
        if (!product) throw new AppError('One of the selected products no longer exists', 404);
        if (product.stock < quantity) throw new AppError(`Insufficient stock for ${product.name}`);
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
      if (!Number.isFinite(numericDiscount) || numericDiscount < 0 || numericDiscount > subtotal) throw new AppError('Discount must be between zero and the subtotal');
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
      if (!sale) throw new AppError('Sale not found', 404);
      if (sale.status === 'refunded') throw new AppError('Sale has already been refunded');
      for (const item of sale.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new AppError(`Product from sale ${sale.saleNumber} no longer exists`, 404);
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

import { Response } from 'express';
import mongoose from 'mongoose';
import PurchaseOrder, { PurchaseOrderStatus } from '../models/PurchaseOrder';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import InventoryMovement from '../models/InventoryMovement';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const populateOrder = (order: any) => order.populate('supplier', 'name').populate('items.product', 'name sku unit');

export const listPurchaseOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const validStatuses: PurchaseOrderStatus[] = ['draft', 'ordered', 'partially_received', 'received', 'cancelled'];
  if (status && !validStatuses.includes(status as PurchaseOrderStatus)) throw new AppError('Invalid purchase order status');
  res.json(await PurchaseOrder.find(status ? { status: status as PurchaseOrderStatus } : {}).sort({ createdAt: -1 }).populate('supplier', 'name').populate('items.product', 'name sku unit'));
});

export const createPurchaseOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { supplier, items, expectedDate, notes, status = 'draft' } = req.body;
  if (!mongoose.isObjectIdOrHexString(supplier) || !await Supplier.exists({ _id: supplier })) throw new AppError('Select a valid supplier');
  if (!Array.isArray(items) || !items.length) throw new AppError('Add at least one item');
  if (!['draft', 'ordered'].includes(status)) throw new AppError('New orders can only be draft or ordered');
  const productIds = items.map((item: any) => item?.productId);
  if (productIds.some((id: unknown) => !mongoose.isObjectIdOrHexString(id)) || new Set(productIds).size !== productIds.length) throw new AppError('Each item must be a unique valid product');
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  if (products.length !== productIds.length) throw new AppError('One or more products are unavailable', 404);
  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const normalizedItems = items.map((item: any) => {
    const quantity = Number(item.quantity), unitCost = Number(item.unitCost);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(unitCost) || unitCost < 0) throw new AppError('Quantities and unit costs must be valid');
    const product = productMap.get(item.productId)!;
    return { product: product._id, productName: product.name, orderedQuantity: quantity, receivedQuantity: 0, unitCost, total: quantity * unitCost };
  });
  const order = await PurchaseOrder.create({ supplier, items: normalizedItems, subtotal: normalizedItems.reduce((sum, item) => sum + item.total, 0), expectedDate: expectedDate || undefined, notes, status, createdBy: req.user!._id });
  res.status(201).json(await populateOrder(order));
});

export const receivePurchaseOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) throw new AppError('Enter at least one received quantity');
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!mongoose.isObjectIdOrHexString(item?.productId)) throw new AppError('Each received item must be valid');
    const quantity = Number(item.quantity); if (!Number.isFinite(quantity) || quantity < 0) throw new AppError('Received quantities cannot be negative');
    quantities.set(item.productId, quantity);
  }
  const session = await mongoose.startSession();
  try {
    let order: any;
    await session.withTransaction(async () => {
      order = await PurchaseOrder.findById(req.params.id).session(session);
      if (!order) throw new AppError('Purchase order not found', 404);
      if (!['ordered', 'partially_received'].includes(order.status)) throw new AppError('Only sent purchase orders can be received');
      const orderProductIds = new Set(order.items.map((item: any) => String(item.product)));
      if ([...quantities.keys()].some((productId) => !orderProductIds.has(productId))) throw new AppError('A received product is not part of this order');
      if (![...quantities.values()].some((quantity) => quantity > 0)) throw new AppError('Enter a quantity greater than zero');
      for (const item of order.items) {
        const quantity = quantities.get(String(item.product)) || 0; if (!quantity) continue;
        if (quantity > item.orderedQuantity - item.receivedQuantity) throw new AppError(`Received quantity exceeds remaining quantity for ${item.productName}`);
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new AppError(`Product ${item.productName} no longer exists`, 404);
        const stockBefore = product.stock; product.stock += quantity; await product.save({ session }); item.receivedQuantity += quantity;
        await InventoryMovement.create([{ product: product._id, type: 'purchase_receipt', quantityChange: quantity, stockBefore, stockAfter: product.stock, reference: order._id, referenceType: 'PurchaseOrder', note: `Received on ${order.orderNumber}`, createdBy: req.user!._id }], { session });
      }
      order.status = order.items.every((item: any) => item.receivedQuantity === item.orderedQuantity) ? 'received' : order.items.some((item: any) => item.receivedQuantity > 0) ? 'partially_received' : 'ordered';
      await order.save({ session });
    });
    res.json(await populateOrder(order));
  } finally { await session.endSession(); }
});

export const updatePurchaseOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const status = req.body.status as PurchaseOrderStatus;
  if (!['draft', 'ordered', 'cancelled'].includes(status)) throw new AppError('Invalid order status');
  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) throw new AppError('Purchase order not found', 404);
  if (order.status === 'received' || order.status === 'partially_received') throw new AppError('Received orders cannot be changed this way');
  order.status = status; await order.save(); res.json(await populateOrder(order));
});

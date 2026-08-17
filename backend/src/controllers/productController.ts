import { Response } from "express";
import Product from "../models/Product";
import InventoryMovement from '../models/InventoryMovement';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from "../utils/catchAsync";

const editableProductFields = [
  'name', 'sku', 'description', 'price', 'costPrice', 'stock', 'minStock', 'unit', 'category', 'supplier',
] as const;

const getEditableProductFields = (body: Record<string, unknown>) =>
  Object.fromEntries(editableProductFields
    .filter((field) => field in body)
    .map((field) => [field, body[field]]));

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sortableProductFields = new Set(['name', 'sku', 'price', 'costPrice', 'stock', 'minStock', 'createdAt', 'updatedAt']);

const getProductSort = (sort: unknown) => {
  if (typeof sort !== 'string') return '-createdAt';
  const field = sort.replace(/^-/, '');
  return sortableProductFields.has(field) ? sort : '-createdAt';
};

export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await Product.create(req.body);
  if (product.stock > 0) {
    await InventoryMovement.create({
      product: product._id,
      type: 'opening_balance',
      quantityChange: product.stock,
      stockBefore: 0,
      stockAfter: product.stock,
      note: 'Opening stock when product was created',
      createdBy: req.user!._id,
    });
  }
  res.status(201).json({ success: true, data: product });
});

export const getProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const { search, category, supplier, lowStock, sort } = req.query;

  const query: Record<string, unknown> = { isActive: true };

  if (typeof search === 'string' && search.trim()) {
    const term = escapeRegex(search.trim());
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { sku: { $regex: term, $options: 'i' } }
    ];
  }

  if (typeof category === 'string' && category.trim()) {
    query.category = category;
  }

  if (typeof supplier === 'string' && supplier.trim()) {
    query.supplier = supplier;
  }

  if (lowStock === 'true') {
    query.$expr = { $lte: ['$stock', '$minStock'] };
  }

  const products = await Product.find(query)
    .sort(getProductSort(sort))
    .populate("category", "name")
    .populate("supplier", "name");
  res.status(200).json({ success: true, data: products });
});

export const getProductById = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("supplier", "name");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, data: product });
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const stockBefore = product.stock;
  const requestedStock = req.body.stock;
  if (requestedStock !== undefined && (!Number.isFinite(Number(requestedStock)) || Number(requestedStock) < 0)) {
    return res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
  }

  product.set(getEditableProductFields(req.body));
  await product.save();

  if (requestedStock !== undefined && product.stock !== stockBefore) {
    await InventoryMovement.create({
      product: product._id,
      type: 'adjustment',
      quantityChange: product.stock - stockBefore,
      stockBefore,
      stockAfter: product.stock,
      note: 'Manual stock adjustment',
      createdBy: req.user!._id,
    });
  }
  res.status(200).json({ success: true, data: product });
});

export const deleteProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, message: "Product deactivated" });
});

export const getLowStockProducts = catchAsync(async (_req: AuthRequest, res: Response) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$minStock"] }
  }).populate("category", "name");

  res.status(200).json({ success: true, data: products });
});

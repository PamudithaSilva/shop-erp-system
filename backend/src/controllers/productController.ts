import { Request, Response } from "express";
import Product from "../models/Product";
import { catchAsync } from "../utils/catchAsync";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { search, category, supplier, lowStock, sort } = req.query;

  const query: Record<string, unknown> = { isActive: true };

  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
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
    .sort(typeof sort === 'string' && sort.trim() ? sort : '-createdAt')
    .populate("category", "name")
    .populate("supplier", "name");
  res.status(200).json({ success: true, data: products });
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("supplier", "name");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, data: product });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  res.status(200).json({ success: true, data: product });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
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

export const getLowStockProducts = catchAsync(async (_req: Request, res: Response) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$minStock"] }
  }).populate("category", "name");

  res.status(200).json({ success: true, data: products });
});
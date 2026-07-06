import { Request, Response } from "express";
import Product from "../models/Product";
import { catchAsync } from "../utils/catchAsync";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await Product.find({ isActive: true })
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
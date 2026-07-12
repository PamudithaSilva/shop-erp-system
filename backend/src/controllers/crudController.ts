import { Model } from 'mongoose';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

export const createCrudController = (model: Model<any>, label: string) => ({
  list: catchAsync(async (_req: Request, res: Response) => {
    const data = await model.find().sort({ createdAt: -1 });
    res.json(data);
  }),
  create: catchAsync(async (req: Request, res: Response) => {
    const data = await model.create(req.body);
    res.status(201).json(data);
  }),
  update: catchAsync(async (req: Request, res: Response) => {
    const data = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ message: `${label} not found` });
    res.json(data);
  }),
  remove: catchAsync(async (req: Request, res: Response) => {
    const data = await model.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: `${label} not found` });
    res.status(204).send();
  }),
});

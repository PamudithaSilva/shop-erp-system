import mongoose, { Document, Schema } from 'mongoose';

export type InventoryMovementType = 'opening_balance' | 'sale' | 'refund' | 'adjustment';

export interface IInventoryMovement extends Document {
  product: mongoose.Types.ObjectId;
  type: InventoryMovementType;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  reference?: mongoose.Types.ObjectId;
  referenceType?: 'Sale';
  note?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  type: { type: String, enum: ['opening_balance', 'sale', 'refund', 'adjustment'], required: true },
  quantityChange: { type: Number, required: true },
  stockBefore: { type: Number, required: true, min: 0 },
  stockAfter: { type: Number, required: true, min: 0 },
  reference: { type: Schema.Types.ObjectId, refPath: 'referenceType' },
  referenceType: { type: String, enum: ['Sale'] },
  note: { type: String, trim: true, maxlength: 500 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

InventoryMovementSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

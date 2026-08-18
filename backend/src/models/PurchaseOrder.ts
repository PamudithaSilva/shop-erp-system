import mongoose, { Document, Schema } from 'mongoose';
import { randomBytes } from 'crypto';

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';

export interface IPurchaseOrder extends Document {
  orderNumber: string;
  supplier: mongoose.Types.ObjectId;
  items: Array<{ product: mongoose.Types.ObjectId; productName: string; orderedQuantity: number; receivedQuantity: number; unitCost: number; total: number }>;
  subtotal: number;
  status: PurchaseOrderStatus;
  expectedDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  orderNumber: { type: String, unique: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, productName: { type: String, required: true },
    orderedQuantity: { type: Number, required: true, min: 1 }, receivedQuantity: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: 0 }, total: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'], default: 'draft' },
  expectedDate: Date, notes: { type: String, trim: true, maxlength: 1000 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

PurchaseOrderSchema.pre('save', async function () {
  if (!this.orderNumber) this.orderNumber = `PO-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
});
export default mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

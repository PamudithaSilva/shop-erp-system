import mongoose, { Document, Schema } from 'mongoose';
import { randomBytes } from 'crypto';

interface SaleItem {
  product:     mongoose.Types.ObjectId;
  productName: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export interface ISale extends Document {
  saleNumber:  string;
  customer:    mongoose.Types.ObjectId;
  items:       SaleItem[];
  subtotal:    number;
  discount:    number;
  totalAmount: number;
  status:      'completed' | 'refunded';
  createdBy:   mongoose.Types.ObjectId;
}

const SaleSchema = new Schema<ISale>({
  saleNumber:  { type: String, unique: true },
  customer:    { type: Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    product:     { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity:    { type: Number, required: true, min: 1 },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
  }],
  subtotal:    { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['completed', 'refunded'], default: 'completed' },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Uses a timestamp and random suffix, avoiding duplicate numbers during concurrent sales.
SaleSchema.pre('save', async function () {
  if (!this.saleNumber) {
    this.saleNumber = `S-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }
});

export default mongoose.model<ISale>('Sale', SaleSchema);

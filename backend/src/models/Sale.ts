import mongoose, { Document, Schema } from 'mongoose';

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

// Auto-generate sale number
SaleSchema.pre('save', async function () {
  if (!this.saleNumber) {
    const count = await mongoose.model('Sale').countDocuments();
    this.saleNumber = `S-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model<ISale>('Sale', SaleSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name:        string;
  sku:         string;
  description: string;
  price:       number;
  costPrice:   number;
  stock:       number;
  minStock:    number;
  unit:        string;
  category:    mongoose.Types.ObjectId;
  supplier:    mongoose.Types.ObjectId;
  isActive:    boolean;
}

const ProductSchema = new Schema<IProduct>({
  name:        { type: String, required: true, trim: true },
  sku:         { type: String, unique: true, sparse: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  costPrice:   { type: Number, default: 0 },
  stock:       { type: Number, default: 0, min: 0 },
  minStock:    { type: Number, default: 5 },
  unit:        { type: String, default: 'pcs' },
  category:    { type: Schema.Types.ObjectId, ref: 'Category' },
  supplier:    { type: Schema.Types.ObjectId, ref: 'Supplier' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);

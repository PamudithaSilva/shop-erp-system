import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name:    string;
  email:   string;
  phone:   string;
  address: string;
}

const SupplierSchema = new Schema<ISupplier>({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, default: '' },
  phone:   { type: String, default: '' },
  address: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);

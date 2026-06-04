import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name:    string;
  email:   string;
  phone:   string;
  address: string;
}

const CustomerSchema = new Schema<ICustomer>({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, default: '' },
  phone:   { type: String, default: '' },
  address: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
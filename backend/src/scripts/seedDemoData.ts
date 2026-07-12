import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db';
import { ensureAdminUser } from '../config/seedAdmin';
import Category from '../models/Category';
import Customer from '../models/Customer';
import Product from '../models/Product';
import Sale from '../models/Sale';
import Supplier from '../models/Supplier';
import User from '../models/User';

dotenv.config();

const demoCategories = [
  { name: 'Beverages', description: 'Tea, coffee, and soft drinks' },
  { name: 'Groceries', description: 'Everyday food essentials' },
  { name: 'Personal Care', description: 'Health and hygiene products' },
];

const demoSuppliers = [
  { name: 'Lanka Distributors', email: 'sales@lankadistributors.demo', phone: '011-555-0101', address: 'Colombo' },
  { name: 'Island Wholesale', email: 'orders@islandwholesale.demo', phone: '011-555-0102', address: 'Kandy' },
];

const demoCustomers = [
  { name: 'Nimal Perera', email: 'nimal.perera@example.demo', phone: '077-123-4567', address: 'Colombo 05' },
  { name: 'Kasun Silva', email: 'kasun.silva@example.demo', phone: '071-234-5678', address: 'Nugegoda' },
  { name: 'Amara Fernando', email: 'amara.fernando@example.demo', phone: '076-345-6789', address: 'Maharagama' },
];

async function seedDemoData(): Promise<void> {
  await connectDB();
  await ensureAdminUser();

  const categories = new Map<string, mongoose.Types.ObjectId>();
  for (const category of demoCategories) {
    const result = await Category.findOneAndUpdate({ name: category.name }, category, { new: true, upsert: true, setDefaultsOnInsert: true });
    categories.set(category.name, result._id);
  }

  const suppliers = new Map<string, mongoose.Types.ObjectId>();
  for (const supplier of demoSuppliers) {
    const result = await Supplier.findOneAndUpdate({ email: supplier.email }, supplier, { new: true, upsert: true, setDefaultsOnInsert: true });
    suppliers.set(supplier.name, result._id);
  }

  const customers = new Map<string, mongoose.Types.ObjectId>();
  for (const customer of demoCustomers) {
    const result = await Customer.findOneAndUpdate({ email: customer.email }, customer, { new: true, upsert: true, setDefaultsOnInsert: true });
    customers.set(customer.name, result._id);
  }

  const productsToSeed = [
    { name: 'Ceylon Black Tea 100g', sku: 'DEMO-TEA-100', price: 450, costPrice: 320, stock: 45, minStock: 10, unit: 'pack', category: categories.get('Beverages'), supplier: suppliers.get('Lanka Distributors') },
    { name: 'Instant Coffee 200g', sku: 'DEMO-COFFEE-200', price: 1250, costPrice: 900, stock: 8, minStock: 10, unit: 'jar', category: categories.get('Beverages'), supplier: suppliers.get('Lanka Distributors') },
    { name: 'Basmati Rice 5kg', sku: 'DEMO-RICE-5KG', price: 1950, costPrice: 1600, stock: 30, minStock: 8, unit: 'bag', category: categories.get('Groceries'), supplier: suppliers.get('Island Wholesale') },
    { name: 'Bath Soap 100g', sku: 'DEMO-SOAP-100', price: 180, costPrice: 120, stock: 60, minStock: 15, unit: 'bar', category: categories.get('Personal Care'), supplier: suppliers.get('Island Wholesale') },
  ];

  const products = new Map<string, { _id: mongoose.Types.ObjectId; name: string; price: number }>();
  for (const product of productsToSeed) {
    const result = await Product.findOneAndUpdate({ sku: product.sku }, product, { new: true, upsert: true, setDefaultsOnInsert: true });
    products.set(product.sku, { _id: result._id, name: result.name, price: result.price });
  }

  const admin = await User.findOne({ email: (process.env.ADMIN_EMAIL || 'admin@shop.com').toLowerCase() });
  if (!admin) throw new Error('Administrator account could not be found');

  const tea = products.get('DEMO-TEA-100')!;
  const rice = products.get('DEMO-RICE-5KG')!;
  const soap = products.get('DEMO-SOAP-100')!;
  const demoSales = [
    {
      saleNumber: 'DEMO-0001', customer: customers.get('Nimal Perera'), createdBy: admin._id,
      items: [{ product: tea._id, productName: tea.name, quantity: 2, unitPrice: tea.price, total: tea.price * 2 }, { product: soap._id, productName: soap.name, quantity: 3, unitPrice: soap.price, total: soap.price * 3 }],
      subtotal: 1440, discount: 40, totalAmount: 1400, status: 'completed',
    },
    {
      saleNumber: 'DEMO-0002', customer: customers.get('Kasun Silva'), createdBy: admin._id,
      items: [{ product: rice._id, productName: rice.name, quantity: 1, unitPrice: rice.price, total: rice.price }],
      subtotal: 1950, discount: 0, totalAmount: 1950, status: 'completed',
    },
  ];

  for (const sale of demoSales) {
    await Sale.updateOne({ saleNumber: sale.saleNumber }, { $setOnInsert: sale }, { upsert: true });
  }

  console.log('Demo data is ready: 3 categories, 2 suppliers, 3 customers, 4 products, and 2 sales.');
}

seedDemoData()
  .catch((error: unknown) => {
    console.error('Could not seed demo data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

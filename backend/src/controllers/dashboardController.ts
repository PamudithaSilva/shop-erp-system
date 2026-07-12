import { Response } from 'express';
import Product from '../models/Product'; import Customer from '../models/Customer'; import Sale from '../models/Sale';
import { catchAsync } from '../utils/catchAsync';
export const getStats = catchAsync(async (_req, res: Response) => {
  const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [totalProducts, totalCustomers, totalSales, lowStockCount, revenue, monthRevenue, monthlySales, recentSales] = await Promise.all([
    Product.countDocuments({ isActive: true }), Customer.countDocuments(), Sale.countDocuments({ status: 'completed' }), Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStock'] } }),
    Sale.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Sale.aggregate([{ $match: { status: 'completed', createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Sale.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            label: { $dateToString: { format: '%b', date: '$createdAt' } },
          },
          revenue: { $sum: '$totalAmount' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: '$_id.label', revenue: 1 } },
    ]),
    Sale.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
  ]);
  res.json({ totalProducts, totalCustomers, totalSales, lowStockCount, totalRevenue: revenue[0]?.total || 0, monthRevenue: monthRevenue[0]?.total || 0, monthlySales, recentSales });
});

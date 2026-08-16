import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowDownTrayIcon, CubeIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Stats {
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  lowStockCount: number;
  totalRevenue: number;
  monthRevenue: number;
  monthlySales: { _id: string; revenue: number }[];
  recentSales: { _id: string; saleNumber: string; customer?: { name: string }; totalAmount: number; status: string }[];
}

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/dashboard/stats').then((response) => setStats(response.data)).catch(() => toast.error('Could not load dashboard'));
  }, []);

  if (!stats) return <div className="flex h-full items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const downloadReport = () => {
    const generatedAt = new Date();
    const summary = [
      ['Shop Report', ''],
      ['Generated at', generatedAt.toISOString()],
      [],
      ['Summary', 'Value'],
      ['Total products', stats.totalProducts],
      ['Total sales', stats.totalSales],
      ['Total customers', stats.totalCustomers],
      ['Low-stock products', stats.lowStockCount],
      ['Total revenue (LKR)', stats.totalRevenue],
      ['This month revenue (LKR)', stats.monthRevenue],
      [],
      ['Monthly revenue', 'Amount (LKR)'],
      ...stats.monthlySales.map((sale) => [sale._id, sale.revenue]),
      [],
      ['Recent sales', 'Customer', 'Amount (LKR)', 'Status'],
      ...stats.recentSales.map((sale) => [sale.saleNumber, sale.customer?.name || 'Walk-in', sale.totalAmount, sale.status]),
    ];
    const contents = summary.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = `shop-report-${generatedAt.toISOString().slice(0, 10)}.csv`;
    download.click();
    URL.revokeObjectURL(url);
    toast.success('Shop report downloaded');
  };

  const kpis = [
    ['Total Products', stats.totalProducts, CubeIcon, 'text-primary', 'bg-primary-faint'],
    ['Total Sales', stats.totalSales, ShoppingBagIcon, 'text-blue-600', 'bg-blue-50'],
    ['Customers', stats.totalCustomers, UsersIcon, 'text-violet-600', 'bg-violet-50'],
    ['Low Stock', stats.lowStockCount, ExclamationTriangleIcon, 'text-red-500', 'bg-red-50'],
  ] as const;

  return <div className="p-6 md:p-8 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-sm text-slate-500">A clear view of your shop performance.</p></div>
      <button className="btn-primary" onClick={downloadReport}><ArrowDownTrayIcon className="w-4 h-4" /> Download Report</button>
    </div>
    <div className="rounded-2xl bg-gradient-to-r from-primary-dark to-primary p-6 text-white shadow-[0_14px_30px_rgba(36,95,169,0.24)] flex justify-between"><div><p className="text-blue-100 text-sm">Total Revenue</p><p className="mt-1 text-3xl font-bold">LKR {stats.totalRevenue.toLocaleString()}</p></div><div className="text-right"><p className="text-blue-100 text-sm">This Month</p><p className="mt-1 text-xl font-semibold">LKR {stats.monthRevenue.toLocaleString()}</p></div></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{kpis.map(([label, value, Icon, color, background]) => <div className="card p-4" key={label}><div className={`w-10 h-10 rounded-xl ${background} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${color}`} /></div><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="card p-5"><h2 className="text-sm font-semibold text-slate-800 mb-4">Monthly Revenue</h2><ResponsiveContainer width="100%" height={200}><BarChart data={stats.monthlySales}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip formatter={(value) => [`LKR ${Number(value || 0).toLocaleString()}`, 'Revenue']} /><Bar dataKey="revenue" fill="#245fa9" /></BarChart></ResponsiveContainer></div><div className="card p-5"><h2 className="text-sm font-semibold text-slate-800 mb-3">Recent Sales</h2><table className="w-full"><thead><tr>{['Sale #', 'Customer', 'Amount', 'Status'].map((heading) => <th className="th !px-0" key={heading}>{heading}</th>)}</tr></thead><tbody>{stats.recentSales.map((sale) => <tr className="border-t border-slate-100" key={sale._id}><td className="py-2 text-xs">{sale.saleNumber}</td><td className="py-2 text-xs">{sale.customer?.name || 'Walk-in'}</td><td className="py-2 text-xs">LKR {sale.totalAmount.toLocaleString()}</td><td><span className={`badge ${sale.status === 'completed' ? 'badge-green' : 'badge-red'}`}>{sale.status}</span></td></tr>)}</tbody></table></div></div>
  </div>;
}

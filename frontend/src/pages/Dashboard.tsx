import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  CubeIcon, ShoppingBagIcon,
  UsersIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  lowStockCount: number;
  totalRevenue: number;
  monthRevenue: number;
  monthlySales: { _id: string; revenue: number }[];
  recentSales: {
    _id: string; saleNumber: string;
    customer?: { name: string };
    totalAmount: number; status: string; createdAt: string;
  }[];
}

// ── Mock data (replace with api.get('/dashboard/stats') when backend ready) ──
const MOCK_STATS: Stats = {
  totalProducts:  24,
  totalSales:     58,
  totalCustomers: 12,
  lowStockCount:   3,
  totalRevenue:  485000,
  monthRevenue:   92000,
  monthlySales: [
    { _id: 'Jan', revenue: 45000 },
    { _id: 'Feb', revenue: 62000 },
    { _id: 'Mar', revenue: 38000 },
    { _id: 'Apr', revenue: 91000 },
    { _id: 'May', revenue: 92000 },
  ],
  recentSales: [
    { _id: '1', saleNumber: 'S-001', customer: { name: 'John Silva'   }, totalAmount: 12500, status: 'completed', createdAt: new Date().toISOString() },
    { _id: '2', saleNumber: 'S-002', customer: { name: 'Mary Perera'  }, totalAmount:  8200, status: 'completed', createdAt: new Date().toISOString() },
    { _id: '3', saleNumber: 'S-003', customer: { name: 'Kamal Wijaya' }, totalAmount:  3400, status: 'refunded',  createdAt: new Date().toISOString() },
  ],
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

useEffect(() => {
  // TODO: replace with api.get('/dashboard/stats') when backend ready
  setStats(MOCK_STATS);
}, []);

  if (!stats) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const kpis = [
    { label: 'Total Products', value: stats.totalProducts,  icon: CubeIcon,                 color: 'text-primary',    bg: 'bg-primary-faint' },
    { label: 'Total Sales',    value: stats.totalSales,     icon: ShoppingBagIcon,           color: 'text-blue-600',   bg: 'bg-blue-50'       },
    { label: 'Customers',      value: stats.totalCustomers, icon: UsersIcon,                 color: 'text-purple-600', bg: 'bg-purple-50'     },
    { label: 'Low Stock',      value: stats.lowStockCount,  icon: ExclamationTriangleIcon,   color: 'text-red-500',    bg: 'bg-red-50'        },
  ];

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Overview of your shop</p>
      </div>

      {/* Revenue Banner */}
      <div className="rounded-xl bg-primary p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">
            LKR {Number(stats.totalRevenue).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">This Month</p>
          <p className="text-xl font-semibold">
            LKR {Number(stats.monthRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [`LKR ${Number(v ?? 0).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#01696f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Sales</h2>
          <table className="w-full">
            <thead>
              <tr>
                {['Sale #', 'Customer', 'Amount', 'Status'].map(h =>
                  <th key={h} className="th !px-0 pr-3">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {stats.recentSales?.map(s => (
                <tr key={s._id} className="border-t border-gray-50">
                  <td className="py-2 font-mono text-xs text-gray-400">{s.saleNumber}</td>
                  <td className="py-2 text-xs">{s.customer?.name || 'Walk-in'}</td>
                  <td className="py-2 text-xs font-medium">
                    LKR {Number(s.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <span className={`badge ${
                      s.status === 'completed' ? 'badge-green' :
                      s.status === 'refunded'  ? 'badge-red'   : 'badge-yellow'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, ArrowUturnLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Product { _id: string; name: string; price: number; stock: number; }
interface Customer { _id: string; name: string; }
interface Sale { _id: string; saleNumber: string; customer?: Customer; items: { productName: string; quantity: number }[]; totalAmount: number; discount: number; status: 'completed' | 'refunded'; createdAt: string; }
type Item = { productId: string; quantity: number };

const blank: Item = { productId: '', quantity: 1 };
const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState<Item[]>([{ ...blank }]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState(0);

  const load = async () => {
    const [salesResponse, productsResponse, customersResponse] = await Promise.all([
      api.get<Sale[]>('/sales'), api.get<{ data: Product[] }>('/products'), api.get<Customer[]>('/customers'),
    ]);
    setSales(salesResponse.data);
    setProducts(productsResponse.data.data);
    setCustomers(customersResponse.data);
  };

  useEffect(() => { load().catch(() => toast.error('Could not load sales')); }, []);

  const product = (id: string) => products.find((entry) => entry._id === id);
  const subtotal = items.reduce((total, item) => total + (product(item.productId)?.price || 0) * item.quantity, 0);

  const exportSales = () => {
    const rows = sales.map((sale) => [
      sale.saleNumber,
      new Date(sale.createdAt).toISOString(),
      sale.customer?.name || 'Walk-in',
      sale.items.map((item) => `${item.productName} × ${item.quantity}`).join('; '),
      sale.discount,
      sale.totalAmount,
      sale.status,
    ].map(csvCell).join(','));
    const contents = [
      ['Sale Number', 'Date', 'Customer', 'Items', 'Discount (LKR)', 'Total (LKR)', 'Status'].map(csvCell).join(','),
      ...rows,
    ].join('\r\n');
    const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
    download.click();
    URL.revokeObjectURL(url);
    toast.success('Sales exported as CSV');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.some((item) => !item.productId)) return toast.error('Select products');
    try {
      await api.post('/sales', { customer: customer || undefined, items, discount });
      toast.success('Sale recorded'); setModal(false); await load();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Could not complete sale'); }
  };

  const refund = async (id: string) => {
    if (!window.confirm('Refund this sale?')) return;
    try { await api.post(`/sales/${id}/refund`); toast.success('Sale refunded'); await load(); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Could not refund sale'); }
  };

  return <div className="p-6 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-bold">Sales</h1>
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={exportSales} disabled={sales.length === 0}>
          <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
        </button>
        <button className="btn-primary" onClick={() => { setItems([{ ...blank }]); setCustomer(''); setDiscount(0); setModal(true); }}>
          <PlusIcon className="w-4 h-4" /> New Sale
        </button>
      </div>
    </div>
    <div className="card p-0 overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr>{['Sale #', 'Customer', 'Items', 'Discount', 'Total', 'Status', 'Date', ''].map((heading) => <th className="th" key={heading}>{heading}</th>)}</tr></thead><tbody>{sales.map((sale) => <tr className="tr" key={sale._id}><td className="td">{sale.saleNumber}</td><td className="td">{sale.customer?.name || 'Walk-in'}</td><td className="td">{sale.items.length}</td><td className="td">{sale.discount ? `LKR ${sale.discount.toLocaleString()}` : '—'}</td><td className="td font-semibold">LKR {sale.totalAmount.toLocaleString()}</td><td className="td"><span className={`badge ${sale.status === 'completed' ? 'badge-green' : 'badge-red'}`}>{sale.status}</span></td><td className="td text-xs">{new Date(sale.createdAt).toLocaleDateString()}</td><td className="td">{sale.status === 'completed' && user?.role === 'admin' && <button className="text-red-400" onClick={() => refund(sale._id)} aria-label={`Refund ${sale.saleNumber}`}><ArrowUturnLeftIcon className="w-4 h-4" /></button>}</td></tr>)}</tbody></table></div>
    {modal && <Modal title="New Sale" onClose={() => setModal(false)} size="xl"><form className="space-y-4" onSubmit={submit}><div><label className="label">Customer (optional)</label><select className="input" value={customer} onChange={(event) => setCustomer(event.target.value)}><option value="">Walk-in</option>{customers.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}</select></div><div><div className="flex justify-between"><label className="label">Items</label><button type="button" className="btn-ghost btn-sm" onClick={() => setItems((current) => [...current, { ...blank }])}>Add Item</button></div>{items.map((item, index) => <div className="flex gap-2 mb-2" key={index}><select className="input flex-1" required value={item.productId} onChange={(event) => setItems((current) => current.map((value, itemIndex) => itemIndex === index ? { ...value, productId: event.target.value } : value))}><option value="">Select product</option>{products.map((entry) => <option disabled={!entry.stock} key={entry._id} value={entry._id}>{entry.name} (stock {entry.stock})</option>)}</select><input className="input w-20" type="number" min="1" max={product(item.productId)?.stock} value={item.quantity} onChange={(event) => setItems((current) => current.map((value, itemIndex) => itemIndex === index ? { ...value, quantity: Number(event.target.value) } : value))} />{items.length > 1 && <button type="button" className="text-red-400" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>}</div>)}</div><div><label className="label">Discount</label><input className="input" type="number" min="0" max={subtotal} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></div><div className="bg-gray-50 rounded p-3 text-right font-bold">Total: LKR {Math.max(0, subtotal - discount).toLocaleString()}</div><div className="flex gap-2"><button className="btn-primary flex-1 justify-center">Complete Sale</button><button type="button" className="btn-ghost flex-1 justify-center" onClick={() => setModal(false)}>Cancel</button></div></form></Modal>}
  </div>;
}

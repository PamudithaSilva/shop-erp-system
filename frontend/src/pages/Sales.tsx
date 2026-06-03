import { useEffect, useState } from 'react';
import { PlusIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface Product {
  _id: string; name: string;
  price: number; stock: number; unit: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Sale {
  _id: string;
  saleNumber: string;
  customer?: { name: string };
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  status: 'completed' | 'refunded';
  createdAt: string;
}

// ── Mock Data ──
const MOCK_PRODUCTS: Product[] = [
  { _id:'1', name:'Wireless Mouse',     price:2500, stock:45,  unit:'pcs' },
  { _id:'2', name:'USB Keyboard',       price:3200, stock:8,   unit:'pcs' },
  { _id:'3', name:'A4 Paper Ream',      price:950,  stock:120, unit:'pcs' },
  { _id:'4', name:'HDMI Cable 2m',      price:1200, stock:3,   unit:'pcs' },
  { _id:'5', name:'Ballpoint Pen Pack', price:350,  stock:80,  unit:'pcs' },
];

const MOCK_SALES: Sale[] = [
  {
    _id:'1', saleNumber:'S-001',
    customer:{ name:'John Silva' },
    items:[{ productId:'1', productName:'Wireless Mouse', quantity:2, unitPrice:2500 }],
    totalAmount:5000, discount:0, status:'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id:'2', saleNumber:'S-002',
    customer:{ name:'Mary Perera' },
    items:[
      { productId:'2', productName:'USB Keyboard',  quantity:1, unitPrice:3200 },
      { productId:'3', productName:'A4 Paper Ream', quantity:2, unitPrice:950  },
    ],
    totalAmount:4700, discount:1400, status:'completed',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    _id:'3', saleNumber:'S-003',
    items:[{ productId:'5', productName:'Ballpoint Pen Pack', quantity:3, unitPrice:350 }],
    totalAmount:1050, discount:0, status:'refunded',
    createdAt: new Date().toISOString()
  },
];

const NEW_ITEM = { productId:'', quantity:1 };

export default function Sales() {
  const [sales,    setSales]    = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modal,    setModal]    = useState(false);
  const [discount, setDiscount] = useState(0);
  const [items,    setItems]    = useState([{ ...NEW_ITEM }]);
  const [counter,  setCounter]  = useState(4);

  useEffect(() => {
    // TODO: replace with real API calls when backend ready
    setSales(MOCK_SALES);
    setProducts(MOCK_PRODUCTS);
  }, []);

  // ── Item helpers ──
  const addItem    = () => setItems(p => [...p, { ...NEW_ITEM }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, k: string, v: string) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const getProduct  = (id: string) => products.find(p => p._id === id);
  const getPrice    = (id: string) => getProduct(id)?.price || 0;
  const subtotal    = items.reduce((s, i) => s + getPrice(i.productId) * Number(i.quantity || 0), 0);
  const total       = Math.max(0, subtotal - Number(discount || 0));

  const openNew = () => {
    setItems([{ ...NEW_ITEM }]);
    setDiscount(0);
    setModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.productId)) {
      toast.error('Please select a product for all items');
      return;
    }

    const newSale: Sale = {
      _id: Date.now().toString(),
      saleNumber: `S-00${counter}`,
      items: items.map(i => ({
        productId:   i.productId,
        productName: getProduct(i.productId)?.name || '',
        quantity:    Number(i.quantity),
        unitPrice:   getPrice(i.productId),
      })),
      totalAmount: total,
      discount:    Number(discount || 0),
      status:      'completed',
      createdAt:   new Date().toISOString(),
    };

    setSales(p => [newSale, ...p]);
    setCounter(c => c + 1);
    toast.success('Sale recorded!');
    setModal(false);
  };

  const refund = (id: string) => {
    if (!window.confirm('Refund this sale? This cannot be undone.')) return;
    setSales(p => p.map(s => s._id === id ? { ...s, status: 'refunded' } : s));
    toast.success('Sale refunded!');
  };

  return (
    <div className="p-6 space-y-4">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Sales</h1>
        <button className="btn-primary" onClick={openNew}>
          <PlusIcon className="w-4 h-4"/> New Sale
        </button>
      </div>

      {/* Sales Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Sale #','Customer','Items','Discount','Total','Status','Date',''].map(h =>
                <th key={h} className="th">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={8} className="td text-center text-gray-400 py-10">
                No sales yet
              </td></tr>
            )}
            {sales.map(s => (
              <tr key={s._id} className="tr">
                <td className="td font-mono text-xs text-gray-400">{s.saleNumber}</td>
                <td className="td">{s.customer?.name || 'Walk-in'}</td>
                <td className="td text-gray-400">{s.items.length} item{s.items.length !== 1 ? 's':''}</td>
                <td className="td text-red-400">
                  {s.discount > 0 ? `-LKR ${s.discount.toLocaleString()}` : '—'}
                </td>
                <td className="td font-semibold">LKR {s.totalAmount.toLocaleString()}</td>
                <td className="td">
                  <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="td text-gray-400 text-xs">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="td">
                  {s.status === 'completed' && (
                    <button
                      onClick={() => refund(s._id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400"
                      title="Refund">
                      <ArrowUturnLeftIcon className="w-4 h-4"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Sale Modal */}
      {modal && (
        <Modal title="New Sale" onClose={() => setModal(false)} size="xl">
          <form onSubmit={submit} className="space-y-4">

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Items</label>
                <button type="button" className="btn-ghost btn-sm" onClick={addItem}>
                  <PlusIcon className="w-3 h-3"/> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      className="input flex-1"
                      value={item.productId}
                      onChange={e => updateItem(i, 'productId', e.target.value)}
                      required>
                      <option value="">— Select product —</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      className="input w-20 text-center"
                      type="number" min="1"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      required
                    />
                    <span className="text-xs text-gray-400 w-28 text-right whitespace-nowrap">
                      LKR {(getPrice(item.productId) * Number(item.quantity || 0)).toLocaleString()}
                    </span>
                    {items.length > 1 && (
                      <button type="button"
                        onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 px-1 text-lg leading-none">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="label">Discount (LKR)</label>
              <input
                className="input max-w-xs"
                type="number" min="0"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
              />
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Discount</span>
                <span>-LKR {Number(discount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 justify-center">
                Complete Sale
              </button>
              <button type="button" className="btn-ghost flex-1 justify-center"
                onClick={() => setModal(false)}>
                Cancel
              </button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
}
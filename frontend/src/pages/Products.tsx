import { useEffect, useState } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  unit: string;
  category?: { name: string };
  description?: string;
}

const MOCK_PRODUCTS: Product[] = [
  { _id:'1', name:'Wireless Mouse',     sku:'WM-001', price:2500,  costPrice:1800, stock:45,  minStock:10, unit:'pcs', category:{ name:'Electronics' } },
  { _id:'2', name:'USB Keyboard',       sku:'UK-002', price:3200,  costPrice:2200, stock:8,   minStock:10, unit:'pcs', category:{ name:'Electronics' } },
  { _id:'3', name:'A4 Paper Ream',      sku:'AP-003', price:950,   costPrice:700,  stock:120, minStock:20, unit:'pcs', category:{ name:'Stationery'  } },
  { _id:'4', name:'HDMI Cable 2m',      sku:'HC-004', price:1200,  costPrice:800,  stock:3,   minStock:5,  unit:'pcs', category:{ name:'Electronics' } },
  { _id:'5', name:'Ballpoint Pen Pack', sku:'BP-005', price:350,   costPrice:200,  stock:80,  minStock:15, unit:'pcs', category:{ name:'Stationery'  } },
];

const EMPTY = {
  name:'', sku:'', price:'', costPrice:'',
  stock:'0', minStock:'5', unit:'pcs', description:''
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [modal,    setModal]    = useState<'form' | 'stock' | null>(null);
  const [search,   setSearch]   = useState('');
  const [stockAdj, setStockAdj] = useState(0);
  const [stockId,  setStockId]  = useState<string | null>(null);

  useEffect(() => {
    // TODO: replace with api.get('/products') when backend ready
    setProducts(MOCK_PRODUCTS);
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal('form'); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, sku: p.sku || '',
      price: String(p.price), costPrice: String(p.costPrice || ''),
      stock: String(p.stock), minStock: String(p.minStock),
      unit: p.unit, description: p.description || ''
    });
    setEditId(p._id);
    setModal('form');
  };
  const openStock = (p: Product) => {
    setStockId(p._id); setStockAdj(0); setModal('stock');
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setProducts(prev => prev.map(p =>
        p._id === editId ? {
          ...p, name: form.name, sku: form.sku,
          price: Number(form.price), costPrice: Number(form.costPrice),
          stock: Number(form.stock), minStock: Number(form.minStock),
          unit: form.unit, description: form.description
        } : p
      ));
      toast.success('Product updated!');
    } else {
      const newProduct: Product = {
        _id: Date.now().toString(),
        name: form.name, sku: form.sku,
        price: Number(form.price), costPrice: Number(form.costPrice),
        stock: Number(form.stock), minStock: Number(form.minStock),
        unit: form.unit, description: form.description
      };
      setProducts(prev => [...prev, newProduct]);
      toast.success('Product added!');
    }
    setModal(null);
  };

  const remove = (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setProducts(prev => prev.filter(p => p._id !== id));
    toast.success('Deleted!');
  };

  const adjustStock = () => {
    setProducts(prev => prev.map(p =>
      p._id === stockId
        ? { ...p, stock: Math.max(0, p.stock + Number(stockAdj)) }
        : p
    ));
    toast.success('Stock updated!');
    setModal(null);
  };

  return (
    <div className="p-6 space-y-4">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <button className="btn-primary" onClick={openAdd}>
          <PlusIcon className="w-4 h-4"/> Add Product
        </button>
      </div>

      {/* Search */}
      <input
        className="input max-w-xs"
        placeholder="Search by name or SKU…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Name','SKU','Price','Cost','Stock','Category',''].map(h =>
                <th key={h} className="th">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="td text-center text-gray-400 py-10">
                No products found
              </td></tr>
            )}
            {filtered.map(p => (
              <tr key={p._id} className="tr">
                <td className="td font-medium text-gray-900">{p.name}</td>
                <td className="td font-mono text-xs text-gray-400">{p.sku || '—'}</td>
                <td className="td">LKR {p.price.toLocaleString()}</td>
                <td className="td text-gray-400">LKR {(p.costPrice || 0).toLocaleString()}</td>
                <td className="td">
                  <span className={`badge ${p.stock <= p.minStock ? 'badge-red' : 'badge-green'}`}>
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="td text-gray-500">{p.category?.name || '—'}</td>
                <td className="td">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openStock(p)}
                      className="p-1.5 rounded hover:bg-amber-50 text-amber-500"
                      title="Adjust stock">
                      <AdjustmentsHorizontalIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => openEdit(p)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-400"
                      title="Edit">
                      <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => remove(p._id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400"
                      title="Delete">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal === 'form' && (
        <Modal
          title={editId ? 'Edit Product' : 'Add Product'}
          onClose={() => setModal(null)}
          size="lg">
          <form onSubmit={save} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name <span className="text-red-400">*</span></label>
              <input className="input" value={form.name} onChange={f('name')} required/>
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku} onChange={f('sku')}/>
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={form.unit} onChange={f('unit')}/>
            </div>
            <div>
              <label className="label">Selling Price <span className="text-red-400">*</span></label>
              <input className="input" type="number" value={form.price} onChange={f('price')} required/>
            </div>
            <div>
              <label className="label">Cost Price</label>
              <input className="input" type="number" value={form.costPrice} onChange={f('costPrice')}/>
            </div>
            <div>
              <label className="label">Stock</label>
              <input className="input" type="number" value={form.stock} onChange={f('stock')}/>
            </div>
            <div>
              <label className="label">Min Stock</label>
              <input className="input" type="number" value={form.minStock} onChange={f('minStock')}/>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={f('description')}/>
            </div>
            <div className="col-span-2 flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 justify-center">
                Save Product
              </button>
              <button type="button" className="btn-ghost flex-1 justify-center"
                onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Adjust Modal */}
      {modal === 'stock' && (
        <Modal title="Adjust Stock" onClose={() => setModal(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter <span className="font-medium text-green-600">positive</span> to add stock,{' '}
              <span className="font-medium text-red-500">negative</span> to remove.
            </p>
            <div>
              <label className="label">Adjustment</label>
              <input
                className="input" type="number"
                value={stockAdj}
                onChange={e => setStockAdj(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 justify-center" onClick={adjustStock}>
                Apply
              </button>
              <button className="btn-ghost flex-1 justify-center" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
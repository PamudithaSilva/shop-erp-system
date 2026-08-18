import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  unit: string;
  category?: Category;
  supplier?: Category;
  description?: string;
}

interface ProductFormState {
  name: string;
  sku: string;
  price: string;
  costPrice: string;
  stock: string;
  minStock: string;
  unit: string;
  description: string;
  category: string;
  supplier: string;
}

interface InventoryMovement {
  _id: string;
  type: 'opening_balance' | 'sale' | 'refund' | 'purchase_receipt' | 'adjustment';
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  note?: string;
  createdAt: string;
  createdBy?: { name: string };
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  sku: '',
  price: '',
  costPrice: '',
  stock: '0',
  minStock: '5',
  unit: 'pcs',
  description: '',
  category: '',
  supplier: '',
};

export default function Products() {
  const { user } = useAuth();
  const canManageProducts = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [modal, setModal] = useState<'form' | 'stock' | 'history' | null>(null);
  const [search, setSearch] = useState('');
  const [stockAdj, setStockAdj] = useState(0);
  const [stockId, setStockId] = useState<string | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    const [productRes, categoryRes, supplierRes] = await Promise.all([
      api.get<{ success: boolean; data: Product[] }>('/products'),
      api.get<Category[]>('/categories'),
      api.get<Category[]>('/suppliers'),
    ]);

    setProducts(productRes.data.data);
    setCategories(categoryRes.data);
    setSuppliers(supplierRes.data);
  };

  useEffect(() => {
    load().catch(() => toast.error('Could not load inventory'));
  }, []);

  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const updateField =
    (key: keyof ProductFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const openAdd = () => {
    if (!canManageProducts) return;
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal('form');
  };

  const openEdit = (product: Product) => {
    if (!canManageProducts) return;
    setForm({
      name: product.name,
      sku: product.sku || '',
      price: String(product.price),
      costPrice: product.costPrice != null ? String(product.costPrice) : '',
      stock: String(product.stock),
      minStock: String(product.minStock),
      unit: product.unit,
      description: product.description || '',
      category: product.category?._id || '',
      supplier: product.supplier?._id || '',
    });
    setEditId(product._id);
    setModal('form');
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManageProducts) {
      toast.error('You do not have permission to modify products');
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        costPrice: Number(form.costPrice || 0),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        category: form.category || undefined,
        supplier: form.supplier || undefined,
      };

      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      toast.success(editId ? 'Product updated' : 'Product added');
      setModal(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save product');
    }
  };

  const remove = async (id: string) => {
    if (!canManageProducts) {
      toast.error('You do not have permission to deactivate products');
      return;
    }

    if (!window.confirm('Deactivate this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not delete product');
    }
  };

  const adjustStock = async () => {
    if (!canManageProducts) {
      toast.error('You do not have permission to adjust stock');
      return;
    }

    const product = products.find((item) => item._id === stockId);
    if (!product) return;

    const nextStock = product.stock + Number(stockAdj);
    if (nextStock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    try {
      await api.put(`/products/${stockId}`, { stock: nextStock });
      toast.success('Stock updated');
      setModal(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update stock');
    }
  };

  const openHistory = async (product: Product) => {
    setHistoryProduct(product);
    setMovements([]);
    setHistoryLoading(true);
    setModal('history');
    try {
      const response = await api.get<{ success: boolean; data: InventoryMovement[] }>(
        `/inventory-movements?product=${product._id}`
      );
      setMovements(response.data.data);
    } catch {
      toast.error('Could not load stock history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeModal = () => setModal(null);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          {!canManageProducts && (
            <p className="text-xs text-gray-400">Read-only access for staff users</p>
          )}
        </div>
        {canManageProducts && (
          <button className="btn-primary" onClick={openAdd}>
            <PlusIcon className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      <input
        className="input max-w-xs"
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="th">Name</th>
              <th className="th">SKU</th>
              <th className="th">Price</th>
              <th className="th">Cost</th>
              <th className="th">Stock</th>
              <th className="th">Category</th>
              {canManageProducts && <th className="th" />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={canManageProducts ? 7 : 6}
                  className="td text-center text-gray-400 py-10"
                >
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product._id} className="tr">
                  <td className="td font-medium">{product.name}</td>
                  <td className="td font-mono text-xs text-gray-400">{product.sku || '—'}</td>
                  <td className="td">LKR {product.price.toLocaleString()}</td>
                  <td className="td text-gray-400">LKR {(product.costPrice || 0).toLocaleString()}</td>
                  <td className="td">
                    <button
                      onClick={() => openHistory(product)}
                      title="View stock history"
                      className="inline-flex items-center gap-1 hover:opacity-75"
                    >
                      <span className={`badge ${product.stock <= product.minStock ? 'badge-red' : 'badge-green'}`}>
                        {product.stock} {product.unit}
                      </span>
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </td>
                  <td className="td text-gray-500">{product.category?.name || '—'}</td>
                  {canManageProducts && (
                    <td className="td">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            setStockId(product._id);
                            setStockAdj(0);
                            setModal('stock');
                          }}
                          className="p-1.5 text-amber-500"
                        >
                          <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(product)} className="p-1.5 text-blue-400">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(product._id)} className="p-1.5 text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canManageProducts && modal === 'form' && (
        <Modal title={editId ? 'Edit Product' : 'Add Product'} onClose={closeModal} size="lg">
          <form onSubmit={save} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={updateField('name')} required />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku} onChange={updateField('sku')} />
            </div>
            {(['price', 'costPrice', 'stock', 'minStock', 'unit'] as const).map((key) => (
              <div key={key}>
                <label className="label">
                  {key === 'costPrice' ? 'Cost Price' : key[0].toUpperCase() + key.slice(1)}
                  {key === 'price' && ' *'}
                </label>
                <input
                  className="input"
                  value={form[key]}
                  onChange={updateField(key)}
                  required={key === 'price'}
                />
              </div>
            ))}
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={updateField('category')}>
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplier} onChange={updateField('supplier')}>
                <option value="">None</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[90px]"
                value={form.description}
                onChange={updateField('description')}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" className="btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {canManageProducts && modal === 'stock' && (
        <Modal title="Adjust Stock" onClose={closeModal} size="sm">
          <div className="space-y-3">
            <div>
              <label className="label">Change by</label>
              <input
                type="number"
                className="input"
                value={stockAdj}
                onChange={(event) => setStockAdj(Number(event.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-primary flex-1 justify-center" onClick={adjustStock}>
                Apply
              </button>
              <button type="button" className="btn-ghost flex-1 justify-center" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'history' && historyProduct && (
        <Modal title={`Stock History — ${historyProduct.name}`} onClose={closeModal} size="lg">
          {historyLoading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading history…</p>
          ) : movements.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No stock movements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <tr>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Change</th>
                    <th className="py-2 pr-3">Stock</th>
                    <th className="py-2">By</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement._id} className="border-b border-gray-50">
                      <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 capitalize">{movement.type.replace('_', ' ')}</td>
                      <td className={`py-2.5 pr-3 font-medium ${movement.quantityChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">{movement.stockBefore} → {movement.stockAfter}</td>
                      <td className="py-2.5 text-gray-500">{movement.createdBy?.name || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ClipboardDocumentListIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

interface Supplier { _id: string; name: string; }
interface Product { _id: string; name: string; sku?: string; costPrice?: number; unit: string; }
interface OrderItem { product: Product; productName: string; orderedQuantity: number; receivedQuantity: number; unitCost: number; }
interface PurchaseOrder { _id: string; orderNumber: string; supplier: Supplier; items: OrderItem[]; subtotal: number; status: string; expectedDate?: string; notes?: string; createdAt: string; }
type DraftItem = { productId: string; quantity: number; unitCost: number };

const blankItem = (): DraftItem => ({ productId: '', quantity: 1, unitCost: 0 });
const statusStyle: Record<string, string> = { draft: 'badge-gray', ordered: 'badge-blue', partially_received: 'badge-amber', received: 'badge-green', cancelled: 'badge-red' };

export default function PurchaseOrders() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modal, setModal] = useState<'new' | 'receive' | null>(null);
  const [supplier, setSupplier] = useState(''); const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [expectedDate, setExpectedDate] = useState(''); const [notes, setNotes] = useState(''); const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);
  const [received, setReceived] = useState<Record<string, number>>({});

  const load = async () => {
    const [orderRes, supplierRes, productRes] = await Promise.all([api.get<PurchaseOrder[]>('/purchase-orders'), api.get<Supplier[]>('/suppliers'), api.get<{ data: Product[] }>('/products')]);
    setOrders(orderRes.data); setSuppliers(supplierRes.data); setProducts(productRes.data.data);
  };
  useEffect(() => { load().catch(() => toast.error('Could not load purchase orders')); }, []);
  const setItem = (index: number, change: Partial<DraftItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item));
  const chooseProduct = (index: number, productId: string) => {
    const product = products.find((entry) => entry._id === productId);
    setItem(index, { productId, unitCost: product?.costPrice || 0 });
  };
  const create = async (event: React.FormEvent, status: 'draft' | 'ordered') => {
    event.preventDefault();
    if (!supplier || items.some((item) => !item.productId)) return toast.error('Select a supplier and products');
    try { await api.post('/purchase-orders', { supplier, items, expectedDate: expectedDate || undefined, notes, status }); toast.success(status === 'ordered' ? 'Purchase order sent' : 'Draft saved'); setModal(null); await load(); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Could not create purchase order'); }
  };
  const openReceive = (order: PurchaseOrder) => {
    setReceiving(order); setReceived(Object.fromEntries(order.items.map((item) => [item.product._id, 0]))); setModal('receive');
  };
  const receive = async () => {
    if (!receiving) return;
    if (!Object.values(received).some((quantity) => quantity > 0)) return toast.error('Enter a received quantity');
    try { await api.post(`/purchase-orders/${receiving._id}/receive`, { items: Object.entries(received).map(([productId, quantity]) => ({ productId, quantity })) }); toast.success('Stock received and updated'); setModal(null); await load(); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Could not receive order'); }
  };
  const updateStatus = async (order: PurchaseOrder, status: string) => {
    try { await api.patch(`/purchase-orders/${order._id}/status`, { status }); toast.success(`Order ${status}`); await load(); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Could not update order'); }
  };

  return <div className="p-6 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold">Purchase Orders</h1><p className="text-sm text-gray-500">Plan replenishment and receive supplier deliveries.</p></div>{canManage && <button className="btn-primary" onClick={() => { setSupplier(''); setItems([blankItem()]); setExpectedDate(''); setNotes(''); setModal('new'); }}><PlusIcon className="w-4 h-4" /> New Purchase Order</button>}</div>
    <div className="card p-0 overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr>{['PO #', 'Supplier', 'Items', 'Expected', 'Total', 'Status', ''].map((heading) => <th key={heading} className="th">{heading}</th>)}</tr></thead><tbody>{orders.length ? orders.map((order) => <tr className="tr" key={order._id}><td className="td font-medium">{order.orderNumber}</td><td className="td">{order.supplier?.name}</td><td className="td">{order.items.reduce((sum, item) => sum + item.receivedQuantity, 0)} / {order.items.reduce((sum, item) => sum + item.orderedQuantity, 0)}</td><td className="td text-sm">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '—'}</td><td className="td">LKR {order.subtotal.toLocaleString()}</td><td className="td"><span className={`badge ${statusStyle[order.status] || 'badge-gray'}`}>{order.status.replace('_', ' ')}</span></td><td className="td"><div className="flex justify-end gap-2">{canManage && ['ordered', 'partially_received'].includes(order.status) && <button title="Receive stock" onClick={() => openReceive(order)} className="text-green-600"><TruckIcon className="w-4 h-4" /></button>}{canManage && order.status === 'draft' && <button className="text-primary text-xs" onClick={() => updateStatus(order, 'ordered')}>Send</button>}{canManage && ['draft', 'ordered'].includes(order.status) && <button className="text-red-400 text-xs" onClick={() => updateStatus(order, 'cancelled')}>Cancel</button>}</div></td></tr>) : <tr><td colSpan={7} className="td text-center text-gray-400 py-10"><ClipboardDocumentListIcon className="w-7 h-7 mx-auto mb-2" />No purchase orders yet.</td></tr>}</tbody></table></div>
    {modal === 'new' && <Modal title="New Purchase Order" onClose={() => setModal(null)} size="xl"><form className="space-y-4" onSubmit={(event) => create(event, 'ordered')}><div className="grid grid-cols-2 gap-3"><div><label className="label">Supplier *</label><select required className="input" value={supplier} onChange={(event) => setSupplier(event.target.value)}><option value="">Select supplier</option>{suppliers.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}</select></div><div><label className="label">Expected delivery</label><input type="date" className="input" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} /></div></div><div><div className="flex justify-between"><label className="label">Order items</label><button type="button" className="btn-ghost btn-sm" onClick={() => setItems((current) => [...current, blankItem()])}>Add item</button></div>{items.map((item, index) => <div className="grid grid-cols-[1fr_90px_120px_auto] gap-2 mb-2" key={index}><select required className="input" value={item.productId} onChange={(event) => chooseProduct(index, event.target.value)}><option value="">Select product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select><input className="input" type="number" min="1" value={item.quantity} onChange={(event) => setItem(index, { quantity: Number(event.target.value) })} title="Quantity" /><input className="input" type="number" min="0" value={item.unitCost} onChange={(event) => setItem(index, { unitCost: Number(event.target.value) })} title="Unit cost" />{items.length > 1 && <button type="button" className="text-red-400" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>}</div>)}</div><div><label className="label">Notes</label><textarea className="input" value={notes} onChange={(event) => setNotes(event.target.value)} /></div><div className="bg-gray-50 rounded p-3 text-right font-bold">Total: LKR {items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0).toLocaleString()}</div><div className="flex gap-2"><button className="btn-primary flex-1 justify-center">Save &amp; Send</button><button type="button" className="btn-ghost flex-1 justify-center" onClick={(event) => create(event, 'draft')}>Save Draft</button></div></form></Modal>}
    {modal === 'receive' && receiving && <Modal title={`Receive ${receiving.orderNumber}`} onClose={() => setModal(null)} size="lg"><div className="space-y-3"><p className="text-sm text-gray-500">Enter only the quantities delivered in this shipment.</p>{receiving.items.map((item) => { const remaining = item.orderedQuantity - item.receivedQuantity; return <div className="grid grid-cols-[1fr_100px] gap-3 items-center" key={item.product._id}><div><p className="font-medium">{item.productName}</p><p className="text-xs text-gray-500">Remaining: {remaining} {item.product?.unit || ''}</p></div><input className="input" type="number" min="0" max={remaining} value={received[item.product._id] || 0} onChange={(event) => setReceived((current) => ({ ...current, [item.product._id]: Number(event.target.value) }))} /></div>; })}<button className="btn-primary w-full justify-center" onClick={receive}>Receive Delivery</button></div></Modal>}
  </div>;
}

import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface Customer {
  _id: string; name: string;
  email?: string; phone?: string; address?: string;
}
type CustomerForm = { name: string; email?: string; phone?: string; address?: string };
const EMPTY: CustomerForm = { name:'', email:'', phone:'', address:'' };

export default function Customers() {
  const [data,   setData]   = useState<Customer[]>([]);
  const [form,   setForm]   = useState<CustomerForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modal,  setModal]  = useState(false);

  const load = () => api.get<Customer[]>('/customers').then(r => setData(r.data));
  useEffect(() => { load().catch(() => toast.error('Could not load customers')); }, []);

  const openAdd  = ()           => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c: Customer)=> { setForm(c);     setEditId(c._id); setModal(true); };
  const f        = (k: string)  => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      editId
        ? await api.put(`/customers/${editId}`, form)
        : await api.post('/customers', form);
      toast.success(editId ? 'Updated!' : 'Customer added!');
      setModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this customer?')) return;
    await api.delete(`/customers/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <button className="btn-primary" onClick={openAdd}>
          <PlusIcon className="w-4 h-4"/> Add Customer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>{['Name','Email','Phone','Address',''].map(h =>
              <th key={h} className="th">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className="td text-center text-gray-400 py-10">
                No customers yet
              </td></tr>
            )}
            {data.map(c => (
              <tr key={c._id} className="tr">
                <td className="td font-medium">{c.name}</td>
                <td className="td text-gray-500">{c.email || '—'}</td>
                <td className="td text-gray-500">{c.phone || '—'}</td>
                <td className="td text-gray-400 text-xs">{c.address || '—'}</td>
                <td className="td">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(c)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-400">
                      <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => remove(c._id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? 'Edit Customer' : 'Add Customer'} onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-3">
            {([['name','Name',true],['email','Email',false],
               ['phone','Phone',false],['address','Address',false]] as [string,string,boolean][])
              .map(([k,l,req]) => (
              <div key={k}>
                <label className="label">{l}{req && <span className="text-red-400">*</span>}</label>
                <input className="input" value={(form as any)[k]} onChange={f(k)} required={req}/>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 justify-center">Save</button>
              <button type="button" className="btn-ghost flex-1 justify-center"
                onClick={() => setModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

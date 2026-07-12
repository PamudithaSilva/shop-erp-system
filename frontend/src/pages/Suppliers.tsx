import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

type SupplierForm = { name: string; email?: string; phone?: string; address?: string };
const EMPTY: SupplierForm = { name: '', email: '', phone: '', address: '' };

export default function Suppliers() {
  const [data,   setData]   = useState<Supplier[]>([]);
  const [form,   setForm]   = useState<SupplierForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modal,  setModal]  = useState(false);

  const load = () => api.get<Supplier[]>('/suppliers').then(r => setData(r.data));
  useEffect(() => { load().catch(() => toast.error('Could not load suppliers')); }, []);

  const openAdd  = ()              => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s: Supplier)   => { setForm(s); setEditId(s._id); setModal(true); };
  const f        = (k: string)     => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      editId
        ? await api.put(`/suppliers/${editId}`, form)
        : await api.post('/suppliers', form);
      toast.success(editId ? 'Updated!' : 'Supplier added!');
      setModal(false); load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this supplier?')) return;
    await api.delete(`/suppliers/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div className="p-6 space-y-4">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
        <button className="btn-primary" onClick={openAdd}>
          <PlusIcon className="w-4 h-4"/> Add Supplier
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Name', 'Email', 'Phone', 'Address', ''].map(h =>
                <th key={h} className="th">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="td text-center text-gray-400 py-10">
                  No suppliers yet
                </td>
              </tr>
            )}
            {data.map(s => (
              <tr key={s._id} className="tr">
                <td className="td font-medium">{s.name}</td>
                <td className="td text-gray-500">{s.email   || '—'}</td>
                <td className="td text-gray-500">{s.phone   || '—'}</td>
                <td className="td text-gray-400 text-xs">{s.address || '—'}</td>
                <td className="td">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-400">
                      <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => remove(s._id)}
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
        <Modal
          title={editId ? 'Edit Supplier' : 'Add Supplier'}
          onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-3">
            {([
              ['name',    'Name',    true ],
              ['email',   'Email',   false],
              ['phone',   'Phone',   false],
              ['address', 'Address', false],
            ] as [string, string, boolean][]).map(([k, l, req]) => (
              <div key={k}>
                <label className="label">
                  {l}{req && <span className="text-red-400">*</span>}
                </label>
                <input
                  className="input"
                  value={(form as any)[k]}
                  onChange={f(k)}
                  required={req}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary flex-1 justify-center">
                Save
              </button>
              <button
                type="button"
                className="btn-ghost flex-1 justify-center"
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

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Products', path: '/products' },
  { label: 'Sales', path: '/sales' },
  { label: 'Purchase Orders', path: '/purchase-orders' },
  { label: 'Customers', path: '/customers' },
  { label: 'Categories', path: '/categories' },
  { label: 'Suppliers', path: '/suppliers' }
];

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredShortcuts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return shortcuts;
    }
    return shortcuts.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [query]);

  if (!isOpen) {
    return null;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Modal title="Quick Search" onClose={onClose} size="md">
      <div className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages..."
          autoFocus
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-100">
          {filteredShortcuts.length > 0 ? (
            filteredShortcuts.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-slate-500">No pages found.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

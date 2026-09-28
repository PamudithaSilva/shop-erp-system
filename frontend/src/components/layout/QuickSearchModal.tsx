import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TagIcon,
  TruckIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  action?: () => void;
  description?: string;
}

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const items: SearchItem[] = [
    {
      id: 'dash',
      title: 'Dashboard',
      category: 'Navigation',
      icon: HomeIcon,
      to: '/dashboard',
      description: 'Overview of revenue, sales, and inventory KPIs'
    },
    {
      id: 'prod',
      title: 'Products Inventory',
      category: 'Navigation',
      icon: CubeIcon,
      to: '/products',
      description: 'Manage items, stock levels, barcodes, and pricing'
    },
    {
      id: 'sales',
      title: 'Sales & POS',
      category: 'Navigation',
      icon: ShoppingBagIcon,
      to: '/sales',
      description: 'Create point of sale transactions and view receipts'
    },
    {
      id: 'purchases',
      title: 'Purchase Orders',
      category: 'Navigation',
      icon: ClipboardDocumentListIcon,
      to: '/purchase-orders',
      description: 'Restock stock from suppliers and manage orders'
    },
    {
      id: 'customers',
      title: 'Customer Directory',
      category: 'Navigation',
      icon: UsersIcon,
      to: '/customers',
      description: 'Customer profiles, loyalty, and contact history'
    },
    {
      id: 'categories',
      title: 'Product Categories',
      category: 'Navigation',
      icon: TagIcon,
      to: '/categories',
      description: 'Group items by catalog categories'
    },
    {
      id: 'suppliers',
      title: 'Suppliers & Vendors',
      category: 'Navigation',
      icon: TruckIcon,
      to: '/suppliers',
      description: 'Vendor directory and supply contacts'
    },
    {
      id: 'new-sale',
      title: 'Record New Sale',
      category: 'Actions',
      icon: PlusIcon,
      to: '/sales',
      description: 'Launch checkout register'
    },
    {
      id: 'new-product',
      title: 'Add New Product',
      category: 'Actions',
      icon: PlusIcon,
      to: '/products',
      description: 'Register a new stock inventory item'
    }
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    if (item.to) {
      navigate(item.to);
    } else if (item.action) {
      item.action();
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedIndex, filtered]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <MagnifyingGlassIcon className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, or modules... (e.g. Products, Sales)"
            className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 mr-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <SparklesIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for dashboard, sales, products or customers.</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-50 text-primary border-l-4 border-primary'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ml-2 flex-shrink-0 ${
                      item.category === 'Actions'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs font-semibold mr-1">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs font-semibold mr-1">↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs font-semibold mr-1">↵</kbd>
              Select
            </span>
          </div>
          <span className="font-medium text-primary">Shop ERP Quick Search</span>
        </div>
      </div>
    </div>
  );
}

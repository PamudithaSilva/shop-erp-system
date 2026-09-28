import { NavLink } from 'react-router-dom';
import {
  ChevronDoubleLeftIcon,
  CubeIcon,
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TagIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/products', label: 'Products', icon: CubeIcon },
  { to: '/sales', label: 'Sales', icon: ShoppingBagIcon },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardDocumentListIcon },
  { to: '/customers', label: 'Customers', icon: UsersIcon },
  { to: '/categories', label: 'Categories', icon: TagIcon },
  { to: '/suppliers', label: 'Suppliers', icon: TruckIcon }
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-900/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full bg-white border-r border-slate-200/80 shadow-sm transition-all duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-[84px]' : 'w-64'}`}
      >
        <div className="h-16 px-3 flex items-center justify-between border-b border-slate-100">
          <span className={`font-bold text-primary ${isCollapsed ? 'hidden' : 'block'}`}>Shop ERP</span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronDoubleLeftIcon className={`w-4 h-4 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="px-2 py-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-primary font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

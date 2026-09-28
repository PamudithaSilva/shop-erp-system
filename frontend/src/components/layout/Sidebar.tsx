import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TagIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface NavGroup {
  label: string;
  items: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' }
    ]
  },
  {
    label: 'Inventory & Catalog',
    items: [
      { to: '/products',   icon: CubeIcon,  label: 'Products' },
      { to: '/categories', icon: TagIcon,   label: 'Categories' },
      { to: '/suppliers',  icon: TruckIcon, label: 'Suppliers' }
    ]
  },
  {
    label: 'Transactions',
    items: [
      { to: '/sales',           icon: ShoppingBagIcon,           label: 'Sales & POS' },
      { to: '/purchase-orders', icon: ClipboardDocumentListIcon, label: 'Purchasing' }
    ]
  },
  {
    label: 'People',
    items: [
      { to: '/customers', icon: UsersIcon, label: 'Customers' }
    ]
  }
];

function BrandLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-primary p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
        <div className="w-full h-full bg-[#0f2240] rounded-[10px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
            <path
              d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M3 10h18M8 15h3M15 15h1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className="min-w-0 transition-opacity duration-200">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight leading-none">Shop ERP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-none">Smart Inventory &amp; POS</p>
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 ${sidebarWidth} bg-[#0e1e38] text-slate-300 flex flex-col border-r border-white/5 shadow-2xl md:shadow-none transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <BrandLogo collapsed={isCollapsed} />
          {/* Mobile close button */}
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 md:hidden"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => onClose()}
                    title={isCollapsed ? label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-300 rounded-r-full" />
                        )}
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                            isActive ? 'text-white scale-105' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{label}</span>}
                        {!isCollapsed && badge && (
                          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/30 text-blue-200">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: User Card & Collapse Toggle */}
        <div className="p-3 border-t border-white/5 flex-shrink-0 bg-[#0b182e]/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-500 border border-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-blue-300/80 capitalize truncate leading-none mt-0.5">{user?.role || 'Staff'}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>

              {/* Desktop Collapse / Expand Toggle Button */}
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4" />
                ) : (
                  <ChevronLeftIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

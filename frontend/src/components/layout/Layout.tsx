import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, CubeIcon, TagIcon, TruckIcon,
  UsersIcon, ShoppingBagIcon, ClipboardDocumentListIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard',  icon: HomeIcon,        label: 'Dashboard'  },
  { to: '/products',   icon: CubeIcon,        label: 'Products'   },
  { to: '/sales',      icon: ShoppingBagIcon, label: 'Sales'      },
  { to: '/purchase-orders', icon: ClipboardDocumentListIcon, label: 'Purchasing' },
  { to: '/customers',  icon: UsersIcon,       label: 'Customers'  },
  { to: '/categories', icon: TagIcon,         label: 'Categories' },
  { to: '/suppliers',  icon: TruckIcon,       label: 'Suppliers'  },
];

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-label="Shop ERP">
      <rect width="30" height="30" rx="8" fill="#ffffff" fillOpacity="0.16"/>
      <path d="M8 10h14M8 15h14M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="20" r="3" fill="#b9d7ff"/>
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fd]">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-gradient-to-b from-primary-dark to-[#245fa9] text-white flex flex-col shadow-[4px_0_22px_rgba(24,56,103,0.12)]">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
          <Logo />
          <div>
            <p className="font-semibold text-white text-sm leading-tight">Shop ERP</p>
            <p className="text-xs text-blue-100">Inventory &amp; Sales</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ` +
                (isActive
                  ? 'bg-white text-primary-dark font-semibold shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white')
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-blue-100 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#f4f7fd]">
        <Outlet />
      </main>

    </div>
  );
}

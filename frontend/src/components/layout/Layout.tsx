import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, CubeIcon, TagIcon, TruckIcon,
  UsersIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon
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
  { to: '/customers',  icon: UsersIcon,       label: 'Customers'  },
  { to: '/categories', icon: TagIcon,         label: 'Categories' },
  { to: '/suppliers',  icon: TruckIcon,       label: 'Suppliers'  },
];

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-label="Shop ERP">
      <rect width="30" height="30" rx="8" fill="#01696f"/>
      <path d="M8 10h14M8 15h14M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="20" r="3" fill="white"/>
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
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <Logo />
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">Shop ERP</p>
            <p className="text-xs text-gray-400">Mini System</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ` +
                (isActive
                  ? 'bg-primary-faint text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50')
              }>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>

    </div>
  );
}
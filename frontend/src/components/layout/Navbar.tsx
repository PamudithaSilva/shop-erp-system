import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Real-time overview & financial metrics', icon: HomeIcon },
  '/products': { title: 'Product Inventory', subtitle: 'Catalog, stock movements & pricing', icon: CubeIcon },
  '/sales': { title: 'Sales & POS', subtitle: 'Point of sale transactions & records', icon: ShoppingBagIcon },
  '/purchase-orders': { title: 'Purchase Orders', subtitle: 'Supplier inventory restocking', icon: ClipboardDocumentListIcon },
  '/customers': { title: 'Customers', subtitle: 'Client relationships & loyalty', icon: UsersIcon },
  '/categories': { title: 'Categories', subtitle: 'Product classifications & taxonomy', icon: TagIcon },
  '/suppliers': { title: 'Suppliers', subtitle: 'Vendor contacts & logistics', icon: TruckIcon },
};

export default function Navbar({ onToggleSidebar, onOpenSearch }: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPath = location.pathname;
  const pageMeta = pageTitles[currentPath] || {
    title: 'Shop ERP',
    subtitle: 'Management System',
    icon: HomeIcon
  };
  const PageIcon = pageMeta.icon;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sampleNotifications = [
    {
      id: '1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Items in inventory are below threshold levels',
      time: '10m ago',
      icon: ExclamationTriangleIcon,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      id: '2',
      type: 'success',
      title: 'System Synced',
      message: 'Database & transactions are synchronized',
      time: '1h ago',
      icon: CheckCircleIcon,
      color: 'text-emerald-500 bg-emerald-50'
    }
  ];

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all duration-200 shadow-sm">
      {/* Left side: Hamburger (mobile) + Page breadcrumb */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 hidden sm:flex items-center justify-center text-primary flex-shrink-0">
            <PageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium hidden md:inline">ERP /</span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                {pageMeta.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5 leading-none">
              {pageMeta.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Search trigger + Status + Actions + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Shortcut Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs transition-all duration-200 shadow-sm group"
          title="Search or jump to (Ctrl+K)"
        >
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="hidden md:inline font-medium">Quick search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-400 shadow-xs">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Live Status Pill (Desktop) */}
        {/* <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Online</span>
          {currentTime && <span className="text-emerald-600/70 border-l border-emerald-200 pl-1.5 font-mono">{currentTime}</span>}
        </div> */}

        {/* Quick New Sale Shortcut Button */}
        <Link
          to="/sales"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all duration-200 hover:-translate-y-px active:scale-95"
        >
          <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Sale</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 ${
              notificationsOpen ? 'bg-slate-100 text-slate-800' : ''
            }`}
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-primary text-[10px] font-bold">2</span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-primary hover:text-primary-hover font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors cursor-pointer">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <Link
                  to="/products"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-primary hover:text-primary-hover block"
                >
                  Review inventory alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200 ${
              profileOpen ? 'bg-slate-100 border-slate-200' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#183867] to-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                {user?.name || 'Staff User'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 capitalize leading-none">
                {user?.role || 'Admin'}
              </p>
            </div>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-primary border border-blue-100 capitalize">
                  Role: {user?.role || 'Administrator'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
                  Quick Search (Ctrl+K)
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

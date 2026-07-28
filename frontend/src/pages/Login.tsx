import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type LoginMode = 'user' | 'admin';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('admin');
  const [email, setEmail] = useState('admin@shop.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password, isAdmin ? 'admin' : 'staff');
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const isAdmin = mode === 'admin';

  return (
    <main className="min-h-screen bg-[#f4f7fd] text-[#183867]">
      <header className="bg-gradient-to-r from-[#1e467f] to-[#2e64dc] px-6 py-4 shadow-md sm:px-10 lg:px-[8.5%]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold leading-tight sm:text-[28px]">Shop ERP System</h1>
            <p className="text-xs font-medium text-blue-100 sm:text-sm">Inventory, sales, and business operations</p>
          </div>
          <a
            href="#login-form"
            className="rounded-full border border-white/20 bg-white px-6 py-2.5 text-sm font-semibold text-[#183867] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Login
          </a>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-86px)] items-center justify-center px-5 py-12 sm:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[20px] bg-white shadow-[0_22px_55px_rgba(26,68,125,0.18)] lg:grid-cols-2">
          <aside className="bg-gradient-to-br from-[#20457e] to-[#2f66e3] px-10 py-14 text-white sm:px-16 lg:flex lg:min-h-[488px] lg:flex-col lg:justify-center">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-blue-50">
              Sign in to manage products, stock, customers, suppliers, and sales from one central workspace.
            </p>
            <ul className="mt-7 space-y-3 text-sm font-medium text-white">
              {[
                'Manage products, categories, and stock levels',
                'Keep customer and supplier records organised',
                'Create sales and monitor business performance',
                'Access your ERP dashboard securely from anywhere',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#91bff7]" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex items-center px-8 py-12 sm:px-16 lg:px-[70px]" id="login-form">
            <div className="w-full">
              <div className="grid grid-cols-2 rounded-xl bg-[#eff3f8] p-1 text-center text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('user')}
                  className={`rounded-lg px-3 py-2.5 transition ${!isAdmin ? 'bg-white text-[#183867] shadow-sm ring-2 ring-[#183867]' : 'text-[#506584]'}`}
                >
                  Staff Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`rounded-lg px-3 py-2.5 transition ${isAdmin ? 'bg-white text-[#183867] shadow-sm ring-2 ring-[#183867]' : 'text-[#506584]'}`}
                >
                  Admin Login
                </button>
              </div>

              <p className="mt-5 text-sm text-[#597196]">{isAdmin ? 'Administrator access to Shop ERP' : 'Staff access to Shop ERP'}</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#153562]">Email address</label>
                  <input
                    id="email"
                    className="w-full rounded-xl border border-[#cbd8eb] bg-[#f8fafc] px-4 py-3 text-sm text-[#183867] outline-none transition placeholder:text-[#7488a7] focus:border-[#2d62d7] focus:ring-2 focus:ring-blue-100"
                    type="email"
                    autoComplete="email"
                    placeholder={isAdmin ? 'Enter admin email' : 'Enter staff email'}
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#153562]">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      className="w-full rounded-xl border border-[#cbd8eb] bg-[#f8fafc] px-4 py-3 pr-12 text-sm text-[#183867] outline-none transition placeholder:text-[#7488a7] focus:border-[#2d62d7] focus:ring-2 focus:ring-blue-100"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(value => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-[#7b91b1] hover:text-[#285cca]"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  className="mt-2 flex w-full justify-center rounded-xl bg-gradient-to-r from-[#1f467f] to-[#2f66e3] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_14px_rgba(31,70,127,0.22)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? 'Signing in…' : `Login as ${isAdmin ? 'Admin' : 'Staff'}`}
                </button>
              </form>

              {isAdmin && (
                <p className="mt-3 text-center text-xs text-[#587096]">
                  Demo credentials: <span className="font-bold text-[#153562]">admin@shop.com / Admin@123</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

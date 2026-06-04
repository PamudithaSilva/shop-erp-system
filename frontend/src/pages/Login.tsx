import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@shop.com');
  const [password, setPassword] = useState('Admin@123');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-7">
            <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#01696f" />
              <path d="M8 10h14M8 15h14M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="20" r="3" fill="white" />
            </svg>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mini Shop ERP</h1>
              <p className="text-xs text-gray-400">Inventory + Sales</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full justify-center" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
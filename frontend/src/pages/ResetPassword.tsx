import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams]           = useSearchParams();
  const navigate                 = useNavigate();
  const [token]                  = useState(searchParams.get('token') ?? '');
  const [password, setPassword]  = useState('');
  const [confirm, setConfirm]    = useState('');
  const [showPw, setShowPw]      = useState(false);
  const [showCf, setShowCf]      = useState(false);
  const [busy, setBusy]          = useState(false);
  const [success, setSuccess]    = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('No reset token provided');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not reset password');
    } finally {
      setBusy(false);
    }
  };

  /* ── Success state ── */
  if (success) {
    return (
      <main className="min-h-screen bg-[#f4f7fd] text-primary-dark">
        <header className="bg-gradient-to-r from-primary-dark to-primary px-6 py-4 shadow-[0_4px_20px_rgba(24,56,103,0.18)] sm:px-10 lg:px-[8.5%]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold">Shop ERP System</h1>
              <p className="text-xs font-medium text-blue-100">Inventory, sales, and business operations</p>
            </div>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-86px)] items-center justify-center px-5 py-12">
          <div className="w-full max-w-md rounded-3xl bg-white px-8 py-12 text-center shadow-[0_22px_55px_rgba(24,56,103,0.18)]">
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                <CheckCircleIcon className="h-9 w-9 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary-dark">Password Reset!</h2>
            <p className="mt-3 text-sm text-slate-500">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary-dark to-primary px-4 py-3 text-sm font-bold text-white shadow-[0_7px_14px_rgba(36,95,169,0.26)] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Go to Login
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* ── Form ── */
  return (
    <main className="min-h-screen bg-[#f4f7fd] text-primary-dark">
      <header className="bg-gradient-to-r from-primary-dark to-primary px-6 py-4 shadow-[0_4px_20px_rgba(24,56,103,0.18)] sm:px-10 lg:px-[8.5%]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold leading-tight sm:text-[28px]">Shop ERP System</h1>
            <p className="text-xs font-medium text-blue-100 sm:text-sm">Inventory, sales, and business operations</p>
          </div>
          <Link
            to="/login"
            className="rounded-full border border-white/20 bg-white px-6 py-2.5 text-sm font-semibold text-primary-dark shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Back to Login
          </Link>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-86px)] items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white px-8 py-10 shadow-[0_22px_55px_rgba(24,56,103,0.18)]">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-dark to-primary shadow-lg">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold text-primary-dark">Set New Password</h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Choose a strong new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="rp-password" className="mb-2 block text-sm font-semibold text-primary-dark">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="rp-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-primary-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-primary"
                  >
                    {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= level * 4
                            ? level === 1 ? 'bg-red-400'
                            : level === 2 ? 'bg-yellow-400'
                            : 'bg-green-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="rp-confirm" className="mb-2 block text-sm font-semibold text-primary-dark">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="rp-confirm"
                    type={showCf ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-12 text-sm text-primary-dark outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                      confirm && confirm !== password
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(v => !v)}
                    aria-label={showCf ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-primary"
                  >
                    {showCf ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || !password || !confirm}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-dark to-primary px-4 py-3 text-sm font-bold text-white shadow-[0_7px_14px_rgba(36,95,169,0.26)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Resetting…
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

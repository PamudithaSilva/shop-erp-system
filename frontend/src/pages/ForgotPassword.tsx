import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail]         = useState('');
  const [busy, setBusy]           = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResetToken(data.resetToken ?? null);
      toast.success('Reset token generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const copyToken = async () => {
    if (!resetToken) return;
    await navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetLink = resetToken
    ? `${window.location.origin}/reset-password?token=${resetToken}`
    : null;

  return (
    <main className="min-h-screen bg-[#f4f7fd] text-primary-dark">
      {/* Header */}
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
                <KeyIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold text-primary-dark">Forgot Password?</h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Enter your registered email to request a password reset.
            </p>

            {!resetToken ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="fp-email" className="mb-2 block text-sm font-semibold text-primary-dark">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="fp-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-primary-dark outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-dark to-primary px-4 py-3 text-sm font-bold text-white shadow-[0_7px_14px_rgba(36,95,169,0.26)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating…
                    </>
                  ) : (
                    'Generate Reset Token'
                  )}
                </button>

                <Link
                  to="/login"
                  className="mt-1 flex items-center justify-center gap-1 text-sm font-medium text-slate-500 transition hover:text-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Login
                </Link>
              </form>
            ) : (
              /* ── Token display (dev UX) ── */
              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-green-800">✅ Token generated!</p>
                  <p className="text-xs text-green-700">
                    Use this development token to reset your password. In production, the token must be delivered by email.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your Reset Token
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <code className="flex-1 break-all text-xs text-primary-dark">{resetToken}</code>
                    <button
                      type="button"
                      onClick={copyToken}
                      title="Copy token"
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                    >
                      {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {resetLink && (
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-dark to-primary px-4 py-3 text-sm font-bold text-white shadow-[0_7px_14px_rgba(36,95,169,0.26)] transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Reset My Password →
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => { setResetToken(null); setEmail(''); }}
                  className="flex w-full items-center justify-center gap-1 text-sm font-medium text-slate-500 transition hover:text-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Try a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

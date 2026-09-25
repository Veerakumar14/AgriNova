import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#DCFCE7' }}>
              <CheckCircle size={32} style={{ color: '#16A34A' }} />
            </div>
            <h1 className="text-2xl font-extrabold mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Check your email</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>We've sent password reset instructions to <strong>{email}</strong>.</p>
            <Link to="/login" className="btn-primary justify-center w-full py-3">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Reset password</h1>
            <p className="mb-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Email address</label>
                <input type="email" className="input-field" placeholder="you@farm.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading || !email} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="mt-6 flex items-center gap-2 text-sm justify-center" style={{ color: 'var(--muted-foreground)' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp, seedDemoData } from '../store/AppContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // Check stored users
    const stored = localStorage.getItem('agrinova_users');
    const users = stored ? JSON.parse(stored) : [];
    const user = users.find((u: any) => u.email === form.email && u.password === form.password);

    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      // If no farms, seed demo
      const stateStr = localStorage.getItem('agrinova_state');
      const st = stateStr ? JSON.parse(stateStr) : null;
      if (!st?.farms?.length) seedDemoData(dispatch, user.id);
      showToast(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
    } else {
      setError('Invalid email or password. Try demo@agrinova.ai / demo123');
    }
    setLoading(false);
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const demoUser = {
      id: 'demo-user-1', fullName: 'Rajesh Kumar', email: 'demo@agrinova.ai',
      phone: '+91 98765 43210', location: 'Coimbatore, Tamil Nadu',
      farmSize: '12 acres', primaryCrop: 'Tomato', createdAt: new Date().toISOString(),
      onboardingComplete: true, darkMode: false,
      notifications: { email: true, push: true, sms: false },
    };
    dispatch({ type: 'SET_USER', payload: demoUser });
    seedDemoData(dispatch, demoUser.id);
    showToast('Demo mode activated! Exploring Green Valley Farm.');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-end p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2D6A2F 100%)' }}>
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=900&fit=crop&auto=format" alt="Farm field" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Smarter Farming.<br />Better Harvests.</h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>AI-powered insights that turn farm data into actionable decisions for every farmer.</p>
          <div className="grid grid-cols-2 gap-3">
            {[['Crop Health', '92%'], ['Soil Score', '84/100'], ['Water Saved', '28%'], ['Yield Up', '+34%']].map(([label, val]) => (
              <div key={label} className="px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
                <div className="text-xl font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Welcome back</h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sign in to your farm dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Email address</label>
              <input type="email" className="input-field" placeholder="you@farm.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <button onClick={handleDemo} disabled={loading} className="btn-secondary w-full justify-center py-3">
            🌾 Try Demo — Green Valley Farm
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>Create one free</Link>
          </p>
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Demo: demo@agrinova.ai / demo123
          </p>
        </div>
      </div>
    </div>
  );
}

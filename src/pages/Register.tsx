import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp, seedDemoData } from '../store/AppContext';
import { useToast } from '../components/Toast';
import type { User } from '../types';

export default function Register() {
  const { dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', location: '', farmSize: '', primaryCrop: 'Tomato' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const crops = ['Tomato', 'Rice', 'Chili', 'Groundnut', 'Cotton', 'Maize', 'Other'];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const user: User = {
      id: crypto.randomUUID(), fullName: form.fullName, email: form.email,
      phone: form.phone, location: form.location, farmSize: form.farmSize,
      primaryCrop: form.primaryCrop, createdAt: new Date().toISOString(),
      onboardingComplete: false, darkMode: false,
      notifications: { email: true, push: true, sms: false },
    };

    // Store user
    const stored = localStorage.getItem('agrinova_users');
    const users = stored ? JSON.parse(stored) : [];
    users.push({ ...user, password: form.password });
    localStorage.setItem('agrinova_users', JSON.stringify(users));

    dispatch({ type: 'SET_USER', payload: user });
    seedDemoData(dispatch, user.id);
    showToast('Account created successfully!');
    navigate('/onboarding');
    setLoading(false);
  };

  const f = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-end p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2D6A2F 100%)' }}>
        <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=900&fit=crop&auto=format" alt="Farmer" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Your smart farm<br />starts here.</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-base">Join 10,000+ farmers using AI to make better decisions every day.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Create your account</h1>
          <p className="mb-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Rajesh Kumar' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@farm.com' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
              { key: 'location', label: 'Farm Location', type: 'text', placeholder: 'Coimbatore, Tamil Nadu' },
              { key: 'farmSize', label: 'Farm Size (acres)', type: 'text', placeholder: '12' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>
                <input type={type} className={`input-field ${errors[key] ? 'border-red-400' : ''}`} placeholder={placeholder}
                  value={(form as any)[key]} onChange={e => f(key, e.target.value)} />
                {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Primary Crop</label>
              <select className="input-field" value={form.primaryCrop} onChange={e => f('primaryCrop', e.target.value)}>
                {crops.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Min. 6 characters" value={form.password} onChange={e => f('password', e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

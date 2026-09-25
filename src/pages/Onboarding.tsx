import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Check, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import type { Farm, Crop } from '../types';

const steps = ['Farm Details', 'Select Crops', 'Soil Info', 'Preferences', 'Complete'];
const cropOptions = ['Tomato', 'Rice', 'Chili', 'Groundnut', 'Cotton', 'Maize', 'Other'];

export default function Onboarding() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState({ name: '', location: state.user?.location || '', size: '' });
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Tomato']);
  const [soil, setSoil] = useState({ type: 'Red Loamy Soil', ph: '6.7', nitrogen: '72', phosphorus: '64', potassium: '81', moisture: '68' });
  const [prefs, setPrefs] = useState({ irrigation: 'Drip Irrigation', farming: 'Conventional', emailNotif: true, pushNotif: true });

  const soilTypes = ['Red Loamy Soil', 'Black Cotton Soil', 'Sandy Loam', 'Clay Loam', 'Alluvial Soil', 'Laterite Soil'];
  const irrigationMethods = ['Drip Irrigation', 'Sprinkler', 'Flood Irrigation', 'Rain-fed', 'Furrow Irrigation'];
  const farmingTypes = ['Conventional', 'Organic', 'Integrated', 'Precision Agriculture'];

  const toggleCrop = (c: string) => setSelectedCrops(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleFinish = () => {
    const farmId = crypto.randomUUID();
    const newFarm: Farm = {
      id: farmId, userId: state.user!.id,
      name: farm.name || 'My Farm', location: farm.location, size: farm.size,
      sizeUnit: 'acres', irrigationMethod: prefs.irrigation, farmingType: prefs.farming,
      createdAt: new Date().toISOString(),
    };
    const crops: Crop[] = selectedCrops.map((name, i) => ({
      id: crypto.randomUUID(), farmId, name,
      plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      area: '2', health: 85 + Math.floor(Math.random() * 10), status: 'growing',
    }));
    const soilRec = {
      id: crypto.randomUUID(), farmId,
      ph: parseFloat(soil.ph), nitrogen: parseInt(soil.nitrogen),
      phosphorus: parseInt(soil.phosphorus), potassium: parseInt(soil.potassium),
      moisture: parseInt(soil.moisture), soilType: soil.type,
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FARM', payload: newFarm });
    dispatch({ type: 'SET_CURRENT_FARM', payload: farmId });
    crops.forEach(c => dispatch({ type: 'ADD_CROP', payload: c }));
    dispatch({ type: 'ADD_SOIL', payload: soilRec });
    dispatch({ type: 'SET_USER', payload: { ...state.user!, onboardingComplete: true } });
    showToast('Farm profile created successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AgriNova AI</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-0 mb-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'text-white' : i === step ? 'text-white' : 'text-gray-400'}`}
                  style={{ background: i < step ? 'var(--primary)' : i === step ? 'var(--accent)' : 'var(--muted)' }}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-0.5 mx-1" style={{ background: i < step ? 'var(--primary)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Step {step + 1} of {steps.length}</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-fade-in">
          {step === 0 && (
            <>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Set up your farm</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Tell us about your farm so AI can personalize insights for you.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Farm Name</label>
                  <input className="input-field" placeholder="Green Valley Farm" value={farm.name} onChange={e => setFarm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Farm Location</label>
                  <input className="input-field" placeholder="Coimbatore, Tamil Nadu" value={farm.location} onChange={e => setFarm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Farm Size (acres)</label>
                  <input className="input-field" placeholder="12" value={farm.size} onChange={e => setFarm(p => ({ ...p, size: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Select your crops</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Select all crops you currently grow or plan to grow.</p>
              <div className="grid grid-cols-2 gap-3">
                {cropOptions.map(c => {
                  const sel = selectedCrops.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCrop(c)}
                      className="flex items-center gap-3 p-3 rounded-xl border text-sm font-medium text-left transition-all"
                      style={{ background: sel ? 'var(--secondary)' : 'var(--card)', borderColor: sel ? 'var(--primary)' : 'var(--border)', color: sel ? 'var(--primary)' : 'var(--foreground)' }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: sel ? 'var(--primary)' : 'var(--muted)', border: sel ? 'none' : '1px solid var(--border)' }}>
                        {sel && <Check size={12} className="text-white" />}
                      </div>
                      {c}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil information</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Enter your current soil readings for accurate AI recommendations.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Soil Type</label>
                  <select className="input-field" value={soil.type} onChange={e => setSoil(p => ({ ...p, type: e.target.value }))}>
                    {soilTypes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['ph', 'Soil pH (4.0-9.0)'], ['nitrogen', 'Nitrogen (mg/kg)'], ['phosphorus', 'Phosphorus (mg/kg)'], ['potassium', 'Potassium (mg/kg)'], ['moisture', 'Moisture (%)']].map(([k, l]) => (
                    <div key={k}>
                      <label className="block text-sm font-medium mb-1.5">{l}</label>
                      <input type="number" className="input-field" value={(soil as any)[k]} onChange={e => setSoil(p => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Farm preferences</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Customize how AgriNova AI works for your farm.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Irrigation Method</label>
                  <select className="input-field" value={prefs.irrigation} onChange={e => setPrefs(p => ({ ...p, irrigation: e.target.value }))}>
                    {irrigationMethods.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Farming Type</label>
                  <select className="input-field" value={prefs.farming} onChange={e => setPrefs(p => ({ ...p, farming: e.target.value }))}>
                    {farmingTypes.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Notification Preferences</label>
                  <div className="space-y-3">
                    {[['emailNotif', 'Email Notifications'], ['pushNotif', 'Push Notifications']].map(([k, l]) => (
                      <label key={k} className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={(prefs as any)[k]} onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))} />
                          <div className="w-10 h-5 rounded-full transition-colors" style={{ background: (prefs as any)[k] ? 'var(--primary)' : 'var(--muted)' }}>
                            <div className="w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ml-0.5" style={{ transform: (prefs as any)[k] ? 'translateX(20px)' : 'translateX(0)' }} />
                          </div>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--secondary)' }}>
                <Leaf size={36} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Your farm profile is ready.</h2>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}><strong>{farm.name || 'Your Farm'}</strong> has been set up with AI monitoring for:</p>
              <div className="flex flex-wrap gap-2 justify-center my-4">
                {selectedCrops.map(c => <span key={c} className="badge-green">{c}</span>)}
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Your AI advisor is ready to provide crop insights, irrigation recommendations, and weather alerts.</p>
              <button onClick={handleFinish} className="btn-primary w-full justify-center py-3 text-base">
                Enter My Farm <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Footer */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setStep(p => p - 1)} disabled={step === 0} className="btn-ghost" style={{ opacity: step === 0 ? 0.4 : 1 }}>Back</button>
              <button onClick={() => setStep(p => p + 1)} className="btn-primary">
                {step === 3 ? 'Finish Setup' : 'Continue'} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

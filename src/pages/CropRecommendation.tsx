import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Leaf, Sparkles, Plus } from 'lucide-react';
import { calculateCropSuitability } from '../services/aiService';
import type { CropRecommendation } from '../types';

export default function CropRecommendationPage() {
  const { state, currentFarm, latestSoil, dispatch, addNotification } = useApp();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    soilType: latestSoil?.soilType || 'Red Loamy Soil',
    ph: String(latestSoil?.ph || 6.7),
    nitrogen: String(latestSoil?.nitrogen || 72),
    phosphorus: String(latestSoil?.phosphorus || 64),
    potassium: String(latestSoil?.potassium || 81),
    temperature: '29',
    rainfall: '800',
    humidity: '72',
    location: currentFarm?.location || 'Coimbatore, Tamil Nadu',
  });
  const [results, setResults] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const recs = calculateCropSuitability({
      soilType: form.soilType, ph: parseFloat(form.ph), nitrogen: parseInt(form.nitrogen),
      phosphorus: parseInt(form.phosphorus), potassium: parseInt(form.potassium),
      temperature: parseInt(form.temperature), rainfall: parseInt(form.rainfall), humidity: parseInt(form.humidity),
    });
    setResults(recs);
    setLoading(false);
  };

  const handleSave = (crop: CropRecommendation) => {
    if (saved.includes(crop.crop)) return;
    const newCrop = {
      id: crypto.randomUUID(), farmId: currentFarm?.id || '',
      name: crop.crop, plantingDate: new Date().toISOString().split('T')[0],
      expectedHarvest: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      area: '2', health: 90, status: 'planned' as const,
    };
    dispatch({ type: 'ADD_CROP', payload: newCrop });
    setSaved(p => [...p, crop.crop]);
    addNotification('Crop Added', `${crop.crop} has been added to your farm plan.`, 'success');
    showToast(`${crop.crop} added to your farm!`);
  };

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const soilTypes = ['Red Loamy Soil', 'Black Cotton Soil', 'Sandy Loam', 'Clay Loam', 'Alluvial Soil', 'Laterite Soil'];

  const topColor = (i: number) => i === 0 ? 'var(--primary)' : i === 1 ? '#0891B2' : '#7C3AED';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Crop Recommendation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>AI-powered crop suitability analysis based on your soil conditions and climate data.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2 card p-5 h-fit">
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Farm Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Soil Type</label>
              <select className="input-field text-sm" value={form.soilType} onChange={e => f('soilType', e.target.value)}>
                {soilTypes.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Location</label>
              <input className="input-field text-sm" value={form.location} onChange={e => f('location', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['ph', 'Soil pH'], ['nitrogen', 'Nitrogen (mg/kg)'],
                ['phosphorus', 'Phosphorus'], ['potassium', 'Potassium'],
                ['temperature', 'Avg Temp (°C)'], ['rainfall', 'Annual Rain (mm)'],
                ['humidity', 'Humidity (%)'],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{l}</label>
                  <input type="number" step="0.1" className="input-field text-sm" value={(form as any)[k]} onChange={e => f(k, e.target.value)} />
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate AI Recommendations</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {results.length === 0 && !loading && (
            <div className="card p-12 text-center">
              <Leaf size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
              <h3 className="font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Ready to analyze</h3>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Enter your farm parameters and click "Generate AI Recommendations" to see which crops are best suited for your conditions.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>RANKED BY SUITABILITY — {results.length} CROPS ANALYZED</p>
              {results.map((r, i) => (
                <div key={r.crop} className="card p-5 card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: topColor(i), fontFamily: 'Manrope, sans-serif' }}>
                        {i < 3 ? i + 1 : r.crop[0]}
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{r.crop}</h4>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.growingPeriod}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: topColor(i) }}>{r.suitability}%</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Suitability</div>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full mb-3" style={{ background: 'var(--muted)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${r.suitability}%`, background: topColor(i) }} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>Water: </span>{r.waterRequirement}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>Conditions: </span>{r.conditions}
                    </div>
                  </div>

                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{r.reason}</p>

                  <button onClick={() => handleSave(r)} disabled={saved.includes(r.crop)}
                    className={saved.includes(r.crop) ? 'btn-secondary text-xs py-1.5 px-3' : 'btn-primary text-xs py-1.5 px-3'}>
                    {saved.includes(r.crop) ? '✓ Added to Farm' : <><Plus size={13} /> Add to My Farm</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

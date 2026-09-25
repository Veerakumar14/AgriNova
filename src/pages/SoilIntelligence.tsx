import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Sprout, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SoilRecord } from '../types';

function calcSoilHealth(s: SoilRecord) {
  let score = 0;
  score += (s.ph >= 6.0 && s.ph <= 7.5) ? 25 : s.ph >= 5.5 && s.ph <= 8 ? 15 : 5;
  score += s.nitrogen > 80 ? 25 : s.nitrogen > 60 ? 20 : s.nitrogen > 40 ? 12 : 5;
  score += s.phosphorus > 50 ? 20 : s.phosphorus > 30 ? 15 : 8;
  score += s.potassium > 70 ? 20 : s.potassium > 50 ? 15 : 8;
  score += (s.moisture >= 50 && s.moisture <= 75) ? 10 : 5;
  return Math.min(100, score);
}

const defaultForm = { ph: '6.7', nitrogen: '72', phosphorus: '64', potassium: '81', moisture: '68', soilType: 'Red Loamy Soil' };

export default function SoilIntelligence() {
  const { state, dispatch, currentFarm, latestSoil, addNotification } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const soilRecords = state.soilRecords
    .filter(s => s.farmId === currentFarm?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const trendData = soilRecords.slice(0, 14).reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    moisture: r.moisture,
    health: calcSoilHealth(r),
  }));

  const npkData = soilRecords.slice(0, 10).reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    N: r.nitrogen, P: r.phosphorus, K: r.potassium,
  }));

  const current = latestSoil;
  const healthScore = current ? calcSoilHealth(current) : 0;

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const record: SoilRecord = {
      id: editId || crypto.randomUUID(),
      farmId: currentFarm?.id || '',
      ph: parseFloat(form.ph), nitrogen: parseInt(form.nitrogen),
      phosphorus: parseInt(form.phosphorus), potassium: parseInt(form.potassium),
      moisture: parseInt(form.moisture), soilType: form.soilType,
      date: new Date().toISOString(),
      healthScore: calcSoilHealth({ ph: parseFloat(form.ph), nitrogen: parseInt(form.nitrogen), phosphorus: parseInt(form.phosphorus), potassium: parseInt(form.potassium), moisture: parseInt(form.moisture) } as any),
    };
    if (editId) {
      dispatch({ type: 'UPDATE_SOIL', payload: record });
      showToast('Soil reading updated.');
    } else {
      dispatch({ type: 'ADD_SOIL', payload: record });
      addNotification('Soil Reading Added', `New soil reading recorded. Health score: ${record.healthScore}/100.`, 'success');
      showToast('Soil reading saved!');
    }
    setShowForm(false);
    setEditId(null);
    setForm(defaultForm);
    setLoading(false);
  };

  const handleEdit = (r: SoilRecord) => {
    setForm({ ph: String(r.ph), nitrogen: String(r.nitrogen), phosphorus: String(r.phosphorus), potassium: String(r.potassium), moisture: String(r.moisture), soilType: r.soilType });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_SOIL', payload: id });
    showToast('Reading deleted.', 'info');
  };

  const soilTypes = ['Red Loamy Soil', 'Black Cotton Soil', 'Sandy Loam', 'Clay Loam', 'Alluvial Soil', 'Laterite Soil'];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Intelligence</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Monitor NPK levels, pH, moisture, and soil health trends.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }} className="btn-primary">
          <Plus size={16} /> Add Reading
        </button>
      </div>

      {/* Current soil stats */}
      {current ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Soil Health', val: healthScore, unit: '/100', color: healthScore > 75 ? '#16A34A' : '#D97706' },
              { label: 'pH Level', val: current.ph, unit: '', color: '#2D6A2F' },
              { label: 'Nitrogen', val: current.nitrogen, unit: 'mg/kg', color: '#1D4ED8' },
              { label: 'Phosphorus', val: current.phosphorus, unit: 'mg/kg', color: '#7C3AED' },
              { label: 'Potassium', val: current.potassium, unit: 'mg/kg', color: '#D97706' },
              { label: 'Moisture', val: `${current.moisture}%`, unit: '', color: '#0891B2' },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="card p-4">
                <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                <div className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color }}>{val}<span className="text-xs font-medium ml-0.5" style={{ color: 'var(--muted-foreground)' }}>{unit}</span></div>
              </div>
            ))}
          </div>

          {/* Health bar */}
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Health Score</h3>
              <span className={`badge-${healthScore > 75 ? 'green' : healthScore > 55 ? 'amber' : 'red'}`}>
                {healthScore > 75 ? 'Healthy' : healthScore > 55 ? 'Moderate' : 'Poor'}
              </span>
            </div>
            <div className="relative mb-3">
              <div className="w-full h-3 rounded-full" style={{ background: 'var(--muted)' }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${healthScore}%`, background: healthScore > 75 ? '#2D6A2F' : '#D97706' }} />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                <span>Poor (0)</span><span>Moderate (50)</span><span>Healthy (100)</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'pH Status', ok: current.ph >= 6 && current.ph <= 7.5 },
                { label: 'Nitrogen', ok: current.nitrogen > 60 },
                { label: 'Moisture', ok: current.moisture > 55 && current.moisture < 80 },
                { label: 'NPK Balance', ok: current.phosphorus > 40 && current.potassium > 50 },
              ].map(({ label, ok }) => (
                <div key={label} className="text-center p-2 rounded-lg" style={{ background: ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}` }}>
                  <div className="text-sm mb-1">{ok ? '✓' : '!'}</div>
                  <div className="text-xs font-medium" style={{ color: ok ? '#166534' : '#991B1B' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center mb-6">
          <Sprout size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
          <h3 className="font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>No soil readings yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Add your first soil reading to start tracking soil health.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">Add First Soil Reading</button>
        </div>
      )}

      {/* Charts */}
      {trendData.length > 2 && (
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Moisture Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891B2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[40, 90]} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="moisture" stroke="#0891B2" strokeWidth={2} fill="url(#mGrad)" name="Moisture %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>NPK Levels</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={npkData.slice(-7)} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="N" name="Nitrogen" fill="#1D4ED8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="P" name="Phosphorus" fill="#7C3AED" radius={[3, 3, 0, 0]} />
                <Bar dataKey="K" name="Potassium" fill="#D97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      <div className="card p-5">
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Reading History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Date', 'pH', 'N', 'P', 'K', 'Moisture', 'Health', ''].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soilRecords.slice(0, 10).map(r => (
                <tr key={r.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseOver={e => (e.currentTarget as any).style.background = 'var(--secondary)'}
                  onMouseOut={e => (e.currentTarget as any).style.background = 'transparent'}>
                  <td className="py-2.5 px-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-2.5 px-2 font-medium" style={{ color: 'var(--foreground)' }}>{r.ph}</td>
                  <td className="py-2.5 px-2" style={{ color: 'var(--foreground)' }}>{r.nitrogen}</td>
                  <td className="py-2.5 px-2" style={{ color: 'var(--foreground)' }}>{r.phosphorus}</td>
                  <td className="py-2.5 px-2" style={{ color: 'var(--foreground)' }}>{r.potassium}</td>
                  <td className="py-2.5 px-2" style={{ color: 'var(--foreground)' }}>{r.moisture}%</td>
                  <td className="py-2.5 px-2">
                    <span className={`badge-${calcSoilHealth(r) > 75 ? 'green' : calcSoilHealth(r) > 55 ? 'amber' : 'red'}`}>{calcSoilHealth(r)}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:opacity-70" style={{ color: '#DC2626' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{editId ? 'Edit' : 'Add'} Soil Reading</h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Soil Type</label>
                <select className="input-field" value={form.soilType} onChange={e => setForm(p => ({ ...p, soilType: e.target.value }))}>
                  {soilTypes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['ph', 'pH Level'], ['nitrogen', 'Nitrogen (mg/kg)'], ['phosphorus', 'Phosphorus (mg/kg)'], ['potassium', 'Potassium (mg/kg)'], ['moisture', 'Moisture (%)']].map(([k, l]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium mb-1.5">{l}</label>
                    <input type="number" step="0.1" className="input-field" value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? 'Saving...' : 'Save Reading'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

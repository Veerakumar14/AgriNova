import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Tractor, Plus, Edit2, Trash2, X, Leaf, MapPin, Maximize } from 'lucide-react';
import type { Farm, Crop } from '../types';

const statusColors = { growing: 'badge-green', harvested: 'badge-amber', planned: 'badge-green', 'at-risk': 'badge-red' };

function FarmModal({ farm, onSave, onClose }: { farm?: Farm | null; onSave: (f: Partial<Farm>) => void; onClose: () => void }) {
  const { currentFarm } = useApp();
  const [form, setForm] = useState({
    name: farm?.name || '', location: farm?.location || '',
    size: farm?.size || '', sizeUnit: farm?.sizeUnit || 'acres',
    irrigationMethod: farm?.irrigationMethod || 'Drip Irrigation',
    farmingType: farm?.farmingType || 'Conventional',
  });
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{farm ? 'Edit Farm' : 'Add Farm'}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          {[['name', 'Farm Name', 'text', 'Green Valley Farm'], ['location', 'Location', 'text', 'Coimbatore, Tamil Nadu'], ['size', 'Size', 'number', '12']].map(([k, l, t, ph]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1.5">{l}</label>
              <input type={t} className="input-field" placeholder={ph} value={(form as any)[k]} onChange={e => f(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Size Unit</label>
            <select className="input-field" value={form.sizeUnit} onChange={e => f('sizeUnit', e.target.value)}>
              {['acres', 'hectares', 'sq meters'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Irrigation Method</label>
            <select className="input-field" value={form.irrigationMethod} onChange={e => f('irrigationMethod', e.target.value)}>
              {['Drip Irrigation', 'Sprinkler', 'Flood Irrigation', 'Rain-fed', 'Furrow Irrigation'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Farming Type</label>
            <select className="input-field" value={form.farmingType} onChange={e => f('farmingType', e.target.value)}>
              {['Conventional', 'Organic', 'Integrated', 'Precision Agriculture'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary flex-1 justify-center">Save Farm</button>
        </div>
      </div>
    </div>
  );
}

function CropModal({ crop, farmId, onSave, onClose }: { crop?: Crop | null; farmId: string; onSave: (c: Partial<Crop>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: crop?.name || '', plantingDate: crop?.plantingDate || '', expectedHarvest: crop?.expectedHarvest || '',
    area: crop?.area || '', health: String(crop?.health || 85), status: crop?.status || 'growing' as Crop['status'],
  });
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{crop ? 'Edit Crop' : 'Add Crop'}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Crop Name</label>
            <select className="input-field" value={form.name} onChange={e => f('name', e.target.value)}>
              {['Tomato', 'Rice', 'Chili', 'Groundnut', 'Cotton', 'Maize', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {[['plantingDate', 'Planting Date', 'date'], ['expectedHarvest', 'Expected Harvest', 'date'], ['area', 'Area (acres)', 'number']].map(([k, l, t]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1.5">{l}</label>
              <input type={t} className="input-field" value={(form as any)[k]} onChange={e => f(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Health Score (0-100)</label>
            <input type="range" min="0" max="100" className="w-full" value={form.health} onChange={e => f('health', e.target.value)} />
            <div className="text-xs text-right" style={{ color: 'var(--primary)' }}>{form.health}%</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select className="input-field" value={form.status} onChange={e => f('status', e.target.value as any)}>
              {['growing', 'planned', 'harvested', 'at-risk'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={() => onSave({ ...form, health: parseInt(form.health) })} className="btn-primary flex-1 justify-center">Save Crop</button>
        </div>
      </div>
    </div>
  );
}

export default function MyFarm() {
  const { state, dispatch, currentFarm } = useApp();
  const { showToast } = useToast();
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [editFarm, setEditFarm] = useState<Farm | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);

  const crops = state.crops.filter(c => c.farmId === currentFarm?.id);
  const latestSoil = state.soilRecords.filter(s => s.farmId === currentFarm?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const saveFarm = (form: Partial<Farm>) => {
    if (editFarm) {
      dispatch({ type: 'UPDATE_FARM', payload: { ...editFarm, ...form } as Farm });
      showToast('Farm updated.');
    } else {
      const f: Farm = { id: crypto.randomUUID(), userId: state.user!.id, ...form as any, createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_FARM', payload: f });
      dispatch({ type: 'SET_CURRENT_FARM', payload: f.id });
      showToast('Farm added!');
    }
    setShowFarmModal(false); setEditFarm(null);
  };

  const deleteFarm = (id: string) => {
    if (!confirm('Delete this farm and all its data?')) return;
    dispatch({ type: 'DELETE_FARM', payload: id });
    showToast('Farm deleted.', 'info');
  };

  const saveCrop = (form: Partial<Crop>) => {
    if (editCrop) {
      dispatch({ type: 'UPDATE_CROP', payload: { ...editCrop, ...form } as Crop });
      showToast('Crop updated.');
    } else {
      const c: Crop = { id: crypto.randomUUID(), farmId: currentFarm!.id, ...form as any };
      dispatch({ type: 'ADD_CROP', payload: c });
      showToast('Crop added!');
    }
    setShowCropModal(false); setEditCrop(null);
  };

  const deleteCrop = (id: string) => {
    dispatch({ type: 'DELETE_CROP', payload: id });
    showToast('Crop removed.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>My Farm</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Manage your farms, crops, and field information.</p>
        </div>
        <button onClick={() => { setEditFarm(null); setShowFarmModal(true); }} className="btn-primary">
          <Plus size={16} /> Add Farm
        </button>
      </div>

      {/* Farms */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {state.farms.filter(f => f.userId === state.user?.id).map(farm => (
          <div key={farm.id} className={`card p-5 transition-all ${farm.id === currentFarm?.id ? 'border-2' : ''}`}
            style={{ borderColor: farm.id === currentFarm?.id ? 'var(--primary)' : 'var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: 'var(--primary)' }}>{farm.name[0]}</div>
                <div>
                  <div className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{farm.name}</div>
                  <div className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}><MapPin size={10} />{farm.location}</div>
                </div>
              </div>
              {farm.id === currentFarm?.id && <span className="badge-green">Active</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[['Size', `${farm.size} ${farm.sizeUnit}`], ['Type', farm.farmingType], ['Irrigation', farm.irrigationMethod], ['Crops', String(state.crops.filter(c => c.farmId === farm.id).length)]].map(([k, v]) => (
                <div key={k} className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k}</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => dispatch({ type: 'SET_CURRENT_FARM', payload: farm.id })} className="btn-secondary flex-1 text-xs py-1.5">Select</button>
              <button onClick={() => { setEditFarm(farm); setShowFarmModal(true); }} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
              <button onClick={() => deleteFarm(farm.id)} className="btn-ghost p-1.5" style={{ color: '#DC2626' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        {state.farms.filter(f => f.userId === state.user?.id).length === 0 && (
          <div className="col-span-3 card p-12 text-center">
            <Tractor size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
            <h3 className="font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>No farms yet</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Add your first farm to start tracking.</p>
            <button onClick={() => setShowFarmModal(true)} className="btn-primary mx-auto">Add Your First Farm</button>
          </div>
        )}
      </div>

      {/* Crops */}
      {currentFarm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Crops — {currentFarm.name}</h3>
            <button onClick={() => { setEditCrop(null); setShowCropModal(true); }} className="btn-primary text-xs py-1.5 px-3">
              <Plus size={13} /> Add Crop
            </button>
          </div>
          {crops.length === 0 ? (
            <div className="text-center py-10">
              <Leaf size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 8px' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>No crops added</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Start tracking your crops for AI recommendations</p>
              <button onClick={() => setShowCropModal(true)} className="btn-primary mx-auto text-sm">Add Crop</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Crop', 'Planted', 'Harvest', 'Area', 'Health', 'Status', ''].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crops.map(crop => (
                    <tr key={crop.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--primary)' }}>{crop.name[0]}</div>
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{crop.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{crop.plantingDate}</td>
                      <td className="py-3 px-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{crop.expectedHarvest}</td>
                      <td className="py-3 px-2 text-xs" style={{ color: 'var(--foreground)' }}>{crop.area} ac</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${crop.health}%`, background: crop.health > 80 ? '#16A34A' : '#D97706' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: crop.health > 80 ? '#16A34A' : '#D97706' }}>{crop.health}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2"><span className={statusColors[crop.status]}>{crop.status}</span></td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditCrop(crop); setShowCropModal(true); }} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}><Edit2 size={13} /></button>
                          <button onClick={() => deleteCrop(crop.id)} className="p-1 rounded hover:opacity-70" style={{ color: '#DC2626' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Soil summary */}
      {latestSoil && (
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Latest Soil Status</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              ['pH', latestSoil.ph, ''],
              ['N', latestSoil.nitrogen, 'mg/kg'],
              ['P', latestSoil.phosphorus, 'mg/kg'],
              ['K', latestSoil.potassium, 'mg/kg'],
              ['Moisture', `${latestSoil.moisture}`, '%'],
              ['Type', latestSoil.soilType.split(' ')[0], ''],
            ].map(([k, v, u]) => (
              <div key={k as string} className="text-center p-3 rounded-xl" style={{ background: 'var(--secondary)' }}>
                <div className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{k}</div>
                <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{v}<span className="text-xs">{u}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFarmModal && <FarmModal farm={editFarm} onSave={saveFarm} onClose={() => { setShowFarmModal(false); setEditFarm(null); }} />}
      {showCropModal && currentFarm && <CropModal crop={editCrop} farmId={currentFarm.id} onSave={saveCrop} onClose={() => { setShowCropModal(false); setEditCrop(null); }} />}
    </div>
  );
}

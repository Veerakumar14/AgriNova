import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Droplets, Clock, CheckCircle, X, Calendar } from 'lucide-react';
import { calculateIrrigation } from '../services/aiService';
import { generateWeatherData } from '../services/demoData';
import type { IrrigationRecommendation } from '../types';

export default function Irrigation() {
  const { state, dispatch, currentFarm, latestSoil, farmCrops, addNotification } = useApp();
  const { showToast } = useToast();
  const [scheduled, setScheduled] = useState<string | null>(null);

  const weather = useMemo(() => generateWeatherData(currentFarm?.location || 'Coimbatore'), [currentFarm?.location]);
  const primaryCrop = farmCrops[0]?.name || 'Tomato';

  const rec = useMemo(() => calculateIrrigation(
    latestSoil?.moisture || 68,
    primaryCrop,
    weather.rainProbability,
    weather.temperature,
  ), [latestSoil, primaryCrop, weather]);

  const history = state.irrigationRecs.filter(r => r.farmId === currentFarm?.id);

  const handleApply = async () => {
    const id = crypto.randomUUID();
    const newRec: IrrigationRecommendation = {
      id, farmId: currentFarm?.id || '',
      currentMoisture: rec.currentMoisture, targetMoisture: rec.targetMoisture,
      rainProbability: rec.rainProbability, recommendedDuration: rec.duration,
      bestTime: rec.bestTime, status: 'completed', createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_IRRIGATION', payload: newRec });
    addNotification('Irrigation Applied', `${rec.duration} minutes of irrigation applied to ${currentFarm?.name || 'your farm'}.`, 'success');
    showToast('Irrigation applied and logged!');
  };

  const handleSchedule = () => {
    const id = crypto.randomUUID();
    const newRec: IrrigationRecommendation = {
      id, farmId: currentFarm?.id || '',
      currentMoisture: rec.currentMoisture, targetMoisture: rec.targetMoisture,
      rainProbability: rec.rainProbability, recommendedDuration: rec.duration,
      bestTime: rec.bestTime, status: 'scheduled',
      scheduledAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_IRRIGATION', payload: newRec });
    setScheduled(id);
    addNotification('Irrigation Scheduled', `Drip irrigation scheduled for ${rec.bestTime} — ${rec.duration} minutes for ${primaryCrop}.`, 'success');
    showToast(`Irrigation scheduled for ${rec.bestTime}`);
  };

  const handleDismiss = () => {
    const id = crypto.randomUUID();
    const newRec: IrrigationRecommendation = {
      id, farmId: currentFarm?.id || '',
      currentMoisture: rec.currentMoisture, targetMoisture: rec.targetMoisture,
      rainProbability: rec.rainProbability, recommendedDuration: rec.duration,
      bestTime: rec.bestTime, status: 'dismissed', createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_IRRIGATION', payload: newRec });
    showToast('Recommendation dismissed.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Smart Irrigation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>AI-calculated irrigation recommendations based on soil moisture, weather, and crop needs.</p>
      </div>

      {/* Main recommendation */}
      <div className="card p-6 mb-6" style={{ border: rec.recommended ? '2px solid #2D6A2F' : '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: rec.recommended ? 'var(--secondary)' : '#F0FDF4' }}>
            <Droplets size={24} style={{ color: rec.recommended ? 'var(--primary)' : '#16A34A' }} />
          </div>
          <div>
            <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>AI RECOMMENDATION</div>
            <h2 className="text-xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>
              {rec.recommended ? '🌊 IRRIGATION RECOMMENDED' : '✅ NO IRRIGATION NEEDED'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Current Moisture', val: `${rec.currentMoisture}%`, color: rec.currentMoisture < 65 ? '#DC2626' : '#16A34A' },
            { label: 'Target Moisture', val: `${rec.targetMoisture}%`, color: '#2D6A2F' },
            { label: 'Rain Probability', val: `${rec.rainProbability}%`, color: '#7C3AED' },
            { label: 'Recommended', val: rec.recommended ? `${rec.duration} min` : 'Skip', color: '#D97706' },
          ].map(({ label, val, color }) => (
            <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--secondary)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
              <div className="text-lg font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color }}>{val}</div>
            </div>
          ))}
        </div>

        {rec.recommended && (
          <div className="p-4 rounded-xl mb-5" style={{ background: 'var(--secondary)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Best Time: {rec.bestTime}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Duration: {rec.duration} minutes · {currentFarm?.irrigationMethod || 'Drip Irrigation'} · {primaryCrop}</p>
          </div>
        )}

        <div className="p-4 rounded-xl mb-5 text-sm leading-relaxed" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <span className="font-semibold" style={{ color: '#166534' }}>AI Analysis: </span>
          <span style={{ color: '#14532D' }}>{rec.reason}</span>
        </div>

        {!scheduled ? (
          <div className="flex flex-wrap gap-3">
            {rec.recommended && (
              <>
                <button onClick={handleApply} className="btn-primary">
                  <CheckCircle size={16} /> Apply Now
                </button>
                <button onClick={handleSchedule} className="btn-secondary">
                  <Calendar size={16} /> Schedule for {rec.bestTime.split(' – ')[0]}
                </button>
              </>
            )}
            <button onClick={handleDismiss} className="btn-ghost">
              <X size={16} /> {rec.recommended ? 'Dismiss' : 'Acknowledge'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle size={18} style={{ color: '#16A34A' }} />
            <span className="text-sm font-semibold" style={{ color: '#166534' }}>Irrigation scheduled for {rec.bestTime}</span>
          </div>
        )}
      </div>

      {/* Moisture gauge */}
      <div className="card p-5 mb-6">
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Moisture Status</h3>
        <div className="relative h-6 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rec.currentMoisture}%`, background: rec.currentMoisture < 55 ? '#DC2626' : rec.currentMoisture < 65 ? '#D97706' : '#2D6A2F' }} />
          <div className="absolute top-0 h-full w-0.5" style={{ left: `${rec.targetMoisture}%`, background: '#0891B2' }} />
        </div>
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
          <span>Dry (0%)</span>
          <span style={{ color: '#0891B2' }}>Target: {rec.targetMoisture}%</span>
          <span>Saturated (100%)</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[['Dry (<40%)', '#DC2626'], ['Optimal (40-75%)', '#2D6A2F'], ['Saturated (>75%)', '#0891B2']].map(([label, color]) => (
            <div key={label} className="text-center p-2 rounded-lg text-xs" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card p-5">
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Irrigation History</h3>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Droplets size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 8px' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No irrigation history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 8).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: 'var(--secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.status === 'completed' ? '#DCFCE7' : r.status === 'scheduled' ? '#EFF6FF' : '#F3F4F6' }}>
                  <Droplets size={14} style={{ color: r.status === 'completed' ? '#16A34A' : r.status === 'scheduled' ? '#2563EB' : '#6B7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {r.recommendedDuration} min · {r.bestTime}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Moisture: {r.currentMoisture}% → {r.targetMoisture}% · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span className={`badge-${r.status === 'completed' ? 'green' : r.status === 'scheduled' ? 'amber' : 'red'} flex-shrink-0`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

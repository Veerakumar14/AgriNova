import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { generateAnalyticsData } from '../services/demoData';

const ranges = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '1 Year', days: 365 },
];

function Delta({ val }: { val: number }) {
  if (val > 0) return <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#16A34A' }}><TrendingUp size={11} />+{val}%</span>;
  if (val < 0) return <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#DC2626' }}><TrendingDown size={11} />{val}%</span>;
  return <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}><Minus size={11} />0%</span>;
}

export default function Analytics() {
  const { currentFarm, farmCrops, latestSoil } = useApp();
  const [range, setRange] = useState(30);

  const data = useMemo(() => generateAnalyticsData(range), [range]);

  // Thin data for longer ranges
  const chartData = range <= 30 ? data : data.filter((_, i) => i % Math.floor(range / 30) === 0);

  const current = data.slice(-Math.floor(data.length / 2));
  const prev = data.slice(0, Math.floor(data.length / 2));

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const currentCrop = avg(current.map(d => d.cropHealth));
  const prevCrop = avg(prev.map(d => d.cropHealth));
  const currentWater = avg(current.map(d => d.waterUsage));
  const prevWater = avg(prev.map(d => d.waterUsage));
  const currentSoil = avg(current.map(d => d.soilHealth));
  const prevSoil = avg(prev.map(d => d.soilHealth));
  const currentFarmH = avg(current.map(d => d.farmHealth));
  const prevFarmH = avg(prev.map(d => d.farmHealth));

  const cropDelta = currentCrop - prevCrop;
  const waterDelta = currentWater - prevWater;
  const soilDelta = currentSoil - prevSoil;
  const farmDelta = currentFarmH - prevFarmH;

  const aiSummary = () => {
    const parts = [];
    if (cropDelta > 0) parts.push(`Crop health improved by ${cropDelta}%`);
    else if (cropDelta < 0) parts.push(`Crop health declined by ${Math.abs(cropDelta)}%`);
    if (waterDelta < 0) parts.push(`water usage decreased by ${Math.abs(waterDelta)} L`);
    else if (waterDelta > 0) parts.push(`water usage increased by ${waterDelta} L`);
    if (soilDelta > 0) parts.push(`soil health improved by ${soilDelta}%`);
    if (parts.length === 0) return 'Farm metrics are stable across all indicators. Continue current management practices.';
    return parts.join(', ') + ` during the selected period. ${farmDelta > 0 ? 'Overall farm performance is on an upward trend.' : farmDelta < 0 ? 'Consider reviewing management practices for improvement.' : 'Farm health remains stable.'}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Farm Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{currentFarm?.name || 'Your farm'} · Performance overview</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--secondary)' }}>
          {ranges.map(r => (
            <button key={r.days} onClick={() => setRange(r.days)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: range === r.days ? 'var(--card)' : 'transparent', color: range === r.days ? 'var(--primary)' : 'var(--muted-foreground)', boxShadow: range === r.days ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Crop Health', val: `${currentCrop}%`, delta: cropDelta, color: '#2D6A2F' },
          { label: 'Water Usage', val: `${currentWater}L`, delta: -Math.abs(waterDelta), color: '#0891B2', invert: true },
          { label: 'Soil Health', val: `${currentSoil}%`, delta: soilDelta, color: '#7C3AED' },
          { label: 'Farm Health', val: `${currentFarmH}%`, delta: farmDelta, color: '#D97706' },
        ].map(({ label, val, delta, color, invert }) => (
          <div key={label} className="card p-4">
            <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            <div className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color }}>{val}</div>
            <Delta val={invert ? -delta : delta} />
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>vs previous period</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Crop & Farm Health</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="cropHealth" name="Crop Health" stroke="#2D6A2F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="farmHealth" name="Farm Health" stroke="#D97706" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Water Usage (Liters)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891B2" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="waterUsage" name="Water (L)" stroke="#0891B2" strokeWidth={2} fill="url(#waterGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Health Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="soilHealth" name="Soil Health %" stroke="#7C3AED" strokeWidth={2} fill="url(#soilGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Crop Health by Crop</h3>
          <div className="space-y-3">
            {farmCrops.length > 0 ? farmCrops.map(c => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--foreground)' }}>{c.name}</span>
                  <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: c.health > 80 ? '#16A34A' : '#D97706' }}>{c.health}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${c.health}%`, background: c.health > 80 ? '#2D6A2F' : '#D97706' }} />
                </div>
              </div>
            )) : (
              <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)' }}>No crops to display</p>
            )}
          </div>
        </div>
      </div>

      {/* AI summary */}
      <div className="card p-5" style={{ border: '1px solid var(--primary)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <BarChart3 size={14} className="text-white" />
          </div>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AI Farm Summary</h3>
          <span className="badge-green ml-auto">Generated</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>"{aiSummary()}"</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {farmCrops.map(c => (
            <span key={c.id} className="badge-green">{c.name}: {c.health}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Droplets, Thermometer, Cloud, Sprout, Activity, Bot, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Leaf } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { generateWeatherData } from '../services/demoData';

function StatCard({ icon: Icon, label, value, unit, color, trend }: any) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: trend >= 0 ? '#16A34A' : '#DC2626' }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{value}<span className="text-sm font-medium ml-1" style={{ color: 'var(--muted-foreground)' }}>{unit}</span></div>
      <div className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  const data = [{ name: 'health', value: score, fill: score > 80 ? '#2D6A2F' : score > 60 ? '#D97706' : '#DC2626' }];
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} data={data}>
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'var(--muted)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-4xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{score}</div>
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Farm Health Score</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, currentFarm, latestSoil, farmCrops } = useApp();
  const user = state.user!;

  const weather = useMemo(() => generateWeatherData(currentFarm?.location || 'Coimbatore'), [currentFarm?.location]);

  const farmHealth = useMemo(() => {
    const cropHealth = farmCrops.length > 0 ? farmCrops.reduce((a, c) => a + c.health, 0) / farmCrops.length : 85;
    const soilHealth = latestSoil ? Math.round(
      ((latestSoil.ph >= 6 && latestSoil.ph <= 7.5 ? 25 : 15) +
       (latestSoil.nitrogen > 60 ? 25 : 15) +
       (latestSoil.moisture > 55 && latestSoil.moisture < 80 ? 25 : 15) +
       (latestSoil.potassium > 60 ? 25 : 15))
    ) : 80;
    const weatherScore = weather.rainProbability > 70 ? 80 : weather.temperature < 35 ? 90 : 85;
    const waterScore = latestSoil ? (latestSoil.moisture > 60 ? 90 : 75) : 85;
    return Math.round(cropHealth * 0.35 + soilHealth * 0.30 + weatherScore * 0.20 + waterScore * 0.15);
  }, [farmCrops, latestSoil, weather]);

  const soilTrend = useMemo(() => {
    const records = state.soilRecords.filter(s => s.farmId === currentFarm?.id).slice(-7);
    return records.map(r => ({ date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), moisture: r.moisture, health: r.healthScore || 80 }));
  }, [state.soilRecords, currentFarm]);

  const unreadNotifs = state.notifications.filter(n => !n.read && n.userId === user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{greeting}, {user.fullName.split(' ')[0]} 🌾</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {currentFarm ? `${currentFarm.name} · ${currentFarm.location}` : 'No farm selected'}
            {' · '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/ai-advisor" className="btn-primary text-sm hidden sm:flex">
          <Bot size={16} /> Ask AI Advisor
        </Link>
      </div>

      {/* Alerts */}
      {unreadNotifs.filter(n => n.type === 'warning' || n.type === 'alert').slice(0, 1).map(n => (
        <div key={n.id} className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold" style={{ color: '#92400E' }}>{n.title}: </span>
            <span className="text-sm" style={{ color: '#78350F' }}>{n.message}</span>
          </div>
          <Link to="/notifications" className="text-xs font-semibold flex-shrink-0" style={{ color: '#D97706' }}>View →</Link>
        </div>
      ))}

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Activity} label="Farm Health" value={farmHealth} unit="/100" color="#2D6A2F" trend={5} />
        <StatCard icon={Leaf} label="Avg Crop Health" value={farmCrops.length > 0 ? Math.round(farmCrops.reduce((a, c) => a + c.health, 0) / farmCrops.length) : 85} unit="%" color="#4A9E4C" trend={3} />
        <StatCard icon={Droplets} label="Soil Moisture" value={latestSoil?.moisture || 68} unit="%" color="#0891B2" trend={-2} />
        <StatCard icon={Thermometer} label="Temperature" value={weather.temperature} unit="°C" color="#D97706" />
        <StatCard icon={Cloud} label="Rain Probability" value={weather.rainProbability} unit="%" color="#7C3AED" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Farm health gauge */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Farm Health Score</h3>
            <span className={`badge-${farmHealth > 80 ? 'green' : farmHealth > 60 ? 'amber' : 'red'}`}>
              {farmHealth > 80 ? 'Excellent' : farmHealth > 60 ? 'Good' : 'Needs Attention'}
            </span>
          </div>
          <HealthGauge score={farmHealth} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Crop Health', val: farmCrops.length > 0 ? Math.round(farmCrops.reduce((a, c) => a + c.health, 0) / farmCrops.length) : 85 },
              { label: 'Soil Health', val: latestSoil ? Math.min(100, Math.round((latestSoil.nitrogen / 80) * 30 + (latestSoil.potassium / 80) * 30 + 40)) : 80 },
              { label: 'Weather', val: Math.round(weather.rainProbability > 70 ? 80 : 90) },
              { label: 'Water', val: latestSoil ? (latestSoil.moisture > 60 ? 90 : 70) : 85 },
            ].map(({ label, val }) => (
              <div key={label} className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{val}%</div>
                <div className="w-full h-1 rounded-full mt-1" style={{ background: 'var(--border)' }}>
                  <div className="h-1 rounded-full transition-all" style={{ width: `${val}%`, background: val > 80 ? '#2D6A2F' : val > 60 ? '#D97706' : '#DC2626' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soil trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Soil Moisture Trend</h3>
            <Link to="/soil" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>View All →</Link>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={soilTrend} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891B2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={[50, 90]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="moisture" stroke="#0891B2" strokeWidth={2} fill="url(#moistureGrad)" name="Moisture %" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[['pH', latestSoil?.ph || 6.7], ['Nitrogen', latestSoil?.nitrogen || 72], ['Moisture', `${latestSoil?.moisture || 68}%`]].map(([k, v]) => (
              <div key={k as string} className="text-center p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k}</div>
                <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Crops */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Active Crops</h3>
            <Link to="/my-farm" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Manage →</Link>
          </div>
          {farmCrops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sprout size={32} style={{ color: 'var(--muted-foreground)', marginBottom: 8 }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No crops added yet</p>
              <Link to="/my-farm" className="mt-3 text-xs font-semibold" style={{ color: 'var(--primary)' }}>Add Crop</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {farmCrops.slice(0, 4).map(crop => (
                <div key={crop.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white" style={{ background: 'var(--primary)' }}>
                    {crop.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{crop.name}</span>
                      <span className="text-xs font-bold" style={{ color: crop.health > 80 ? '#16A34A' : crop.health > 60 ? '#D97706' : '#DC2626' }}>{crop.health}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${crop.health}%`, background: crop.health > 80 ? '#2D6A2F' : crop.health > 60 ? '#D97706' : '#DC2626' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/ai-advisor', icon: Bot, label: 'AI Advisor', sub: 'Ask a question', color: '#2D6A2F' },
          { to: '/crop-doctor', icon: Sprout, label: 'Crop Doctor', sub: 'Analyze crop', color: '#DC2626' },
          { to: '/irrigation', icon: Droplets, label: 'Irrigation', sub: 'Smart schedule', color: '#0891B2' },
          { to: '/crop-recommendation', icon: Leaf, label: 'Crop Advisor', sub: 'Find best crops', color: '#D97706' },
        ].map(({ to, icon: Icon, label, sub, color }) => (
          <Link key={to} to={to} className="card card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{label}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Weather + AI insight row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Today's Weather</h3>
            <Link to="/weather" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Full Forecast →</Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <div className="text-5xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{weather.temperature}°</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{weather.condition}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{currentFarm?.location || 'Coimbatore, TN'}</div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {[['Humidity', `${weather.humidity}%`], ['Wind', `${weather.windSpeed} km/h`], ['Rain', `${weather.rainProbability}%`], ['UV Index', weather.uvIndex]].map(([k, v]) => (
                <div key={k as string} className="p-2 rounded-lg" style={{ background: 'var(--secondary)' }}>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k}</div>
                  <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weather.forecast.slice(0, 5).map((f, i) => (
              <div key={i} className="flex-shrink-0 text-center p-2 rounded-lg min-w-[56px]" style={{ background: 'var(--secondary)' }}>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{i === 0 ? 'Today' : new Date(f.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                <div className="text-sm font-bold mt-1" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{f.tempHigh}°</div>
                <div className="text-xs" style={{ color: '#0891B2' }}>{f.rainProbability}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Bot size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AI Farm Insights</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: Droplets, color: '#0891B2', text: latestSoil && latestSoil.moisture < 65 ? `Soil moisture is ${latestSoil.moisture}% — below optimal. Consider irrigation this evening.` : `Soil moisture is at ${latestSoil?.moisture || 68}% — within optimal range for current crops.` },
              { icon: Cloud, color: '#7C3AED', text: `Rain probability is ${weather.rainProbability}%. ${weather.rainProbability < 30 ? 'Stick to scheduled irrigation plan.' : 'Consider holding off on irrigation today.'}` },
              { icon: Leaf, color: '#16A34A', text: `${farmCrops.length} active crops monitored. ${farmCrops.filter(c => c.health > 80).length} crops in excellent health.` },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--secondary)' }}>
                <Icon size={16} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{text}</p>
              </div>
            ))}
          </div>
          <Link to="/ai-advisor" className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            Ask AI for more insights <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

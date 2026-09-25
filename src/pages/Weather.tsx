import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Cloud, Droplets, Wind, Eye, Thermometer, Sun } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateWeatherData } from '../services/demoData';

const conditionEmoji: Record<string, string> = {
  'Partly Cloudy': '⛅', 'Sunny': '☀️', 'Overcast': '☁️', 'Light Rain': '🌧️', 'Clear': '🌤️',
};

export default function Weather() {
  const { currentFarm } = useApp();
  const weather = useMemo(() => generateWeatherData(currentFarm?.location || 'Coimbatore, Tamil Nadu'), [currentFarm?.location]);

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temp: weather.temperature + Math.round(Math.sin((i - 6) * Math.PI / 12) * 5 + (Math.random() - 0.5) * 2),
    rain: Math.max(0, weather.rainProbability + Math.round((Math.random() - 0.5) * 20)),
  }));

  const insights = [
    { icon: Droplets, color: '#0891B2', title: 'Irrigation Advisory', text: weather.rainProbability < 30 ? `Rain probability is only ${weather.rainProbability}%. Stick to your scheduled irrigation plan.` : `Rain probability is ${weather.rainProbability}%. Consider delaying or reducing irrigation.` },
    { icon: Thermometer, color: '#D97706', title: 'Temperature Alert', text: weather.temperature > 35 ? 'High temperature (>35°C). Avoid midday pesticide application. Increase irrigation frequency.' : `Temperature at ${weather.temperature}°C is within optimal range for most crops.` },
    { icon: Wind, color: '#7C3AED', title: 'Wind Advisory', text: weather.windSpeed > 20 ? `High winds (${weather.windSpeed} km/h). Avoid spraying pesticides or herbicides today.` : `Wind speed is ${weather.windSpeed} km/h — safe for spraying and field operations.` },
    { icon: Sun, color: '#F59E0B', title: 'UV Index', text: weather.uvIndex >= 7 ? `UV Index is ${weather.uvIndex} (High). Wear protective gear during field work. Schedule operations before 10 AM or after 4 PM.` : `UV Index is ${weather.uvIndex} — moderate. Normal field operations are safe.` },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Weather Intelligence</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{currentFarm?.location || 'Coimbatore, Tamil Nadu'} · Updated just now</p>
      </div>

      {/* Current weather */}
      <div className="card p-6 mb-5" style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2D6A2F 100%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-sm opacity-80 mb-1">{currentFarm?.location || 'Coimbatore, Tamil Nadu'}</div>
            <div className="text-7xl font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{weather.temperature}°</div>
            <div className="text-white text-lg mt-1 opacity-90">{conditionEmoji[weather.condition]} {weather.condition}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Droplets, label: 'Humidity', val: `${weather.humidity}%` },
              { icon: Wind, label: 'Wind', val: `${weather.windSpeed} km/h` },
              { icon: Cloud, label: 'Rain', val: `${weather.rainProbability}%` },
              { icon: Eye, label: 'Visibility', val: `${weather.visibility} km` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="text-center px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Icon size={14} className="text-white opacity-70 mx-auto mb-1" />
                <div className="text-white font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>{val}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly temp chart */}
      <div className="card p-5 mb-5">
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>24-Hour Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={hourlyData.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="temp" stroke="#D97706" strokeWidth={2} fill="url(#tempGrad)" name="Temp °C" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 7-day forecast */}
      <div className="card p-5 mb-5">
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>7-Day Forecast</h3>
        <div className="space-y-2">
          {weather.forecast.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors" style={{ background: i === 0 ? 'var(--secondary)' : 'transparent' }}
              onMouseOver={e => i !== 0 && ((e.currentTarget as any).style.background = 'var(--muted)')}
              onMouseOut={e => i !== 0 && ((e.currentTarget as any).style.background = 'transparent')}>
              <div className="w-20 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {i === 0 ? 'Today' : new Date(f.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xl w-8">{conditionEmoji[f.condition] || '🌤️'}</div>
              <div className="flex-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{f.condition}</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: '#0891B2' }}>
                <Droplets size={11} />{f.rainProbability}%
              </div>
              <div className="text-sm font-bold w-24 text-right" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>
                {f.tempHigh}° / {f.tempLow}°
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming insights */}
      <div>
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Farming Impact Analysis</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {insights.map(({ icon: Icon, color, title, text }) => (
            <div key={title} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{title}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

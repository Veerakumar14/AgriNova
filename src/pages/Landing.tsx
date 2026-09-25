import { Link } from 'react-router-dom';
import { Leaf, Bot, Droplets, Cloud, Sprout, BarChart3, Scan, ChevronRight, ArrowRight, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(248,247,244,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AgriNova AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How It Works', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium transition-colors" style={{ color: 'var(--muted-foreground)' }}
                onMouseOver={e => (e.target as HTMLElement).style.color = 'var(--foreground)'}
                onMouseOut={e => (e.target as HTMLElement).style.color = 'var(--muted-foreground)'}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium hidden sm:block" style={{ color: 'var(--foreground)' }}>Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2D6A2F 50%, #3D7F40 100%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #5BB85E 0%, transparent 50%), radial-gradient(circle at 80% 20%, #A8D5A2 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse-dot" />
              AI-Powered Smart Farming Platform
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Turn Farm Data Into<br />
              <span style={{ color: '#A8D5A2' }}>Smarter Decisions.</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              AI-powered insights for healthier crops, smarter irrigation, and more efficient farming. Real-time data. Actionable recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="flex items-center gap-2 font-bold px-6 py-3.5 rounded-xl text-sm transition-all" style={{ background: 'white', color: 'var(--primary)' }}>
                Analyze My Farm <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="flex items-center gap-2 font-semibold px-6 py-3.5 rounded-xl text-sm transition-all" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                Explore AI Assistant <Bot size={16} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[['10K+', 'Active Farmers'], ['98%', 'Accuracy Rate'], ['3x', 'Yield Improvement']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{num}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Central farm image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=500&fit=crop&auto=format" alt="Agricultural field" className="w-full h-full object-cover" style={{ maxHeight: 380 }} />
                <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(to top, rgba(26,61,28,0.6) 0%, transparent 50%)' }} />
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="px-3 py-2 rounded-xl shadow-xl text-xs font-semibold" style={{ background: 'white', color: 'var(--primary)' }}>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 10, marginBottom: 2 }}>Crop Health</div>
                  <div className="text-lg font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16A34A' }}>92%</div>
                </div>
              </div>
              <div className="absolute -top-4 right-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="px-3 py-2 rounded-xl shadow-xl text-xs" style={{ background: 'white' }}>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 10, marginBottom: 2 }}>Soil Moisture</div>
                  <div className="text-lg font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#2563EB' }}>68%</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="px-3 py-2 rounded-xl shadow-xl" style={{ background: 'white' }}>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 10, marginBottom: 2 }}>Rain Probability</div>
                  <div className="text-lg font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: '#D97706' }}>18%</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="px-3 py-2 rounded-xl shadow-xl flex items-center gap-2" style={{ background: 'var(--primary)' }}>
                  <Bot size={14} className="text-white" />
                  <div>
                    <div className="text-white text-xs font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AI Insight</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>Ready</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data flow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 flex flex-col gap-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {['SOIL', 'WEATHER', 'CROP', 'AI', 'ACTION'].map((item, i) => (
                <div key={item} className="flex flex-col items-center">
                  <div className="px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>{item}</div>
                  {i < 4 && <div className="w-px h-2" style={{ background: 'rgba(255,255,255,0.3)' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color: 'var(--primary)' }}>FEATURES</div>
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Everything your farm needs</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>A complete AI-powered toolkit that transforms raw farm data into actionable insights and real results.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Bot, title: 'AI Farm Advisor', desc: 'Conversational AI that knows your crops, soil, and weather. Get instant, context-aware recommendations.', color: '#2D6A2F' },
            { icon: Sprout, title: 'Soil Intelligence', desc: 'Track NPK levels, pH, and moisture trends. Get AI-calculated soil health scores and fertilizer advice.', color: '#0369A1' },
            { icon: Cloud, title: 'Weather Intelligence', desc: '7-day forecasts tailored to your farm location with farming-specific impact analysis.', color: '#7C3AED' },
            { icon: Droplets, title: 'Smart Irrigation', desc: 'Calculate precise irrigation needs based on soil moisture, weather, and crop water requirements.', color: '#0891B2' },
            { icon: Scan, title: 'AI Crop Doctor', desc: 'Upload a photo of your crop. Get instant disease detection with confidence scores and treatment plans.', color: '#DC2626' },
            { icon: BarChart3, title: 'Crop Recommendation', desc: 'Input your soil and climate data. Get AI-ranked crop suitability scores with growing requirements.', color: '#D97706' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card card-hover p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                Learn more <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20" style={{ background: 'var(--secondary)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color: 'var(--primary)' }}>HOW IT WORKS</div>
            <h2 className="text-4xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>From data to harvest</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Set Up Your Farm', desc: 'Enter your farm details, crops, and soil information in minutes.' },
              { step: '02', title: 'AI Analyzes Data', desc: 'Our AI engine processes soil, weather, and crop data in real-time.' },
              { step: '03', title: 'Get Insights', desc: 'Receive actionable recommendations tailored to your specific farm.' },
              { step: '04', title: 'Act & Harvest', desc: 'Implement AI recommendations and track improvements over time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 font-extrabold text-sm" style={{ background: 'var(--primary)', color: 'white', fontFamily: 'Manrope, sans-serif' }}>{step}</div>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop&auto=format" alt="Farmer using technology" className="rounded-2xl w-full object-cover" style={{ height: 380 }} />
          </div>
          <div>
            <div className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color: 'var(--primary)' }}>ABOUT</div>
            <h2 className="text-4xl font-extrabold mb-6" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Built for real farmers</h2>
            <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              AgriNova AI was built with one mission: make precision agriculture accessible to every farmer. By combining satellite data, soil science, and cutting-edge AI, we deliver insights that were previously available only to large-scale agribusinesses.
            </p>
            <div className="space-y-3 mb-8">
              {['Real-time soil and crop monitoring', 'AI-powered disease detection from photos', 'Smart irrigation scheduling', 'Crop suitability recommendations'].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#DCFCE7' }}>
                    <Check size={12} style={{ color: '#16A34A' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className="btn-primary">
              Start for Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 mx-4 sm:mx-6 mb-12 rounded-3xl" style={{ background: 'linear-gradient(135deg, #1A3D1C 0%, #2D6A2F 100%)' }}>
        <div className="text-center max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Smarter Farming Starts Today</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>Join thousands of farmers already using AgriNova AI to improve yields and reduce resource waste.</p>
          <Link to="/register" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-sm" style={{ background: 'white', color: 'var(--primary)' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <Leaf size={11} className="text-white" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AgriNova AI</span>
        </div>
        <p>© 2025 AgriNova AI. Smarter Farming. Better Harvests.</p>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard, Sprout, Bot, Scan, Droplets, Cloud, Leaf,
  BarChart3, Bell, Settings, LogOut, Menu, X, Search, ChevronDown,
  Home, Tractor, User
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-farm', label: 'My Farm', icon: Tractor },
  { path: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { path: '/crop-doctor', label: 'Crop Doctor', icon: Scan },
  { path: '/soil', label: 'Soil Intelligence', icon: Sprout },
  { path: '/weather', label: 'Weather', icon: Cloud },
  { path: '/irrigation', label: 'Smart Irrigation', icon: Droplets },
  { path: '/crop-recommendation', label: 'Crop Advisor', icon: Leaf },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const mobileNav = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/my-farm', label: 'Farm', icon: Tractor },
  { path: '/ai-advisor', label: 'AI', icon: Bot },
  { path: '/weather', label: 'Weather', icon: Cloud },
  { path: '/settings', label: 'Profile', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, currentFarm, unreadCount, logout, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [farmDropdown, setFarmDropdown] = useState(false);

  const user = state.user!;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user.fullName.split(' ')[0];

  const handleLogout = () => { logout(); navigate('/'); };

  const searchResults = searchQuery.length > 1 ? [
    ...state.crops.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => ({ label: c.name, sub: 'Crop', path: '/my-farm' })),
    ...navItems.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase())).map(n => ({ label: n.label, sub: 'Page', path: n.path })),
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AgriNova AI</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Smart Farming</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5"><X size={18} /></button>
        </div>

        {/* Farm selector */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setFarmDropdown(!farmDropdown)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-opacity-60 transition-colors text-left"
            style={{ background: 'var(--secondary)' }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>
              {currentFarm?.name?.[0] || 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{currentFarm?.name || 'Select Farm'}</div>
              <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{currentFarm?.location || 'No location'}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          </button>
          {farmDropdown && (
            <div className="mt-1 rounded-lg border p-1" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {state.farms.map(f => (
                <button key={f.id} onClick={() => { dispatch({ type: 'SET_CURRENT_FARM', payload: f.id }); setFarmDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:opacity-80 transition-colors"
                  style={{ background: f.id === state.currentFarmId ? 'var(--secondary)' : 'transparent', color: 'var(--foreground)' }}>
                  {f.name}
                </button>
              ))}
              <Link to="/my-farm" onClick={() => setFarmDropdown(false)} className="block px-3 py-2 text-sm rounded-md" style={{ color: 'var(--primary)' }}>+ Add Farm</Link>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll p-3 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? 'var(--secondary)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontFamily: active ? 'Manrope, sans-serif' : 'Inter, sans-serif',
                }}>
                <Icon size={17} />
                {label}
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto text-xs font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: 'var(--primary)' }}>{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: 'var(--border)' }}>
          <Link to="/notifications" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: location.pathname === '/notifications' ? 'var(--primary)' : 'var(--muted-foreground)', background: location.pathname === '/notifications' ? 'var(--secondary)' : 'transparent' }}>
            <Bell size={17} />
            Notifications
            {unreadCount > 0 && <span className="ml-auto text-xs font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: '#B91C1C' }}>{unreadCount}</span>}
          </Link>
          <Link to="/settings" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: location.pathname === '/settings' ? 'var(--primary)' : 'var(--muted-foreground)', background: location.pathname === '/settings' ? 'var(--secondary)' : 'transparent' }}>
            <Settings size={17} />
            Settings
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors btn-ghost" style={{ color: 'var(--muted-foreground)' }}>
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b sticky top-0 z-30" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-1.5"><Menu size={20} /></button>
          <div className="flex-1">
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{greeting},</div>
            <div className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{firstName}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <button onClick={() => setSearchOpen(!searchOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
                <Search size={15} />
                <span className="hidden md:block">Search...</span>
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-lg z-50" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="p-2">
                    <input autoFocus className="input-field text-sm" placeholder="Search crops, pages, data..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="px-2 pb-2 space-y-1">
                      {searchResults.map((r, i) => (
                        <Link key={i} to={r.path} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-colors"
                          style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
                          <span>{r.label}</span>
                          <span className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.sub}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery.length > 1 && searchResults.length === 0 && (
                    <div className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>No results for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>
            <Link to="/notifications" className="relative p-2 rounded-lg transition-colors btn-ghost">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#B91C1C' }} />}
            </Link>
            <Link to="/settings" className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors" style={{ background: 'var(--secondary)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--primary)' }}>
                {firstName[0]}
              </div>
              <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--foreground)' }}>{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex">
          {mobileNav.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors"
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                <Icon size={20} />
                {label}
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute w-1.5 h-1.5 rounded-full" style={{ background: '#B91C1C', top: 6, marginLeft: 8 }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

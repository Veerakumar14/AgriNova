import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Trash2, Check } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, bg: '#EFF6FF', border: '#BFDBFE', iconColor: '#2563EB' },
  success: { icon: CheckCircle, bg: '#F0FDF4', border: '#BBF7D0', iconColor: '#16A34A' },
  warning: { icon: AlertTriangle, bg: '#FFFBEB', border: '#FDE68A', iconColor: '#D97706' },
  alert: { icon: AlertCircle, bg: '#FEF2F2', border: '#FECACA', iconColor: '#DC2626' },
};

export default function Notifications() {
  const { state, dispatch } = useApp();
  const { showToast } = useToast();

  const notifications = state.notifications
    .filter(n => n.userId === state.user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unread = notifications.filter(n => !n.read);

  const markRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  const markAll = () => { dispatch({ type: 'MARK_ALL_READ' }); showToast('All notifications marked as read.'); };
  const del = (id: string) => { dispatch({ type: 'DELETE_NOTIFICATION', payload: id }); showToast('Notification deleted.', 'info'); };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAll} className="btn-secondary text-sm py-2">
            <Check size={14} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
          <h3 className="font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>No notifications</h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>You're all caught up! Notifications will appear here when your farm needs attention.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unread.length > 0 && (
            <div className="text-xs font-bold px-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>UNREAD</div>
          )}
          {notifications.map(notif => {
            const cfg = typeConfig[notif.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div key={notif.id}
                className="flex items-start gap-3 p-4 rounded-xl border transition-all animate-fade-in"
                style={{ background: notif.read ? 'var(--card)' : cfg.bg, borderColor: notif.read ? 'var(--border)' : cfg.border }}
                onClick={() => !notif.read && markRead(notif.id)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: notif.read ? 'var(--secondary)' : `${cfg.iconColor}18` }}>
                  <Icon size={18} style={{ color: notif.read ? 'var(--muted-foreground)' : cfg.iconColor }} />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>{notif.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(notif.createdAt)}</span>
                      <button onClick={e => { e.stopPropagation(); del(notif.id); }} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{notif.message}</p>
                  {!notif.read && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.iconColor }} />
                      <span className="text-xs font-semibold" style={{ color: cfg.iconColor }}>Unread · Click to mark as read</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

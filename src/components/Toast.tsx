import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }
interface ToastContextType { showToast: (message: string, type?: Toast['type']) => void }

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertTriangle };
  const colors = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', icon: '#16A34A' },
    error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#DC2626' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#2563EB' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#D97706' },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          const c = colors[toast.type];
          return (
            <div key={toast.id} className="animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg"
              style={{ background: c.bg, borderColor: c.border }}>
              <Icon size={18} style={{ color: c.icon, flexShrink: 0 }} />
              <span className="text-sm font-medium flex-1" style={{ color: c.text }}>{toast.message}</span>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="p-0.5 rounded" style={{ color: c.text, opacity: 0.6 }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

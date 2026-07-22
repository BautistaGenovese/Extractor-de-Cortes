import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Estilos por tipo ────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    Icon: CheckCircle,
    containerClass: 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/10 dark:border-emerald-500/25',
    iconClass: 'text-emerald-500',
    textClass: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    Icon: XCircle,
    containerClass: 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-500/10 dark:border-rose-500/25',
    iconClass: 'text-rose-500',
    textClass: 'text-rose-800 dark:text-rose-300',
  },
  warning: {
    Icon: AlertTriangle,
    containerClass: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/25',
    iconClass: 'text-amber-500',
    textClass: 'text-amber-800 dark:text-amber-300',
  },
  info: {
    Icon: Info,
    containerClass: 'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-500/10 dark:border-indigo-500/25',
    iconClass: 'text-indigo-500',
    textClass: 'text-indigo-800 dark:text-indigo-300',
  },
};

// ─── Container ──────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ─── Toast individual ────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const { Icon } = cfg;

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3.5
        rounded-2xl border backdrop-blur-xl shadow-2xl
        ${cfg.containerClass}
      `}
      style={{ animation: 'toastSlideDown 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconClass}`} />
      <p className={`flex-1 text-sm font-semibold leading-snug ${cfg.textClass}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`shrink-0 opacity-50 hover:opacity-100 transition-opacity rounded-lg p-0.5 ${cfg.textClass}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

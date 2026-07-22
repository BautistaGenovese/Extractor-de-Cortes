import { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────
const ConfirmContext = createContext(null);

export function useConfirm() {
  return useContext(ConfirmContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function ConfirmProvider({ children }) {
  const [modal, setModal] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setModal({
        message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        danger: options.danger !== false, // true por defecto
        onConfirm: () => { setModal(null); resolve(true); },
        onCancel:  () => { setModal(null); resolve(false); },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modal && <ConfirmModal modal={modal} />}
    </ConfirmContext.Provider>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────
function ConfirmModal({ modal }) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4"
      style={{ animation: 'backdropFadeIn 0.15s ease-out both' }}
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={modal.onCancel}
      />

      {/* Tarjeta */}
      <div
        className="relative w-full max-w-sm bg-stitch-surface rounded-3xl border border-stitch-border/50 shadow-2xl overflow-hidden"
        style={{ animation: 'modalSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Ícono + texto */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            modal.danger ? 'bg-rose-500/10' : 'bg-stitch-primary/10'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${modal.danger ? 'text-rose-500' : 'text-stitch-primary'}`} />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="font-bold text-stitch-text text-base">¿Estás seguro?</p>
            <p className="text-sm text-stitch-text-muted mt-1 leading-relaxed">{modal.message}</p>
          </div>
        </div>

        {/* Separador */}
        <div className="h-px bg-stitch-border/30 mx-6" />

        {/* Botones */}
        <div className="flex gap-3 p-4">
          <button
            onClick={modal.onCancel}
            className="flex-1 py-3 rounded-2xl border border-stitch-border text-stitch-text font-semibold text-sm hover:bg-stitch-surface-alt transition-colors active:scale-[0.98]"
          >
            {modal.cancelText}
          </button>
          <button
            onClick={modal.onConfirm}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg ${
              modal.danger
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-stitch-primary hover:brightness-110 text-stitch-on-primary shadow-stitch-primary/25'
            }`}
          >
            {modal.confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

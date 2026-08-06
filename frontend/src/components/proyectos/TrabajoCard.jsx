import { FileText, FileSpreadsheet, Trash2, Edit3, Calendar, Briefcase } from 'lucide-react';
import { apiService } from '../../api';

const badgeColors = [
  'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
];

export default function TrabajoCard({ t, index, onCargarParaEditar, onEliminarTrabajo, obraNombre }) {
  const badgeClass = badgeColors[index % badgeColors.length];

  return (
    <div
      onClick={() => onCargarParaEditar(t, true)}
      className="cursor-pointer group bg-stitch-surface rounded-2xl border border-stitch-border/30 p-4 flex flex-col gap-4 hover:border-stitch-primary/50 transition-colors"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-stitch-text mb-1 truncate group-hover:text-stitch-primary transition-colors" title={t.nombre}>
            {t.nombre}
          </h3>
          {obraNombre && (
            <div className="flex items-center gap-1.5 mb-1.5 text-stitch-text-muted">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                {obraNombre}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-stitch-text-muted">
            <Calendar className="w-[14px] h-[14px] shrink-0" />
            <span className="text-xs truncate">
              {new Date(t.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeClass}`}>
          {t.cortes?.length || 0} piezas
        </span>
      </div>

      <div className="flex flex-row items-center justify-between gap-3 pt-2 border-t border-stitch-border/30">
        <div className="flex flex-wrap gap-2">
          <a
            href={apiService.getExportarTxtUrl(t.id)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stitch-text-muted hover:text-stitch-primary hover:bg-stitch-primary/10 transition-all border border-stitch-border/50 hover:border-stitch-primary/30"
          >
            <FileText className="w-3.5 h-3.5" /> .txt
          </a>
          <a
            href={apiService.getExportarExcelUrl(t.id)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-stitch-border/50 hover:border-emerald-500/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </a>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onCargarParaEditar(t, false); }}
            className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEliminarTrabajo(t.id); }}
            className="p-2 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-500 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

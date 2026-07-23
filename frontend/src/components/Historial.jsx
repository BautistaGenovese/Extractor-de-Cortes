import { useState } from 'react';
import { Folder, FileText, FileSpreadsheet, Trash2, Edit3, Calendar, Search, Activity, Box } from 'lucide-react';
import { apiService } from '../api';
import { useToast } from './Toaster';

export default function Historial({ trabajos, onCargarParaEditar, onEliminarTrabajo }) {
  const toast = useToast();
  const [busqueda, setBusqueda] = useState('');
  const totalPiezas = trabajos?.reduce((acc, t) => acc + (t.cortes?.length || 0), 0) || 0;
  const totalTrabajos = trabajos?.length || 0;

  const trabajosFiltrados = trabajos?.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  if (!trabajos || trabajos.length === 0) {
    return (
      <div className="bg-stitch-surface rounded-2xl p-8 border border-stitch-border shadow-xl max-w-[820px] mx-auto my-6 md:my-8 text-center text-stitch-text-muted transition-colors duration-300">
        <Folder className="w-12 h-12 mx-auto mb-3 text-stitch-text-muted/50" />
        <p className="text-base font-medium">Aún no tienes trabajos guardados.</p>
        <p className="text-xs text-stitch-text-muted/70 mt-1">
          Sube tus primeras fotos para comenzar a armar tu catálogo de despieces.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-stitch-surface rounded-2xl p-4 md:p-6 border border-stitch-border shadow-xl max-w-[820px] mx-auto mt-4 md:mt-8 mb-10 text-stitch-text transition-colors duration-300">

        {/* Header con título y buscador */}
        <div className="flex flex-col gap-3 mb-5 md:mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Folder className="w-6 h-6 text-stitch-primary shrink-0" />
            Historial de Trabajos
          </h2>
          {/* Buscador: ancho completo siempre */}
          <div className="flex items-center gap-2 bg-stitch-surface-alt px-4 py-2.5 rounded-full border border-stitch-border/50 w-full">
            <Search className="w-4 h-4 text-stitch-text-muted shrink-0" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm text-stitch-text w-full placeholder-stitch-text-muted/70 outline-none"
              placeholder="Buscar por nombre..."
              type="text"
            />
          </div>
        </div>

        {/* Stats — vertical en mobile, horizontal en desktop */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
          {/* Total de Piezas */}
          <div className="bg-indigo-500/10 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20
                          flex flex-col items-center justify-center text-center gap-1.5
                          md:flex-row md:items-center md:text-left md:gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <p className="text-indigo-700/70 dark:text-indigo-400/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
                Piezas
              </p>
              <p className="text-base font-bold text-indigo-700 dark:text-indigo-400 leading-tight">
                {totalPiezas}
              </p>
            </div>
          </div>

          {/* Total de Trabajos */}
          <div className="bg-stitch-primary/10 p-3 rounded-xl border border-stitch-primary/20
                          flex flex-col items-center justify-center text-center gap-1.5
                          md:flex-row md:items-center md:text-left md:gap-3">
            <div className="w-8 h-8 bg-stitch-primary/20 rounded-lg flex items-center justify-center text-stitch-primary shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <p className="text-stitch-primary/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
                Trabajos
              </p>
              <p className="text-base font-bold text-stitch-primary leading-tight">
                {totalTrabajos}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de trabajos */}
        {trabajosFiltrados.length === 0 ? (
          <div className="text-center py-10 text-stitch-text-muted">
            <p>No se encontraron trabajos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {trabajosFiltrados.map((t, index) => {
              const badgeColors = [
                'bg-orange-500/10 text-orange-700 dark:text-orange-400',
                'bg-purple-500/10 text-purple-700 dark:text-purple-400',
                'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
              ];
              const badgeClass = badgeColors[index % badgeColors.length];

              return (
                <div
                  key={t.id}
                  onClick={() => onCargarParaEditar(t, true)}
                  className="cursor-pointer group bg-stitch-surface rounded-2xl border border-stitch-border/30 p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base md:text-[20px] text-stitch-text mb-1 truncate" title={t.nombre}>
                        {t.nombre}
                      </h3>
                      <div className="flex items-center gap-2 text-stitch-text-muted">
                        <Calendar className="w-[15px] h-[15px] shrink-0" />
                        <span className="text-xs truncate">
                          {new Date(t.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeClass}`}>
                      {t.cortes?.length || 0} piezas
                    </span>
                  </div>

                  <div className="h-px bg-stitch-border/30 w-full" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={apiService.getExportarTxtUrl(t.id)}
                        target="_blank"
                        rel="noreferrer"
                        title="Exportar optimizador .txt"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stitch-text-muted hover:text-stitch-primary hover:bg-stitch-primary/10 transition-all border border-stitch-border/50 hover:border-stitch-primary/30"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>.txt</span>
                      </a>
                      
                      <a
                        href={apiService.getExportarExcelUrl(t.id)}
                        target="_blank"
                        rel="noreferrer"
                        title="Exportar a Excel"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-stitch-border/50 hover:border-emerald-500/30"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel</span>
                      </a>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCargarParaEditar(t, false); }}
                        className="p-2.5 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEliminarTrabajo(t.id); }}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-500 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

import { Trash2, Edit3, Calendar, ChevronDown } from 'lucide-react';

const badgeColors = [
  'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
];

export default function ObraCard({ obra, trabajosDeEstaObra, onObraSeleccionada, onEditarObra, onEliminarObra, isExpanded, onToggleExpand, index = 0 }) {
  const badgeClass = badgeColors[index % badgeColors.length];

  return (
    <div
      onClick={() => onObraSeleccionada(obra.id)}
      className={`cursor-pointer group bg-stitch-surface rounded-2xl border border-stitch-border/30 p-4 flex flex-col gap-4 ${isExpanded ? 'border-stitch-primary/50' : 'hover:border-stitch-primary/50'} transition-colors shadow-sm`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-stitch-text mb-1 truncate group-hover:text-stitch-primary transition-colors" title={obra.nombre}>
            {obra.nombre}
          </h3>
          {obra.nombre_cliente && (
            <div className="flex items-center gap-1.5 mb-1.5 text-stitch-text-muted">
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                Cliente: {obra.nombre_cliente}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-stitch-text-muted">
            <Calendar className="w-[14px] h-[14px] shrink-0" />
            <span className="text-xs truncate">
              Creado el {new Date(obra.fecha_creacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div className='flex flex-col item-end justify-between gap-3'>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${badgeClass}`}>
            {trabajosDeEstaObra.length} trabajos
          </span>
          <div className="flex items-center gap-1 opacity-100 opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onEditarObra(); }}
              className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEliminarObra(obra.id); }}
              className="p-2 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-500 transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {obra.descripcion && (
        <div
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className={`flex flex-col -mx-4 px-4 py-3 -mb-4 transition-colors rounded-b-2xl border-t border-stitch-border/30 ${isExpanded ? 'bg-stitch-primary/5' : 'hover:bg-stitch-primary/5'}`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stitch-text-muted uppercase tracking-wider w-full">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-stitch-primary' : ''}`} />
            <span className={isExpanded ? 'text-stitch-primary' : ''}>Descripción</span>
          </div>

          <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
            <div className="overflow-hidden">
              <p className="text-sm text-stitch-text-muted leading-relaxed whitespace-pre-wrap pl-1">
                {obra.descripcion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

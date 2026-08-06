import { Search } from 'lucide-react';

const selectArrowStyle = {
  backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239BA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right .7rem top 50%",
  backgroundSize: ".65rem auto"
};

export default function BarraBusqueda({ busqueda, onBusquedaChange, filtroFecha, onFiltroFechaChange, placeholder }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full mt-2">
      <div className="flex items-center gap-2 bg-stitch-surface-alt px-4 py-2.5 rounded-full border border-stitch-border/50 w-full md:flex-1">
        <Search className="w-4 h-4 text-stitch-text-muted shrink-0" />
        <input
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm text-stitch-text w-full placeholder-stitch-text-muted/70 outline-none"
          placeholder={placeholder || 'Buscar...'}
          type="text"
        />
      </div>

      <select
        value={filtroFecha}
        onChange={(e) => onFiltroFechaChange(e.target.value)}
        className="w-full md:w-auto bg-stitch-surface-alt px-4 py-2.5 rounded-full border border-stitch-border/50 text-sm text-stitch-text outline-none cursor-pointer focus:ring-2 focus:ring-stitch-primary/30 transition-all appearance-none pr-8"
        style={selectArrowStyle}
      >
        <option value="todos">Cualquier fecha</option>
        <option value="hoy">Hoy</option>
        <option value="semana">Últimos 7 días</option>
        <option value="mes">Último mes</option>
      </select>
    </div>
  );
}

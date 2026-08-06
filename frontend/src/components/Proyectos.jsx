import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Plus, Briefcase } from 'lucide-react';
import ScrollToTop from './ScrollToTop';
import BarraBusqueda from './proyectos/BarraBusqueda';
import ObraCard from './proyectos/ObraCard';
import ObraModal from './proyectos/ObraModal';
import TrabajoCard from './proyectos/TrabajoCard';
import { checkFiltroFecha } from './proyectos/filtros';

export default function Proyectos({
  obras,
  trabajos,
  onCargarParaEditar,
  onEliminarTrabajo,
  onCrearObra,
  onActualizarObra,
  onEliminarObra
}) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos');
  const [idObraExpandida, setIdObraExpandida] = useState(null);
  const [activeTab, setActiveTab] = useState('trabajos');

  // Estado del modal de obra
  const [mostrarModalObra, setMostrarModalObra] = useState(false);
  const [obraEditando, setObraEditando] = useState(null);

  const abrirModalCrear = () => {
    setObraEditando(null);
    setMostrarModalObra(true);
  };

  const abrirModalEditar = (obra) => {
    setObraEditando(obra);
    setMostrarModalObra(true);
  };

  const handleGuardarObra = async (nombre, cliente, descripcion) => {
    if (obraEditando) {
      await onActualizarObra(obraEditando.id, nombre, cliente, descripcion);
    } else {
      await onCrearObra(nombre, cliente, descripcion);
    }
    setMostrarModalObra(false);
    setObraEditando(null);
  };

  // Filtrado
  const obrasFiltradas = obras?.filter(o =>
    o.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    checkFiltroFecha(filtroFecha, o.fecha_creacion)
  ) || [];

  const trabajosListado = trabajos?.filter(t =>
    checkFiltroFecha(filtroFecha, t.fecha) &&
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  return (
    <>
      <section className="bg-stitch-surface rounded-2xl p-4 md:p-6 border border-stitch-border shadow-xl max-w-[820px] mx-auto mt-4 md:mt-6 md:mb-6 mb-16 text-stitch-text transition-colors duration-300">

        {/* Header con título y buscador */}
        <div className="flex flex-col gap-3 mb-5 md:mb-6">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Folder className="w-6 h-6 text-stitch-primary shrink-0" />
              Proyectos y Trabajos
            </h2>
            <button
              onClick={abrirModalCrear}
              className="bg-stitch-primary text-stitch-on-primary px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm w-full md:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Nueva Obra
            </button>
          </div>

          <BarraBusqueda
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            filtroFecha={filtroFecha}
            onFiltroFechaChange={setFiltroFecha}
            placeholder="Buscar obra o trabajo suelto..."
          />
        </div>

        {/* Stats Globales */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20
                          flex items-center justify-center text-center gap-1.5
                          flex-row md:items-center md:text-left md:gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-indigo-700/70 dark:text-indigo-400/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
                Trabajos Totales
              </p>
              <p className="text-base font-bold text-indigo-700 dark:text-indigo-400 leading-tight">
                {trabajos?.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-stitch-primary/10 p-3 rounded-xl border border-stitch-primary/20
                          flex items-center justify-center text-center gap-1.5
                          flex-row md:items-center md:text-left md:gap-3">
            <div className="w-8 h-8 bg-stitch-primary/20 rounded-lg flex items-center justify-center text-stitch-primary shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-stitch-primary/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
                Obras Totales
              </p>
              <p className="text-base font-bold text-stitch-primary leading-tight">
                {obras?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Tabs Premium */}
        <div className="flex mb-8 border-b border-stitch-border/30 w-full relative">
          <button
            onClick={() => setActiveTab('trabajos')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-[15px] transition-all relative ${activeTab === 'trabajos'
                ? 'text-stitch-primary'
                : 'text-stitch-text-muted hover:text-stitch-text'
              }`}
          >
            <FileText className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'trabajos' ? 'scale-110' : ''}`} />
            Trabajos
          </button>

          <button
            onClick={() => setActiveTab('obras')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-[15px] transition-all relative ${activeTab === 'obras'
                ? 'text-stitch-primary'
                : 'text-stitch-text-muted hover:text-stitch-text'
              }`}
          >
            <Briefcase className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'obras' ? 'scale-110' : ''}`} />
            Obras
          </button>

          {/* Indicador animado */}
          <span
            className={`absolute bottom-[-1px] left-0 w-1/2 h-[3px] bg-stitch-primary rounded-t-full shadow-[0_-2px_12px_rgba(var(--color-primary),0.5)] transition-transform duration-300 ease-in-out ${activeTab === 'trabajos' ? 'translate-x-0' : 'translate-x-full'
              }`}
          ></span>
        </div>

        {/* Modal Nueva/Editar Obra */}
        <ObraModal
          visible={mostrarModalObra}
          obraEditar={obraEditando}
          onGuardar={handleGuardarObra}
          onCerrar={() => { setMostrarModalObra(false); setObraEditando(null); }}
        />

        {/* Lista de Trabajos */}
        {activeTab === 'trabajos' && (
          <>
            {trabajosListado.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {trabajosListado.map((t, index) => {
                    const obraDelTrabajo = t.id_obra ? obras?.find(o => o.id === t.id_obra) : null;
                    return (
                      <TrabajoCard
                        key={t.id}
                        t={t}
                        index={index}
                        onCargarParaEditar={onCargarParaEditar}
                        onEliminarTrabajo={onEliminarTrabajo}
                        obraNombre={obraDelTrabajo ? obraDelTrabajo.nombre : null}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-stitch-text-muted">
                <p>No se encontraron trabajos.</p>
              </div>
            )}
          </>
        )}

        {/* Lista de Obras */}
        {activeTab === 'obras' && (
          <>
            {obrasFiltradas.length > 0 ? (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {obrasFiltradas.map((obra, index) => {
                    const trabajosDeEstaObra = trabajos?.filter(t => t.id_obra === obra.id) || [];
                    return (
                      <ObraCard
                        key={obra.id}
                        obra={obra}
                        index={index}
                        trabajosDeEstaObra={trabajosDeEstaObra}
                        onObraSeleccionada={(id) => navigate(`/obra/${id}`)}
                        onEditarObra={() => abrirModalEditar(obra)}
                        onEliminarObra={onEliminarObra}
                        isExpanded={idObraExpandida === obra.id}
                        onToggleExpand={() => setIdObraExpandida(idObraExpandida === obra.id ? null : obra.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-stitch-text-muted">
                <p>No se encontraron obras.</p>
              </div>
            )}
          </>
        )}

      </section>
      <ScrollToTop bottomClass={'bottom-6'} />
    </>
  );
}

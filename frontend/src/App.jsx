import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dropzone from './components/Dropzone';
import TablaCortes from './components/TablaCortes';
import Proyectos from './components/Proyectos';
import { useToast } from './components/Toaster';
import { useConfirm } from './components/ConfirmModal';
import { apiService, setAuthTokenGetter } from './api';
import { UploadCloud, Folder, ArrowLeft, SearchAlert, Briefcase, Box, FileText } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import BarraBusqueda from './components/proyectos/BarraBusqueda';
import TrabajoCard from './components/proyectos/TrabajoCard';
import { checkFiltroFecha } from './components/proyectos/filtros';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // oscuro por defecto
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);

  // pestanaActiva is now derived from the URL
  const isNuevo = location.pathname.startsWith('/nuevo') || location.pathname === '/';
  const pestanaActiva = isNuevo ? 'nuevo' : 'proyectos';

  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [soloLectura, setSoloLectura] = useState(false);

  // Estados persistentes del borrador/escaneo actual
  const [nombreDraft, setNombreDraft] = useState('');
  const [archivosDraft, setArchivosDraft] = useState([]);

  const [borradorTrabajo, setBorradorTrabajo] = useState(null);
  const [trabajoEnEdicionId, setTrabajoEnEdicionId] = useState(null);
  const [trabajos, setTrabajos] = useState([]);
  const [obras, setObras] = useState([]);

  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const cargarDatos = async () => {
    try {
      const uData = await apiService.getUsuario();
      setUsuario(uData);

      const tData = await apiService.getTrabajosUsuario();
      setTrabajos(tData);

      const oData = await apiService.getObrasUsuario();
      setObras(oData);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isSignedIn) {
        setAuthTokenGetter(getToken);

        if (user) {
          try {
            await apiService.syncUsuario({
              nombre: user.fullName || user.firstName || 'Usuario',
              email: user.primaryEmailAddress?.emailAddress || null,
            });
          } catch (e) {
            console.error('Error sincronizando usuario:', e);
          }
        }

        cargarDatos();
      } else {
        setAuthTokenGetter(async () => null);
        setUsuario(null);
        setTrabajos([]);
      }
    };
    if (isLoaded) {
      initAuth();
    }
  }, [isLoaded, isSignedIn, getToken, user]);

  const handleAnalizar = async (fotos) => {
    setCargandoAnalisis(true);
    try {
      const data = await apiService.analizarFotos(fotos);
      setTrabajoEnEdicionId(null);
      setBorradorTrabajo({
        nombre: 'Trabajo sin nombre',
        cortes: data.cortes,
      });
      setSoloLectura(false);
    } catch (err) {
      toast(err.response?.data?.detail || 'Error al analizar las fotos.', 'error', 5000);
    } finally {
      setCargandoAnalisis(false);
    }
  };

  const handleGuardar = async (nuevoNombre, cortesEditados, idObra = null) => {
    setCargandoGuardar(true);
    try {
      let isNewJob = false;
      let savedJobId = null;

      if (trabajoEnEdicionId) {
        // El endpoint de actualizar backend ahora soporta cambiar id_obra
        await apiService.actualizarTrabajo(trabajoEnEdicionId, nuevoNombre, cortesEditados, idObra);
        toast('¡Trabajo actualizado exitosamente!', 'success');
        savedJobId = trabajoEnEdicionId;
      } else {
        const res = await apiService.guardarTrabajo(nuevoNombre, cortesEditados, idObra);
        toast('¡Trabajo guardado exitosamente!', 'success');
        savedJobId = res.id;
        isNewJob = true;
      }

      setBorradorTrabajo(null);
      setTrabajoEnEdicionId(null);
      setNombreDraft('');
      setArchivosDraft([]);
      await cargarDatos();

      if (isNewJob && savedJobId) {
        navigate(`/trabajo/${savedJobId}`);
      } else {
        navigate('/proyectos');
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      toast('Ocurrió un error al intentar guardar el trabajo.', 'error', 5000);
    } finally {
      setCargandoGuardar(false);
    }
  };

  const handleCargarParaEditar = (trabajo, readonly = false) => {
    setTrabajoEnEdicionId(trabajo.id);
    setBorradorTrabajo({
      nombre: trabajo.nombre,
      cortes: trabajo.cortes,
      id_obra: trabajo.id_obra
    });
    setSoloLectura(readonly);
    navigate(`/trabajo/${trabajo.id}`);
  };

  const handleCancelarEdicion = () => {
    if (pestanaActiva === 'nuevo') {
      setBorradorTrabajo(null);
      setTrabajoEnEdicionId(null);
      setNombreDraft('');
      setArchivosDraft([]);
    } else {
      // Actuar como el botón físico de Atrás del navegador si hay historial previo.
      // Si el usuario cargó la URL directamente (sin historial), redirigir al historial reemplazando la vista.
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/proyectos', { replace: true });
      }
    }
  };

  const handleEliminarTrabajo = async (idTrabajo) => {
    const ok = await confirm(
      '¿Seguro que deseas eliminar este trabajo? Esta acción no se puede deshacer.',
      { confirmText: 'Eliminar', danger: true }
    );
    if (!ok) return;
    try {
      await apiService.eliminarTrabajo(idTrabajo);
      await cargarDatos();
      toast('Trabajo eliminado correctamente.', 'info');
    } catch (err) {
      console.error(err);
      toast('Error al eliminar el trabajo.', 'error', 5000);
    }
  };

  const handleCrearObra = async (nombre, cliente, descripcion) => {
    try {
      const res = await apiService.crearObra(nombre, cliente, descripcion);
      await cargarDatos();
      toast('Obra creada correctamente.', 'success');
      return res;
    } catch (err) {
      console.error(err);
      toast('Error al crear la obra.', 'error', 5000);
      throw err;
    }
  };

  const handleActualizarObra = async (idObra, nombre, cliente, descripcion) => {
    try {
      await apiService.actualizarObra(idObra, nombre, cliente, descripcion);
      await cargarDatos();
      toast('Obra actualizada correctamente.', 'success');
    } catch (err) {
      console.error(err);
      toast('Error al actualizar la obra.', 'error', 5000);
    }
  };

  const handleEliminarObra = async (idObra) => {
    const ok = await confirm(
      '¿Seguro que deseas eliminar esta obra y todos sus trabajos asignados?',
      { confirmText: 'Eliminar Obra', danger: true }
    );
    if (!ok) return;
    try {
      await apiService.eliminarObra(idObra);
      await cargarDatos();
      toast('Obra eliminada correctamente.', 'info');
    } catch (err) {
      console.error(err);
      toast('Error al eliminar la obra.', 'error', 5000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      <Navbar usuario={usuario} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* Pestañas de Navegación (Siempre visibles) */}
        <div className="flex justify-center mb-4 md:mb-0">
          <div className="relative bg-stitch-surface-alt p-1.5 rounded-full md:rounded-2xl shadow-sm border border-stitch-border/50 transition-colors inline-grid grid-cols-2 gap-1 w-full max-w-[420px]">
            {/* Sliding Pill */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-stitch-secondary-container rounded-full md:rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: 'calc(50% - 8px)',
                left: pestanaActiva === 'nuevo' ? '6px' : 'calc(50% + 2px)'
              }}
            />

            <button
              onClick={() => navigate('/nuevo')}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full md:rounded-xl font-label-sm font-bold text-label-sm transition-all duration-300 ${pestanaActiva === 'nuevo'
                ? 'text-stitch-on-secondary-container'
                : 'text-stitch-text-muted hover:text-stitch-text hover:bg-stitch-lavender/50'
                }`}
            >
              <UploadCloud className="w-5 h-5" />
              <p>Nuevo <span className='hidden md:inline'>Trabajo</span></p>
            </button>

            <button
              onClick={() => navigate('/proyectos')}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-label-sm font-bold text-label-sm transition-all duration-300 ${pestanaActiva === 'proyectos'
                ? 'text-stitch-on-secondary-container'
                : 'text-stitch-text-muted hover:text-stitch-text hover:bg-stitch-lavender/50'
                }`}
            >
              <Folder className="w-5 h-5" />
              Proyectos <span className='hidden md:inline'>({trabajos.length})</span>
            </button>
          </div>
        </div>

        {/* Botón de volver si estamos en la vista de edición */}
        {((location.pathname === '/nuevo' && borradorTrabajo && !trabajoEnEdicionId) ||
          location.pathname.startsWith('/trabajo/') ||
          location.pathname.startsWith('/obra/')) && (
            <div className="max-w-[820px] mx-auto mb-4">
              <button
                onClick={handleCancelarEdicion}
                className="text-xs text-stitch-text-muted hover:text-stitch-primary flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver atrás / Cancelar
              </button>
            </div>
          )}

        {/* Rutas de la Aplicación */}
        <Routes>
          <Route path="/" element={<Navigate to="/nuevo" replace />} />

          <Route path="/nuevo" element={
            borradorTrabajo && !trabajoEnEdicionId ? (
              <TablaCortes
                cortesIniciales={borradorTrabajo.cortes}
                nombreTrabajoInicial={borradorTrabajo.nombre}
                onGuardar={handleGuardar}
                cargandoGuardar={cargandoGuardar}
                soloLectura={soloLectura}
                onActivarEdicion={() => setSoloLectura(false)}
                isNew={true}
                fotos={archivosDraft}
                obras={obras}
                idObraInicial={null}
                onCrearObra={handleCrearObra}
              />
            ) : (
              <Dropzone
                onAnalizar={handleAnalizar}
                cargando={cargandoAnalisis}
                archivos={archivosDraft}
                setArchivos={setArchivosDraft}
              />
            )
          } />

          <Route path="/proyectos" element={
            <Proyectos
              obras={obras}
              trabajos={trabajos}
              usuario={usuario}
              onCargarParaEditar={handleCargarParaEditar}
              onEliminarTrabajo={handleEliminarTrabajo}
              onCrearObra={handleCrearObra}
              onActualizarObra={handleActualizarObra}
              onEliminarObra={handleEliminarObra}
            />
          } />

          <Route path="/trabajo/:id" element={
            <TrabajoView
              trabajos={trabajos}
              borradorTrabajo={borradorTrabajo}
              trabajoEnEdicionId={trabajoEnEdicionId}
              onCargarParaEditar={handleCargarParaEditar}
              handleGuardar={handleGuardar}
              cargandoGuardar={cargandoGuardar}
              soloLectura={soloLectura}
              setSoloLectura={setSoloLectura}
              obras={obras}
              onCrearObra={handleCrearObra}
            />
          } />

          <Route path="/obra/:id" element={
            <ObraView
              obras={obras}
              trabajos={trabajos}
              onCargarParaEditar={handleCargarParaEditar}
              onEliminarTrabajo={handleEliminarTrabajo}
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

// Componente auxiliar para cargar un trabajo directo por URL si no está en estado
function TrabajoView({ trabajos, obras, borradorTrabajo, trabajoEnEdicionId, onCargarParaEditar, handleGuardar, cargandoGuardar, soloLectura, setSoloLectura, onCrearObra }) {
  const { id } = useParams();
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    // Solo cargamos si el ID de la URL es distinto al que tenemos en memoria
    if (trabajos.length > 0 && String(id) !== String(trabajoEnEdicionId)) {
      const t = trabajos.find(x => String(x.id) === String(id));
      if (t) {
        setNoEncontrado(false);
        onCargarParaEditar(t, true);
      } else {
        setNoEncontrado(true);
      }
    }
  }, [id, trabajos, trabajoEnEdicionId, onCargarParaEditar]);

  if (noEncontrado) {
    return (
      <div className="bg-stitch-surface rounded-2xl p-8 border border-stitch-border shadow-xl max-w-[820px] mx-auto my-6 md:my-8 text-center text-stitch-text-muted transition-colors duration-300">
        <SearchAlert className="w-12 h-12 mx-auto mb-3 text-stitch-text-muted/50" />
        <p className="text-base font-medium">Trabajo no encontrado.</p>
        <p className="text-xs text-stitch-text-muted/70 mt-1">
          Prueba con ingresar un trabajo válido.
        </p>
      </div>
    )
  }

  if (!borradorTrabajo || String(trabajoEnEdicionId) !== String(id)) {
    return (
      <div className="flex justify-center py-20 text-stitch-text-muted">
        Cargando detalles del trabajo...
      </div>
    );
  }

  return (
    <TablaCortes
      jobId={id}
      cortesIniciales={borradorTrabajo.cortes}
      nombreTrabajoInicial={borradorTrabajo.nombre}
      onGuardar={handleGuardar}
      cargandoGuardar={cargandoGuardar}
      soloLectura={soloLectura}
      onActivarEdicion={() => setSoloLectura(false)}
      onCancelarEdicion={() => setSoloLectura(true)}
      isNew={false}
      fotos={[]}
      obras={obras}
      idObraInicial={borradorTrabajo.id_obra}
      onCrearObra={onCrearObra}
    />
  );
}

// Componente auxiliar para cargar una obra directo por URL
function ObraView({ obras, trabajos, onCargarParaEditar, onEliminarTrabajo }) {
  const { id } = useParams();
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos');

  const obra = obras.find(o => String(o.id) === String(id));

  // Obra no encontrada o datos aún no cargados
  if (obras.length > 0 && !obra) {
    return (
      <div className="bg-stitch-surface rounded-2xl p-8 border border-stitch-border shadow-xl max-w-[820px] mx-auto my-6 md:my-8 text-center text-stitch-text-muted transition-colors duration-300">
        <SearchAlert className="w-12 h-12 mx-auto mb-3 text-stitch-text-muted/50" />
        <p className="text-base font-medium">Obra no encontrada.</p>
        <p className="text-xs text-stitch-text-muted/70 mt-1">
          Prueba con ingresar una obra válida.
        </p>
      </div>
    );
  }

  if (!obra) {
    return (
      <div className="flex justify-center py-20 text-stitch-text-muted">
        Cargando detalles de la obra...
      </div>
    );
  }

  const trabajosDeObra = trabajos?.filter(t => t.id_obra === obra.id && checkFiltroFecha(filtroFecha, t.fecha) && t.nombre.toLowerCase().includes(busqueda.toLowerCase())) || [];
  const totalPiezasObra = trabajosDeObra.reduce((acc, t) => acc + (t.cortes?.length || 0), 0);
  const totalTrabajosObra = trabajosDeObra.length;

  return (
    <section className="bg-stitch-surface rounded-2xl p-4 md:p-6 border border-stitch-border shadow-xl max-w-[820px] mx-auto mt-4 md:mt-6 md:mb-6 mb-16 text-stitch-text transition-colors duration-300">

      {/* Header con título y buscador */}
      <div className="flex flex-col gap-3 mb-5 md:mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 text-stitch-text">
            <Briefcase className="w-6 h-6 text-stitch-primary shrink-0" />
            {obra.nombre}
          </h2>
          {obra.nombre_cliente && <p className="text-sm text-stitch-text-muted ml-8 font-medium">Cliente: {obra.nombre_cliente}</p>}
        </div>

        <BarraBusqueda
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroFecha={filtroFecha}
          onFiltroFechaChange={setFiltroFecha}
          placeholder="Buscar trabajo en este proyecto..."
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
        <div className="bg-indigo-500/10 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/20
                        flex items-center justify-center text-center gap-1.5
                        flex-row md:items-center md:text-left md:gap-3">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <p className="text-indigo-700/70 dark:text-indigo-400/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
              Piezas
            </p>
            <p className="text-base font-bold text-indigo-700 dark:text-indigo-400 leading-tight">
              {totalPiezasObra}
            </p>
          </div>
        </div>

        <div className="bg-stitch-primary/10 p-3 rounded-xl border border-stitch-primary/20
                        flex items-center justify-center text-center gap-1.5
                        flex-row md:items-center md:text-left md:gap-3">
          <div className="w-8 h-8 bg-stitch-primary/20 rounded-lg flex items-center justify-center text-stitch-primary shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-stitch-primary/70 text-[9px] font-semibold uppercase tracking-wider leading-tight">
              Trabajos
            </p>
            <p className="text-base font-bold text-stitch-primary leading-tight">
              {totalTrabajosObra}
            </p>
          </div>
        </div>
      </div>

      {trabajosDeObra.length === 0 ? (
        <div className="text-center py-10 text-stitch-text-muted">
          <Folder className="w-12 h-12 mx-auto mb-3 text-stitch-text-muted/30" />
          <p>No hay trabajos en este proyecto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {trabajosDeObra.map((t, index) => (
            <TrabajoCard key={t.id} t={t} index={index} onCargarParaEditar={onCargarParaEditar} onEliminarTrabajo={onEliminarTrabajo} />
          ))}
        </div>
      )}
    </section>
  );
}

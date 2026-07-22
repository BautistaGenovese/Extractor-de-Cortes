import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dropzone from './components/Dropzone';
import TablaCortes from './components/TablaCortes';
import Historial from './components/Historial';
import { apiService } from './api';
import { UploadCloud, Folder, ArrowLeft } from 'lucide-react';
import { useToast } from './components/Toaster';
import { useConfirm } from './components/ConfirmModal';

const ID_USUARIO_PRUEBA = '1fcbdbdc-4ecf-4a47-8008-5758bd8a3c31';

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

  const [usuario, setUsuario] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('nuevo');
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [soloLectura, setSoloLectura] = useState(false);

  // Estados persistentes del borrador/escaneo actual
  const [nombreDraft, setNombreDraft] = useState('');
  const [archivosDraft, setArchivosDraft] = useState([]);

  const [borradorTrabajo, setBorradorTrabajo] = useState(null);
  const [trabajoEnEdicionId, setTrabajoEnEdicionId] = useState(null);
  const [trabajos, setTrabajos] = useState([]);

  const cargarDatos = async () => {
    try {
      const uData = await apiService.getUsuario(ID_USUARIO_PRUEBA);
      setUsuario(uData);

      const tData = await apiService.getTrabajosUsuario(ID_USUARIO_PRUEBA);
      setTrabajos(tData);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAnalizar = async (nombreTrabajo, fotos) => {
    setCargandoAnalisis(true);
    try {
      const data = await apiService.analizarFotos(ID_USUARIO_PRUEBA, fotos);
      setTrabajoEnEdicionId(null);
      setBorradorTrabajo({
        nombre: nombreTrabajo,
        cortes: data.cortes,
      });
      setSoloLectura(false);
    } catch (err) {
      toast(err.response?.data?.detail || 'Error al analizar las fotos.', 'error', 5000);
    } finally {
      setCargandoAnalisis(false);
    }
  };

  const handleGuardar = async (nuevoNombre, cortesEditados) => {
    setCargandoGuardar(true);
    try {
      if (trabajoEnEdicionId) {
        await apiService.actualizarTrabajo(trabajoEnEdicionId, nuevoNombre, cortesEditados);
        toast('¡Trabajo actualizado exitosamente!', 'success');
      } else {
        await apiService.guardarTrabajo(ID_USUARIO_PRUEBA, nuevoNombre, cortesEditados);
        toast('¡Trabajo guardado exitosamente!', 'success');
      }

      setBorradorTrabajo(null);
      setTrabajoEnEdicionId(null);
      setNombreDraft('');
      setArchivosDraft([]);
      await cargarDatos();
      setPestanaActiva('historial');
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
    });
    setSoloLectura(readonly);
    setPestanaActiva('historial');
  };

  const handleCancelarEdicion = () => {
    setBorradorTrabajo(null);
    setTrabajoEnEdicionId(null);
    setNombreDraft('');
    setArchivosDraft([]);
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

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      <Navbar usuario={usuario} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* Pestañas de Navegación (Siempre visibles) */}
        <div className="flex justify-center mb-6 md:mb-12">
          <div className="relative bg-stitch-surface-alt p-1.5 rounded-2xl shadow-sm border border-stitch-border/50 transition-colors inline-grid grid-cols-2 gap-1 w-full max-w-[420px]">
            {/* Sliding Pill */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-stitch-secondary-container rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: 'calc(50% - 8px)',
                left: pestanaActiva === 'nuevo' ? '6px' : 'calc(50% + 2px)'
              }}
            />

            <button
              onClick={() => setPestanaActiva('nuevo')}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-label-sm font-bold text-label-sm transition-all duration-300 ${pestanaActiva === 'nuevo'
                ? 'text-stitch-on-secondary-container'
                : 'text-stitch-text-muted hover:text-stitch-text hover:bg-stitch-lavender/50'
                }`}
            >
              <UploadCloud className="w-5 h-5" />
              Nuevo Trabajo
            </button>

            <button
              onClick={() => setPestanaActiva('historial')}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-label-sm font-bold text-label-sm transition-all duration-300 ${pestanaActiva === 'historial'
                ? 'text-stitch-on-secondary-container'
                : 'text-stitch-text-muted hover:text-stitch-text hover:bg-stitch-lavender/50'
                }`}
            >
              <Folder className="w-5 h-5" />
              Historial ({trabajos.length})
            </button>
          </div>
        </div>

        {/* Botón de volver si estamos en la vista de edición de la pestaña correspondiente */}
        {((pestanaActiva === 'nuevo' && borradorTrabajo && !trabajoEnEdicionId) ||
          (pestanaActiva === 'historial' && borradorTrabajo && trabajoEnEdicionId)) && (
          <div className="max-w-6xl mx-auto mb-4">
            <button
              onClick={handleCancelarEdicion}
              className="text-xs text-stitch-text-muted hover:text-stitch-primary flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver atrás / Cancelar
            </button>
          </div>
        )}

        {/* Renderizado condicional por Pestaña */}
        {pestanaActiva === 'nuevo' ? (
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
            />
          ) : (
            <Dropzone
              onAnalizar={handleAnalizar}
              cargando={cargandoAnalisis}
              archivos={archivosDraft}
              setArchivos={setArchivosDraft}
              nombreTrabajo={nombreDraft}
              setNombreTrabajo={setNombreDraft}
            />
          )
        ) : (
          borradorTrabajo && trabajoEnEdicionId ? (
            <TablaCortes
              cortesIniciales={borradorTrabajo.cortes}
              nombreTrabajoInicial={borradorTrabajo.nombre}
              onGuardar={handleGuardar}
              cargandoGuardar={cargandoGuardar}
              soloLectura={soloLectura}
              onActivarEdicion={() => setSoloLectura(false)}
              isNew={false}
              fotos={[]}
            />
          ) : (
            <Historial
              trabajos={trabajos}
              usuario={usuario}
              onCargarParaEditar={handleCargarParaEditar}
              onEliminarTrabajo={handleEliminarTrabajo}
            />
          )
        )}
      </main>
    </div>
  );
}

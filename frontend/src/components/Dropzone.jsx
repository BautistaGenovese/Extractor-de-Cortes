import { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from './Toaster';

export default function Dropzone({ onAnalizar, cargando }) {
  const toast = useToast();
  const [archivos, setArchivos] = useState([]);
  const [nombreTrabajo, setNombreTrabajo] = useState('');

  const handleFileChange = (e) => {
    const seleccionados = Array.from(e.target.files);
    if (archivos.length + seleccionados.length > 4) {
      toast('Solo puedes subir hasta 4 imágenes por trabajo.', 'warning');
      return;
    }
    setArchivos((prev) => [...prev, ...seleccionados]);
  };

  const eliminarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (archivos.length === 0) {
      toast('Debes seleccionar al menos 1 imagen.', 'warning');
      return;
    }
    onAnalizar(nombreTrabajo || 'Trabajo sin nombre', archivos);
  };

  return (
    <div className="bg-stitch-surface rounded-2xl p-4 md:p-6 border border-stitch-border shadow-xl max-w-3xl mx-auto my-4 md:my-8 text-stitch-text transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-stitch-primary shrink-0" />
        Subir Hojas de Corte
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Nombre del trabajo */}
        <div>
          <label className="block text-sm font-medium text-stitch-text-muted mb-1">
            Nombre del Trabajo / Proyecto
          </label>
          <input
            type="text"
            placeholder="Ej: Vestidor Dormitorio Principal"
            value={nombreTrabajo}
            onChange={(e) => setNombreTrabajo(e.target.value)}
            className="w-full bg-stitch-surface-alt border border-stitch-border rounded-xl px-4 py-2.5 text-stitch-text focus:outline-none focus:border-stitch-primary transition-colors"
          />
        </div>

        {/* Zona de upload */}
        <div className="border-2 border-dashed border-stitch-border/80 hover:animate-border-glow transition-colors rounded-2xl p-6 md:p-8 text-center bg-stitch-surface-alt/50 cursor-pointer relative group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={cargando || archivos.length >= 4}
          />
          <UploadCloud className="w-10 h-10 md:w-12 md:h-12 text-stitch-text-muted/70 mx-auto mb-3" />

          {/* Texto adaptado: diferente en mobile vs desktop */}
          <p className="text-base font-medium text-stitch-text">
            {/* Mobile */}
            <span className="sm:hidden">Toca para seleccionar fotos</span>
            {/* Desktop */}
            <span className="hidden sm:inline">Haz clic o arrastra las fotos de las hojas de corte aquí</span>
          </p>
          <p className="text-xs text-stitch-text-muted mt-1.5">
            JPG, PNG, WEBP · Entre 1 y 4 fotos
            {archivos.length > 0 && (
              <span className="ml-2 text-stitch-primary font-semibold">({archivos.length}/4 seleccionadas)</span>
            )}
          </p>
        </div>

        {/* Previsualización de archivos seleccionados */}
        {archivos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 pt-1">
            {archivos.map((file, idx) => (
              <div
                key={idx}
                className="relative bg-stitch-surface-alt p-2.5 rounded-xl border border-stitch-border flex items-center gap-2 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-stitch-primary shrink-0" />
                <span className="text-xs truncate text-stitch-text flex-1">{file.name}</span>
                <button
                  type="button"
                  onClick={() => eliminarArchivo(idx)}
                  className="ml-auto text-stone-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 p-1 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botón de análisis */}
        <button
          type="submit"
          disabled={cargando || archivos.length === 0}
          className="w-full bg-stitch-primary hover:brightness-110 text-stitch-on-primary font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-stitch-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analizando hojas con IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analizar Fotos con IA</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

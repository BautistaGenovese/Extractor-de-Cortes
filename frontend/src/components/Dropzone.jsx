import { UploadCloud, Image as ImageIcon, X, Sparkles, Loader2, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from './Toaster';

export default function Dropzone({ onAnalizar, cargando, archivos, setArchivos }) {
  const toast = useToast();

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
    onAnalizar(archivos);
  };

  return (
    <div className="bg-stitch-surface rounded-2xl p-4 md:p-6 border border-stitch-border shadow-xl max-w-[820px] mx-auto my-4 md:my-8 text-stitch-text transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-stitch-primary shrink-0" />
        Subir Hojas de Corte
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

        {/* Zona de upload */}
        <div className="border-2 border-dashed border-stitch-border/80 hover:border-stitch-primary/50 transition-colors rounded-2xl p-6 md:p-8 text-center bg-stitch-surface-alt/50 cursor-pointer relative group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={cargando || archivos.length >= 4}
          />
          <UploadCloud className="w-10 h-10 md:w-12 md:h-12 text-stitch-text-muted/70 mx-auto mb-3 group-hover:scale-110 group-hover:text-stitch-primary transition-transform" />

          <p className="text-base font-medium text-stitch-text">
            <span className="sm:hidden">Toca para seleccionar fotos</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {archivos.map((file, idx) => (
              <div
                key={idx}
                className="relative bg-stitch-surface-alt p-2.5 rounded-xl border border-stitch-border flex items-center gap-2 transition-colors shadow-sm"
              >
                <ImageIcon className="w-5 h-5 text-stitch-primary shrink-0" />
                <span className="text-xs truncate text-stitch-text flex-1 font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => eliminarArchivo(idx)}
                  className="ml-auto text-stone-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
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

        {/* Info Box: Cómo organizar cortes */}
        <div className="bg-stitch-surface-alt rounded-xl p-5 shadow-sm border border-stitch-border/50 mt-2">
          <div className="flex items-center gap-2 font-bold text-base mb-4 text-stitch-text">
            <Info className="w-5 h-5 text-stitch-primary" />
            ¿Cómo escribir los cortes en tu hoja?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Formato */}
            <div className="bg-stitch-surface border border-stitch-border rounded-xl p-4 flex flex-col gap-1.5 relative overflow-hidden group hover:border-stitch-primary/40 transition-colors">
              <div className="flex items-center gap-2 z-10">
                <CheckCircle2 className="w-4 h-4 text-stitch-primary shrink-0" />
                <span className="font-bold text-sm text-stitch-text">Estructura Base</span>
              </div>
              <p className="text-xs text-stitch-text-muted leading-relaxed z-10 mt-1">
                <strong className="font-semibold text-stitch-text"><code>CANT = LARGO x ANCHO (Desc)</code></strong><br />
                Por ejemplo:<br />
                <code className="font-semibold">2 = 0.60 x 0.40 (Puerta)</code><br />
                Medidas en metros.
              </p>
              <svg className="absolute -bottom-2 -right-2 w-16 h-16 text-stitch-text-muted/5 group-hover:text-stitch-primary/5 group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V9H19V5H5ZM5 11V15H19V11H5ZM5 17V19H19V17H5Z" />
              </svg>
            </div>

            {/* Tapacantos */}
            <div className="bg-stitch-surface border border-stitch-border rounded-xl p-4 flex flex-col gap-1.5 relative overflow-hidden group hover:border-stitch-primary/40 transition-colors">
              <div className="flex items-center gap-2 z-10">
                <Sparkles className="w-4 h-4 text-stitch-primary shrink-0" />
                <span className="font-bold text-sm text-stitch-text">Tapacantos</span>
              </div>
              <p className="text-xs text-stitch-text-muted leading-relaxed z-10 mt-1">
                <strong className="font-semibold text-stitch-text">Subraya</strong> las medidas:<br />
                • 1 línea = Tapacanto en un solo lado.<br />
                • 2 líneas = Tapacanto en ambos lados.
              </p>
              <svg className="absolute -bottom-2 -right-2 w-16 h-16 text-stitch-text-muted/5 group-hover:text-stitch-primary/5 group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19h16M4 15h16M12 5v4" />
              </svg>
            </div>

            {/* Comillas */}
            <div className="bg-stitch-surface border border-stitch-border rounded-xl p-4 flex flex-col gap-1.5 relative overflow-hidden group hover:border-stitch-primary/40 transition-colors">
              <div className="flex items-center gap-2 z-10">
                <Info className="w-4 h-4 text-stitch-primary shrink-0" />
                <span className="font-bold text-sm text-stitch-text">Repeticiones (")</span>
              </div>
              <p className="text-xs text-stitch-text-muted leading-relaxed z-10 mt-1">
                Usa <strong className="font-semibold text-stitch-text">comillas (")</strong> para no reescribir. Ponlas exactamente debajo de cada palabra en la descripción.
              </p>
              <svg className="absolute -bottom-2 -right-2 w-16 h-16 text-stitch-text-muted/5 group-hover:text-stitch-primary/5 group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5" />
              </svg>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

import { PencilRuler, Coins, Sun, Moon } from 'lucide-react';

export default function Navbar({ usuario, isDarkMode, toggleTheme }) {
  const avatarColors = ['bg-orange-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-sky-500'];
  const colorIndex = usuario?.nombre ? usuario.nombre.length % avatarColors.length : 0;
  const initialClass = avatarColors[colorIndex];

  return (
    <header className="bg-stitch-surface/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-stitch-border/30 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">

        {/* Logo + Título */}
        <div className="flex items-center gap-2 min-w-0">
          <PencilRuler className="w-5 h-5 md:w-6 md:h-6 text-stitch-primary shrink-0" strokeWidth={2.0} />
          <h1 className="font-bold text-stitch-primary text-base md:text-xl leading-tight truncate">
            Extractor de Cortes
          </h1>
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 md:p-2.5 rounded-full bg-stitch-surface-alt text-stitch-text hover:brightness-95 transition-all"
            title="Cambiar Modo"
          >
            {isDarkMode
              ? <Sun className="w-4 h-4 md:w-5 md:h-5" />
              : <Moon className="w-4 h-4 md:w-5 md:h-5" />
            }
          </button>

          {/* Info de usuario */}
          {usuario && (
            <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-stitch-border">
              {/* Nombre + rol (solo sm+) */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-stitch-text leading-tight">{usuario.nombre}</p>
                <p className="text-xs text-stitch-text-muted">Carpintero</p>
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${initialClass} flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-sm border border-white/20 dark:border-black/20 shrink-0`}>
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>

              {/* Créditos */}
              <div className="flex items-center gap-1 md:gap-1.5 bg-stitch-primary/10 text-stitch-primary px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-stitch-primary/20">
                <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="font-bold text-xs md:text-sm whitespace-nowrap">{usuario.creditos_restantes} <span className="hidden sm:inline">créditos</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState, useRef } from 'react';
import { Plus, Trash2, CheckCircle, Edit2, AlertCircle, Copy, Download } from 'lucide-react';
import { useToast } from './Toaster';

export default function TablaCortes({ cortesIniciales, nombreTrabajoInicial, onGuardar, cargandoGuardar, soloLectura, onActivarEdicion }) {
  const toast = useToast();

  const [cortes, setCortes] = useState(
    cortesIniciales && cortesIniciales.length > 0
      ? cortesIniciales
      : [{ cantidad: '', largo_mm: '', ancho_mm: '', descripcion: '', puede_rotar: true, tapacanto_largo: 0, tapacanto_ancho: 0 }]
  );
  const [nombreTrabajo, setNombreTrabajo] = useState(nombreTrabajoInicial || 'Trabajo sin nombre');
  const [intentosGuardado, setIntentosGuardado] = useState(false);
  // Set de índices con el panel de edición expandido (solo mobile)
  const [expandedRows, setExpandedRows] = useState(() => new Set());

  // Normaliza un corte a tipos canónicos para poder comparar
  const normalizeCorte = (c) => ({
    cantidad: parseInt(c.cantidad) || 0,
    largo_mm: parseInt(c.largo_mm) || 0,
    ancho_mm: parseInt(c.ancho_mm) || 0,
    descripcion: (c.descripcion || '').trim(),
    puede_rotar: Boolean(c.puede_rotar),
    tapacanto_largo: parseInt(c.tapacanto_largo) || 0,
    tapacanto_ancho: parseInt(c.tapacanto_ancho) || 0,
  });

  // Snapshot inmutable del estado al montar el componente
  const snapshotInicial = useRef({
    nombre: (nombreTrabajoInicial || 'Trabajo sin nombre').trim(),
    cortes: (cortesIniciales && cortesIniciales.length > 0 ? cortesIniciales : []).map(normalizeCorte),
  });

  // Retorna true si el usuario modificó algo respecto al estado inicial
  const hayaCambios = () => {
    if (nombreTrabajo.trim() !== snapshotInicial.current.nombre) return true;
    if (cortes.length !== snapshotInicial.current.cortes.length) return true;
    const normActual = JSON.stringify(cortes.map(normalizeCorte));
    const normInicial = JSON.stringify(snapshotInicial.current.cortes);
    return normActual !== normInicial;
  };

  const toggleRow = (idx) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleChange = (index, field, value) => {
    const nuevosCortes = [...cortes];
    nuevosCortes[index][field] = value;
    setCortes(nuevosCortes);
  };

  const agregarFila = () => {
    const newIdx = cortes.length;
    setCortes([...cortes, { cantidad: '', largo_mm: '', ancho_mm: '', descripcion: '', puede_rotar: true, tapacanto_largo: 0, tapacanto_ancho: 0 }]);
    // Auto-expandir la nueva card en mobile
    setExpandedRows(prev => new Set([...prev, newIdx]));
  };

  const eliminarFila = (index) => {
    if (cortes.length === 1) {
      toast('Debes tener al menos una pieza en la lista.', 'warning');
      return;
    }
    setCortes(cortes.filter((_, i) => i !== index));
    // Reajustar índices del set de expandidos
    setExpandedRows(prev => {
      const next = new Set();
      prev.forEach(i => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const obtenerCamposFaltantes = (corte) => {
    const faltantes = [];
    const cant = parseInt(corte.cantidad);
    const largo = parseInt(corte.largo_mm);
    const ancho = parseInt(corte.ancho_mm);
    if (isNaN(cant) || cant <= 0) faltantes.push('Cantidad');
    if (isNaN(largo) || largo <= 0) faltantes.push('Largo');
    if (isNaN(ancho) || ancho <= 0) faltantes.push('Ancho');
    return faltantes;
  };

  const verificarErrores = () => {
    setIntentosGuardado(true);
    for (const c of cortes) {
      if (obtenerCamposFaltantes(c).length > 0) return true;
    }
    return false;
  };

  const generarTxt = () => {
    let txt = '';
    for (const c of cortes) {
      const cant = parseInt(c.cantidad) || 0;
      const largo = parseInt(c.largo_mm) || 0;
      const ancho = parseInt(c.ancho_mm) || 0;
      const desc = c.descripcion || '';
      const tl = parseInt(c.tapacanto_largo) || 0;
      const ta = parseInt(c.tapacanto_ancho) || 0;
      const rota = c.puede_rotar ? 1 : 0;
      let canto_arr = 0, canto_aba = 0;
      if (tl === 1) { canto_arr = 1; canto_aba = 0; }
      else if (tl === 2) { canto_arr = 1; canto_aba = 1; }
      else if (tl === 3) { canto_arr = 2; canto_aba = 0; }
      else if (tl === 4) { canto_arr = 2; canto_aba = 2; }
      let canto_izq = 0, canto_der = 0;
      if (ta === 1) { canto_izq = 1; canto_der = 0; }
      else if (ta === 2) { canto_izq = 1; canto_der = 1; }
      else if (ta === 3) { canto_izq = 2; canto_der = 0; }
      else if (ta === 4) { canto_izq = 2; canto_der = 2; }
      txt += `${cant}\t${largo}\t${ancho}\t${desc}\t${rota}\t${canto_arr}\t${canto_aba}\t${canto_izq}\t${canto_der}\n`;
    }
    return txt;
  };

  const handleCopiarTxt = () => {
    if (verificarErrores()) return;
    navigator.clipboard.writeText(generarTxt()).then(() =>
      toast('¡Texto copiado al portapapeles!', 'success')
    );
  };

  const handleDescargarTxt = () => {
    if (verificarErrores()) return;
    const blob = new Blob([generarTxt()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreTrabajo || 'trabajo'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Archivo "${nombreTrabajo || 'trabajo'}.txt" descargado.`, 'success');
  };

  const handleConfirmar = () => {
    if (verificarErrores()) return;

    // Evitar llamadas innecesarias si no hubo ningún cambio
    if (!hayaCambios()) {
      toast('No realizaste ningún cambio.', 'info');
      return;
    }

    const cortesValidados = cortes.map(c => ({
      ...c,
      cantidad: parseInt(c.cantidad),
      largo_mm: parseInt(c.largo_mm),
      ancho_mm: parseInt(c.ancho_mm),
      descripcion: c.descripcion || '',
      tapacanto_largo: parseInt(c.tapacanto_largo) || 0,
      tapacanto_ancho: parseInt(c.tapacanto_ancho) || 0,
      puede_rotar: Boolean(c.puede_rotar),
    }));
    onGuardar(nombreTrabajo, cortesValidados);
  };

  // Clases reutilizables para campos de las cards mobile
  const mobileInputClass = 'w-full bg-stitch-surface border border-stitch-border/60 rounded-lg px-3 py-2.5 text-sm text-stitch-text focus:outline-none focus:border-stitch-primary transition-colors disabled:opacity-70';
  const mobileLabelClass = 'block text-[10px] font-bold uppercase tracking-wider text-stitch-text-muted mb-1.5';

  return (
    <>
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type='number'] { -moz-appearance: textfield; }
        @keyframes parpadeoRojo {
          0%, 100% { border-color: rgba(244, 63, 94, 0.8); }
          50% { border-color: rgba(244, 63, 94, 0.25); }
        }
        .fila-error { animation: parpadeoRojo 1.2s infinite ease-in-out; }
        .card-error { animation: parpadeoRojo 1.4s infinite ease-in-out; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-fields-enter { animation: slideDown 0.18s ease-out forwards; }
      `}</style>

      <div className="bg-stitch-surface rounded-xl p-4 md:p-6 border border-stitch-border/30 shadow-xl max-w-[1280px] mx-auto mt-4 md:mt-6 mb-36 text-stitch-text transition-colors duration-300">

        {/* Header — Nombre del trabajo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 md:mb-6">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-stitch-text-muted mb-2 uppercase tracking-wider">
              Nombre del Trabajo
            </label>
            <div className="relative flex items-center group">
              <input
                type="text"
                value={nombreTrabajo}
                onChange={(e) => setNombreTrabajo(e.target.value)}
                disabled={soloLectura}
                className="w-full bg-stitch-surface-alt border border-stitch-border/50 focus:border-stitch-primary font-bold text-lg text-stitch-primary rounded-lg px-4 py-3 pr-10 focus:outline-none transition-all placeholder:text-stitch-text-muted/40 shadow-sm disabled:opacity-80"
                placeholder="Ej: Vestidor Principal"
              />
              {!soloLectura && <Edit2 className="w-4 h-4 text-stitch-text-muted opacity-40 group-hover:opacity-100 absolute right-4 pointer-events-none transition-opacity" />}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            VISTA MOBILE — Cards colapsables por pieza
            ═══════════════════════════════════════════════ */}
        <div className="md:hidden space-y-2.5">
          {cortes.map((c, idx) => {
            const faltantes = obtenerCamposFaltantes(c);
            const tieneError = intentosGuardado && faltantes.length > 0;
            const isExpanded = expandedRows.has(idx);

            return (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  tieneError
                    ? 'border-rose-400/70 card-error'
                    : 'border-stitch-border/50'
                } bg-stitch-surface-alt/40`}
              >
                {/* ── Card Header (siempre visible) ── */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Número de pieza */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    tieneError
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                      : 'bg-stitch-primary/10 text-stitch-primary'
                  }`}>
                    #{idx + 1}
                  </div>

                  {/* Info resumida */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stitch-text truncate leading-tight">
                      {c.descripcion?.trim() || 'Sin descripción'}
                    </p>
                    {tieneError ? (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        Faltan: {faltantes.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-stitch-text-muted mt-0.5">
                        {c.cantidad ? `${c.cantidad} ud` : '— ud'} · {c.largo_mm || '—'} × {c.ancho_mm || '—'} mm
                      </p>
                    )}
                  </div>

                  {/* Botones de acción */}
                  {!soloLectura ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleRow(idx)}
                        className={`p-2 rounded-xl transition-all duration-150 ${
                          isExpanded
                            ? 'bg-stitch-primary text-stitch-on-primary shadow-md'
                            : 'bg-stitch-surface text-stitch-text-muted hover:text-stitch-primary border border-stitch-border/60'
                        }`}
                        title={isExpanded ? 'Cerrar' : 'Editar pieza'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarFila(idx)}
                        className="p-2 rounded-xl bg-stitch-surface text-stitch-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stitch-border/60 transition-all"
                        title="Eliminar pieza"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleRow(idx)}
                      className="shrink-0 text-xs text-stitch-text-muted bg-stitch-surface px-2.5 py-1.5 rounded-lg border border-stitch-border/40 transition-all"
                    >
                      {isExpanded ? 'Cerrar' : 'Ver'}
                    </button>
                  )}
                </div>

                {/* ── Panel de edición (expandible) ── */}
                {isExpanded && (
                  <div className="card-fields-enter px-4 pb-4 pt-3 border-t border-stitch-border/30 space-y-3 bg-stitch-surface/60">
                    {/* Cantidad · Largo · Ancho */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={mobileLabelClass}>Cant.</label>
                        <input
                          type="number" placeholder="0"
                          value={c.cantidad ?? ''}
                          onChange={(e) => handleChange(idx, 'cantidad', e.target.value)}
                          disabled={soloLectura}
                          className={`${mobileInputClass} text-center font-bold ${
                            tieneError && isNaN(parseInt(c.cantidad)) ? 'border-rose-400 text-rose-500 placeholder-rose-300' : 'text-stitch-primary'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={mobileLabelClass}>Largo mm</label>
                        <input
                          type="number" placeholder="0"
                          value={c.largo_mm ?? ''}
                          onChange={(e) => handleChange(idx, 'largo_mm', e.target.value)}
                          disabled={soloLectura}
                          className={`${mobileInputClass} text-center ${
                            tieneError && isNaN(parseInt(c.largo_mm)) ? 'border-rose-400 text-rose-500' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <label className={mobileLabelClass}>Ancho mm</label>
                        <input
                          type="number" placeholder="0"
                          value={c.ancho_mm ?? ''}
                          onChange={(e) => handleChange(idx, 'ancho_mm', e.target.value)}
                          disabled={soloLectura}
                          className={`${mobileInputClass} text-center ${
                            tieneError && isNaN(parseInt(c.ancho_mm)) ? 'border-rose-400 text-rose-500' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className={mobileLabelClass}>Descripción</label>
                      <input
                        type="text" placeholder="Ej: Lateral izquierdo..."
                        value={c.descripcion || ''}
                        onChange={(e) => handleChange(idx, 'descripcion', e.target.value)}
                        disabled={soloLectura}
                        className={mobileInputClass}
                      />
                    </div>

                    {/* Tapacanto */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={mobileLabelClass}>Canto Largo</label>
                        <select
                          value={c.tapacanto_largo ?? 0}
                          onChange={(e) => handleChange(idx, 'tapacanto_largo', parseInt(e.target.value))}
                          disabled={soloLectura}
                          className={`${mobileInputClass} cursor-pointer`}
                        >
                          <option value={0}>Sin Canto</option>
                          <option value={1}>1 Lado</option>
                          <option value={2}>2 Lados</option>
                        </select>
                      </div>
                      <div>
                        <label className={mobileLabelClass}>Canto Ancho</label>
                        <select
                          value={c.tapacanto_ancho ?? 0}
                          onChange={(e) => handleChange(idx, 'tapacanto_ancho', parseInt(e.target.value))}
                          disabled={soloLectura}
                          className={`${mobileInputClass} cursor-pointer`}
                        >
                          <option value={0}>Sin Canto</option>
                          <option value={1}>1 Lado</option>
                          <option value={2}>2 Lados</option>
                        </select>
                      </div>
                    </div>

                    {/* Puede Rotar */}
                    <label className="flex items-center gap-3 cursor-pointer select-none py-0.5">
                      <input
                        type="checkbox"
                        checked={c.puede_rotar ?? true}
                        onChange={(e) => handleChange(idx, 'puede_rotar', e.target.checked)}
                        disabled={soloLectura}
                        className="w-5 h-5 accent-stitch-primary rounded cursor-pointer disabled:opacity-70"
                      />
                      <span className="text-sm font-medium text-stitch-text">Puede rotar</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}

          {/* Contador de piezas (mobile) */}
          <div className="px-2 py-2 text-stitch-text-muted text-xs flex items-center justify-between">
            <span>{cortes.length} pieza{cortes.length !== 1 ? 's' : ''} en total</span>
            <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Se valida antes de guardar</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            VISTA DESKTOP — Tabla horizontal
            ═══════════════════════════════════════════════ */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-stitch-border/30 bg-stitch-surface transition-colors shadow-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-stitch-surface-alt text-stitch-text-muted text-xs font-bold border-b border-stitch-border/30 transition-colors">
                <th className="p-4 text-center w-16">CANT.</th>
                <th className="p-4 text-center w-28">LARGO (mm)</th>
                <th className="p-4 text-center w-28">ANCHO (mm)</th>
                <th className="p-4 px-4">DESCRIPCIÓN</th>
                <th className="p-4 text-center w-28">C. LARGO</th>
                <th className="p-4 text-center w-28">C. ANCHO</th>
                <th className="p-4 text-center w-20">ROTAR</th>
                {!soloLectura && <th className="p-4 text-center w-12"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stitch-border/20 transition-colors">
              {cortes.map((c, idx) => {
                const faltantes = obtenerCamposFaltantes(c);
                const tieneError = intentosGuardado && faltantes.length > 0;
                return (
                  <React.Fragment key={idx}>
                    <tr className={`transition-colors ${tieneError ? 'fila-error border-2 border-stitch-danger' : 'hover:bg-stitch-surface-alt group'}`}>
                      <td className="p-0">
                        <input
                          type="number" placeholder="0"
                          value={c.cantidad ?? ''}
                          onChange={(e) => handleChange(idx, 'cantidad', e.target.value)}
                          disabled={soloLectura}
                          className={`w-full bg-transparent p-4 text-center font-bold focus:bg-stitch-surface-alt disabled:opacity-80 focus:outline-none transition-colors ${tieneError && isNaN(parseInt(c.cantidad)) ? 'text-stitch-danger placeholder-stitch-danger/50' : 'text-stitch-primary'}`}
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="number" placeholder="0"
                          value={c.largo_mm ?? ''}
                          onChange={(e) => handleChange(idx, 'largo_mm', e.target.value)}
                          disabled={soloLectura}
                          className={`w-full bg-transparent p-4 text-center font-medium focus:bg-stitch-surface-alt disabled:opacity-80 focus:outline-none transition-colors ${tieneError && isNaN(parseInt(c.largo_mm)) ? 'text-stitch-danger placeholder-stitch-danger/50' : 'text-stitch-text'}`}
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="number" placeholder="0"
                          value={c.ancho_mm ?? ''}
                          onChange={(e) => handleChange(idx, 'ancho_mm', e.target.value)}
                          disabled={soloLectura}
                          className={`w-full bg-transparent p-4 text-center font-medium focus:bg-stitch-surface-alt disabled:opacity-80 focus:outline-none transition-colors ${tieneError && isNaN(parseInt(c.ancho_mm)) ? 'text-stitch-danger placeholder-stitch-danger/50' : 'text-stitch-text'}`}
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="text" placeholder="Escribir descripción..."
                          value={c.descripcion || ''}
                          onChange={(e) => handleChange(idx, 'descripcion', e.target.value)}
                          disabled={soloLectura}
                          className="w-full bg-transparent p-4 focus:bg-stitch-surface-alt disabled:opacity-80 focus:outline-none text-stitch-text transition-colors"
                        />
                      </td>
                      <td className="p-0">
                        <select
                          value={c.tapacanto_largo ?? 0}
                          onChange={(e) => handleChange(idx, 'tapacanto_largo', parseInt(e.target.value))}
                          disabled={soloLectura}
                          className="w-full bg-transparent border-none p-4 text-center text-sm focus:ring-0 disabled:opacity-80 focus:bg-stitch-surface-alt cursor-pointer transition-colors text-stitch-text appearance-none"
                        >
                          <option value={0} className="bg-stitch-surface-alt text-stitch-text-muted">Sin Canto</option>
                          <option value={1} className="bg-stitch-surface-alt text-stitch-primary">1 Lado</option>
                          <option value={2} className="bg-stitch-surface-alt text-stitch-primary">2 Lados</option>
                        </select>
                      </td>
                      <td className="p-0">
                        <select
                          value={c.tapacanto_ancho ?? 0}
                          onChange={(e) => handleChange(idx, 'tapacanto_ancho', parseInt(e.target.value))}
                          disabled={soloLectura}
                          className="w-full bg-transparent border-none p-4 text-center text-sm focus:ring-0 disabled:opacity-80 focus:bg-stitch-surface-alt cursor-pointer transition-colors text-stitch-text appearance-none"
                        >
                          <option value={0} className="bg-stitch-surface-alt text-stitch-text-muted">Sin Canto</option>
                          <option value={1} className="bg-stitch-surface-alt text-stitch-primary">1 Lado</option>
                          <option value={2} className="bg-stitch-surface-alt text-stitch-primary">2 Lados</option>
                        </select>
                      </td>
                      <td className="p-0 text-center">
                        <label className="inline-flex items-center justify-center p-4 cursor-pointer w-full h-full">
                          <input
                            type="checkbox"
                            checked={c.puede_rotar ?? true}
                            onChange={(e) => handleChange(idx, 'puede_rotar', e.target.checked)}
                            disabled={soloLectura}
                            className="w-5 h-5 accent-stitch-primary rounded cursor-pointer border-stitch-border/50 disabled:opacity-80"
                          />
                        </label>
                      </td>
                      {!soloLectura && (
                        <td className="p-0 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarFila(idx)}
                            className="text-stitch-text-muted hover:text-stitch-danger p-4 transition-colors w-full"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-5 h-5 mx-auto" />
                          </button>
                        </td>
                      )}
                    </tr>
                    {tieneError && (
                      <tr className="bg-stitch-danger/10 border-b border-stitch-danger/20">
                        <td colSpan={8} className="px-4 py-2 text-xs text-stitch-danger font-semibold">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Debe de rellenar los campos faltantes: <strong>{faltantes.join(', ')}</strong></span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-stitch-surface-alt text-stitch-text-muted text-xs flex justify-between items-center border-t border-stitch-border/30">
            <span>Mostrando {cortes.length} pieza{cortes.length !== 1 ? 's' : ''} ingresada{cortes.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Los cambios se validan antes de guardar</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FOOTER FIJO
          ═══════════════════════════════════════════════ */}
      <footer className="fixed bottom-0 left-0 right-0 bg-stitch-surface/90 backdrop-blur-xl border-t border-stitch-border/30 z-50">

        {/* — Mobile footer: 2 filas — */}
        <div className="md:hidden px-4 pt-3 pb-4 space-y-2.5">
          {/* Fila 1: acciones secundarias */}
          <div className="flex gap-2">
            {!soloLectura && (
              <button
                onClick={agregarFila}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stitch-surface-alt text-stitch-text rounded-xl font-bold hover:brightness-95 transition-all border border-stitch-border text-sm"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Agregar Pieza
              </button>
            )}
            <button
              onClick={handleCopiarTxt}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stitch-surface-alt text-stitch-text rounded-xl border border-stitch-border transition-all text-xs font-bold"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
            <button
              onClick={handleDescargarTxt}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stitch-surface-alt text-stitch-text rounded-xl border border-stitch-border transition-all text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              .TXT
            </button>
          </div>

          {/* Fila 2: acción principal */}
          {soloLectura ? (
            <button
              onClick={onActivarEdicion}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-stitch-primary text-stitch-on-primary rounded-xl font-bold shadow-lg shadow-stitch-primary/25 transition-all active:scale-[0.98] text-base"
            >
              <Edit2 className="w-5 h-5" />
              Editar trabajo
            </button>
          ) : (
            <button
              onClick={handleConfirmar}
              disabled={cargandoGuardar}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-stitch-primary text-stitch-on-primary rounded-xl font-bold shadow-lg shadow-stitch-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 text-base"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmar y Guardar
            </button>
          )}
        </div>

        {/* — Desktop footer: fila única — */}
        <div className="hidden md:flex max-w-[1280px] mx-auto px-6 py-4 flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            {!soloLectura && (
              <button
                onClick={agregarFila}
                className="flex items-center gap-2 px-6 py-3 bg-stitch-surface-alt text-stitch-text rounded-full font-bold hover:brightness-95 transition-all shadow-sm border border-stitch-border"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Pieza</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiarTxt}
                className="flex items-center gap-2 px-4 py-3 bg-stitch-surface-alt hover:brightness-95 rounded-xl text-stitch-text transition-all border border-stitch-border"
              >
                <Copy className="w-4 h-4" />
                <span className="text-xs font-bold">Copiar (.TXT)</span>
              </button>
              <button
                onClick={handleDescargarTxt}
                className="flex items-center gap-2 px-4 py-3 bg-stitch-surface-alt hover:brightness-95 rounded-xl text-stitch-text transition-all border border-stitch-border"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-bold">Descargar (.TXT)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {soloLectura ? (
              <button
                onClick={onActivarEdicion}
                className="flex items-center gap-3 px-8 py-3.5 bg-stitch-primary text-stitch-on-primary rounded-full font-bold shadow-xl hover:shadow-stitch-primary/30 hover:scale-[1.02] transition-all active:scale-95"
              >
                <Edit2 className="w-6 h-6" />
                <span className="text-lg">Editar trabajo</span>
              </button>
            ) : (
              <button
                onClick={handleConfirmar}
                disabled={cargandoGuardar}
                className="flex items-center gap-3 px-8 py-3.5 bg-stitch-primary text-stitch-on-primary rounded-full font-bold shadow-xl hover:shadow-stitch-primary/30 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">Confirmar y Guardar</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

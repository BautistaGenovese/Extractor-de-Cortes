import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { useToast } from '../Toaster';

export default function ObraModal({ visible, obraEditar, onGuardar, onCerrar }) {
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const esEdicion = !!obraEditar;

  useEffect(() => {
    if (obraEditar) {
      setNombre(obraEditar.nombre || '');
      setCliente(obraEditar.nombre_cliente || '');
      setDescripcion(obraEditar.descripcion || '');
    } else {
      setNombre('');
      setCliente('');
      setDescripcion('');
    }
  }, [obraEditar, visible]);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast('El nombre de la obra es obligatorio', 'warning');
      return;
    }
    await onGuardar(nombre, cliente, descripcion);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-stitch-surface rounded-2xl p-6 w-full max-w-md shadow-2xl border border-stitch-border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-stitch-primary" /> {esEdicion ? 'Editar Obra' : 'Crear Nueva Obra'}
        </h3>

        <label className="block text-xs font-bold text-stitch-text-muted uppercase mb-1">Nombre de la Obra *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full bg-stitch-surface-alt border border-stitch-border/50 focus:border-stitch-primary text-sm text-stitch-text rounded-lg px-3 py-2 mb-4 outline-none"
          placeholder="Ej: Cocina Familia Pérez"
        />

        <label className="block text-xs font-bold text-stitch-text-muted uppercase mb-1">Cliente (Opcional)</label>
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full bg-stitch-surface-alt border border-stitch-border/50 focus:border-stitch-primary text-sm text-stitch-text rounded-lg px-3 py-2 mb-4 outline-none"
          placeholder="Ej: Juan Pérez"
        />

        <label className="block text-xs font-bold text-stitch-text-muted uppercase mb-1">Descripción (Opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full bg-stitch-surface-alt border border-stitch-border/50 focus:border-stitch-primary text-sm text-stitch-text rounded-lg px-3 py-2 mb-6 outline-none resize-none h-24"
          placeholder="Ej: Muebles para la cocina y lavadero..."
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-sm font-bold text-stitch-text-muted hover:bg-stitch-surface-alt rounded-xl transition-all"
          >Cancelar</button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 text-sm font-bold bg-stitch-primary text-stitch-on-primary rounded-xl hover:brightness-110 transition-all shadow-sm"
          >Guardar</button>
        </div>
      </div>
    </div>
  );
}

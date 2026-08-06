/**
 * Filtra una fecha según el criterio seleccionado.
 * @param {'todos' | 'hoy' | 'semana' | 'mes'} filtro
 * @param {string} fechaStr - Fecha en formato ISO string
 * @returns {boolean}
 */
export function checkFiltroFecha(filtro, fechaStr) {
  if (filtro === 'todos') return true;
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);
  const diffDays = Math.round((hoy - fecha) / (1000 * 60 * 60 * 24));
  if (filtro === 'hoy') return diffDays === 0;
  if (filtro === 'semana') return diffDays <= 7;
  if (filtro === 'mes') return diffDays <= 30;
  return true;
}

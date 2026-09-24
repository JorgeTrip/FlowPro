// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Representa una fila leída de las hojas de solicitud de compras
 */
export interface RegistroFilaCompra {
  fechaSolicitud: Date;
  fechaSolicitudTexto: string;
  codigoProducto: string;
  cantidadSolicitada: number;
  cantidadRecibida: number | null;
  hojaOrigen: 'Solicitud de compras' | 'Solicitud Hierbas';
}

/**
 * Estado resuelto de pedidos pendientes para enriquecer la tabla de análisis
 */
export interface EstadoPedidoCompraPendiente {
  fechaUltimaSolicitud: string | null;
  cantidadSolicitadaUltima: number | null;
  tieneMultiplesPendientes: boolean;
  totalPedidosPendientes: number;
}

/**
 * Normaliza un código de producto para comparación sin distinguir mayúsculas ni espacios
 */
function normalizarCodigo(codigo?: string | null): string {
  if (!codigo) return '';
  return String(codigo).trim().toUpperCase();
}

/**
 * Convierte un valor de fecha heterogéneo (serial de Excel, string, Date) a Date válido
 */
export function parsearFechaExcel(valor: any): { fecha: Date; texto: string } | null {
  if (valor === undefined || valor === null || valor === '') return null;

  let d: Date | null = null;

  if (valor instanceof Date) {
    d = isNaN(valor.getTime()) ? null : valor;
  } else if (typeof valor === 'number') {
    // Conversión de número de serie de Excel a fecha UTC / local
    const milisegundosPorDia = 86400 * 1000;
    const fechaBase = new Date(Date.UTC(1899, 11, 30));
    d = new Date(fechaBase.getTime() + valor * milisegundosPorDia);
  } else if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (limpio.includes('/')) {
      const partes = limpio.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        let anio = parseInt(partes[2], 10);
        if (anio < 100) anio += 2000;
        d = new Date(anio, mes, dia);
      }
    } else {
      const parsed = new Date(limpio);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
  }

  if (!d || isNaN(d.getTime())) return null;

  const diaStr = String(d.getDate()).padStart(2, '0');
  const mesStr = String(d.getMonth() + 1).padStart(2, '0');
  const anioStr = d.getFullYear();
  return { fecha: d, texto: `${diaStr}/${mesStr}/${anioStr}` };
}

/**
 * Verifica si la columna V (cantidad recibida) tiene datos válidos de entrega
 */
function tieneRecepcionEfectiva(val: any): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string' && val.trim() === '') return false;
  if (typeof val === 'number') return val > 0;
  const num = parseFloat(String(val).replace(',', '.'));
  return !isNaN(num) && num > 0;
}

/**
 * Evalúa los pedidos de compra para un producto con criticidad alta.
 * 
 * Regla de negocio:
 * 1. Solo aplica si criticidad === 'alta'.
 * 2. Busca todas las filas con el código de producto.
 * 3. Si la fila con fecha más reciente NO tiene recepción (columna V vacía), devuelve los datos.
 * 4. Si la fila con fecha más reciente YA tiene recepción, no devuelve nada.
 * 5. Si hay más de un pedido con columna V vacía, activa 'tieneMultiplesPendientes'.
 */
export function evaluarPedidosProducto(
  codigoProducto: string,
  criticidad: string,
  registros: RegistroFilaCompra[]
): EstadoPedidoCompraPendiente | null {
  if (criticidad !== 'alta') return null;

  const codigoNorm = normalizarCodigo(codigoProducto);
  if (!codigoNorm) return null;

  const coincidencias = registros.filter(
    (r) => normalizarCodigo(r.codigoProducto) === codigoNorm
  );

  if (coincidencias.length === 0) return null;

  // Ordenar de más reciente a más antigua
  const ordenadas = [...coincidencias].sort(
    (a, b) => b.fechaSolicitud.getTime() - a.fechaSolicitud.getTime()
  );

  const masReciente = ordenadas[0];

  // Si la última solicitud ya fue recibida, no devolvemos nada
  if (masReciente.cantidadRecibida !== null && masReciente.cantidadRecibida > 0) {
    return null;
  }

  // Contar cuántos pedidos están pendientes sin recepción (columna V vacía)
  const pedidosPendientes = coincidencias.filter(
    (r) => r.cantidadRecibida === null || r.cantidadRecibida <= 0
  );

  return {
    fechaUltimaSolicitud: masReciente.fechaSolicitudTexto,
    cantidadSolicitadaUltima: masReciente.cantidadSolicitada,
    tieneMultiplesPendientes: pedidosPendientes.length > 1,
    totalPedidosPendientes: pedidosPendientes.length,
  };
}

/**
 * Transforma una matriz de datos crudos (ej. leídos de Excel/XLSX) a registros estructurados
 */
export function mapearFilasCompra(
  filas: any[][],
  hojaOrigen: 'Solicitud de compras' | 'Solicitud Hierbas'
): RegistroFilaCompra[] {
  const resultado: RegistroFilaCompra[] = [];

  for (const fila of filas) {
    if (!Array.isArray(fila) || fila.length < 6) continue;

    // Col A: Fecha (índice 0)
    const fechaParsed = parsearFechaExcel(fila[0]);
    if (!fechaParsed) continue;

    // Col D: Código (índice 3)
    const codigo = String(fila[3] || '').trim();
    if (!codigo) continue;

    // Col F: Cantidad Solicitada (índice 5)
    const cantSol = typeof fila[5] === 'number' ? fila[5] : parseFloat(String(fila[5] || '0').replace(',', '.'));
    if (isNaN(cantSol) || cantSol <= 0) continue;

    // Col V: Cantidad Recibida (índice 21)
    const tieneRec = tieneRecepcionEfectiva(fila[21]);
    const cantRec = tieneRec
      ? (typeof fila[21] === 'number' ? fila[21] : parseFloat(String(fila[21]).replace(',', '.')))
      : null;

    resultado.push({
      fechaSolicitud: fechaParsed.fecha,
      fechaSolicitudTexto: fechaParsed.texto,
      codigoProducto: codigo,
      cantidadSolicitada: cantSol,
      cantidadRecibida: cantRec,
      hojaOrigen,
    });
  }

  return resultado;
}

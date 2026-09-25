import { Venta } from '../lib/types';

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function obtenerMesesConDatos(ventas: Venta[]): string[] {
  const mesesSet = new Set<string>();
  ventas.forEach((v) => {
    let mesIdx = -1;
    if (typeof v.Fecha === 'string' && v.Fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [, mm] = v.Fecha.split('/');
      mesIdx = parseInt(mm, 10) - 1;
    } else {
      const fecha = new Date(v.Fecha);
      mesIdx = fecha.getMonth();
    }
    if (mesIdx >= 0 && mesIdx < 12) {
      mesesSet.add(MESES[mesIdx]);
    }
  });
  return Array.from(mesesSet);
}

export function filtrarVentasPorMes(
  ventas: Venta[],
  filtroMes: string,
  mesesConDatos: string[]
): Venta[] {
  if (filtroMes === 'todos') return ventas;

  return ventas.filter((v) => {
    let mesVenta = '';
    if (typeof v.Fecha === 'string' && v.Fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [, mm] = v.Fecha.split('/');
      const mesIdx = parseInt(mm, 10) - 1;
      mesVenta = MESES[mesIdx] || '';
    } else {
      const fecha = new Date(v.Fecha);
      mesVenta = MESES[fecha.getMonth()] || '';
    }

    if (filtroMes === 'conDatos') {
      return mesesConDatos.includes(mesVenta);
    }
    return mesVenta === filtroMes;
  });
}

export function agruparVentasPorMes(ventas: Venta[]) {
  const resultado: Record<string, { A: number; X: number; AX: number }> = {};
  MESES.forEach((mes) => {
    resultado[mes] = { A: 0, X: 0, AX: 0 };
  });

  ventas.forEach((v) => {
    let mesIdx = -1;
    if (typeof v.Fecha === 'string' && v.Fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [, mm] = v.Fecha.split('/');
      mesIdx = parseInt(mm, 10) - 1;
    } else {
      const fecha = new Date(v.Fecha);
      mesIdx = fecha.getMonth();
    }
    const mes = MESES[mesIdx] || '';
    if (!mes) return;

    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes].X += v.Total;
      resultado[mes].AX += v.Total;
    } else {
      resultado[mes].A += v.TotalCIVA;
      resultado[mes].AX += v.TotalCIVA;
    }
  });

  return resultado;
}

export function agruparVentasPorMesCantidad(ventas: Venta[]) {
  const resultado: Record<string, { A: number; X: number; AX: number }> = {};
  MESES.forEach((mes) => {
    resultado[mes] = { A: 0, X: 0, AX: 0 };
  });

  ventas.forEach((v) => {
    let mesIdx = -1;
    if (typeof v.Fecha === 'string' && v.Fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [, mm] = v.Fecha.split('/');
      mesIdx = parseInt(mm, 10) - 1;
    } else {
      const fecha = new Date(v.Fecha);
      mesIdx = fecha.getMonth();
    }
    const mes = MESES[mesIdx] || '';
    if (!mes) return;

    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes].X += v.Cantidad;
      resultado[mes].AX += v.Cantidad;
    } else {
      resultado[mes].A += v.Cantidad;
      resultado[mes].AX += v.Cantidad;
    }
  });

  return resultado;
}

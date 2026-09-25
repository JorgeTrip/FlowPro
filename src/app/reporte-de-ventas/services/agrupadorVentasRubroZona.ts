import { Venta } from '../lib/types';
import { normalizeForComparison } from '../lib/textUtils';
import { MESES } from './agrupadorVentasGenerales';

export function agruparPorRubro(ventas: Venta[]) {
  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {
      Distribuidores: { A: 0, X: 0, AX: 0 },
      Minoristas: { A: 0, X: 0, AX: 0 },
    };
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

    const rubro = v.DescRubro === 'DISTRIBUIDOR' ? 'Distribuidores' : 'Minoristas';
    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][rubro].X += v.Total;
      resultado[mes][rubro].AX += v.Total;
    } else {
      resultado[mes][rubro].A += v.TotalCIVA;
      resultado[mes][rubro].AX += v.TotalCIVA;
    }
  });

  return resultado;
}

export function agruparPorRubroCantidad(ventas: Venta[]) {
  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {
      Distribuidores: { A: 0, X: 0, AX: 0 },
      Minoristas: { A: 0, X: 0, AX: 0 },
    };
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

    const rubro = v.DescRubro === 'DISTRIBUIDOR' ? 'Distribuidores' : 'Minoristas';
    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][rubro].X += v.Cantidad;
      resultado[mes][rubro].AX += v.Cantidad;
    } else {
      resultado[mes][rubro].A += v.Cantidad;
      resultado[mes][rubro].AX += v.Cantidad;
    }
  });

  return resultado;
}

export function agruparPorZona(ventas: Venta[]) {
  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {
      Interior: { A: 0, X: 0, AX: 0 },
      'Retiro de cliente': { A: 0, X: 0, AX: 0 },
      'G.B.A.': { A: 0, X: 0, AX: 0 },
      CABA: { A: 0, X: 0, AX: 0 },
    };
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

    let zona = '';
    const descZona = v.DescripcionZona ? normalizeForComparison(v.DescripcionZona) : '';
    if (descZona.includes('provincia')) zona = 'G.B.A.';
    else if (descZona.includes('c.a.b.a.')) zona = 'CABA';
    else if (descZona.includes('expreso')) zona = 'Interior';
    else if (normalizeForComparison(v.DescripcionZona || '') === 'hierbas del oasis - la boca') zona = 'Retiro de cliente';
    else return;

    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][zona].X += v.Total;
      resultado[mes][zona].AX += v.Total;
    } else {
      resultado[mes][zona].A += v.TotalCIVA;
      resultado[mes][zona].AX += v.TotalCIVA;
    }
  });

  return resultado;
}

export function agruparPorZonaCantidad(ventas: Venta[]) {
  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {
      Interior: { A: 0, X: 0, AX: 0 },
      'Retiro de cliente': { A: 0, X: 0, AX: 0 },
      'G.B.A.': { A: 0, X: 0, AX: 0 },
      CABA: { A: 0, X: 0, AX: 0 },
    };
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

    let zona = '';
    const descZona = v.DescripcionZona ? normalizeForComparison(v.DescripcionZona) : '';
    if (descZona.includes('provincia')) zona = 'G.B.A.';
    else if (descZona.includes('c.a.b.a.')) zona = 'CABA';
    else if (descZona.includes('expreso')) zona = 'Interior';
    else if (normalizeForComparison(v.DescripcionZona || '') === 'hierbas del oasis - la boca') zona = 'Retiro de cliente';
    else return;

    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][zona].X += v.Cantidad;
      resultado[mes][zona].AX += v.Cantidad;
    } else {
      resultado[mes][zona].A += v.Cantidad;
      resultado[mes][zona].AX += v.Cantidad;
    }
  });

  return resultado;
}

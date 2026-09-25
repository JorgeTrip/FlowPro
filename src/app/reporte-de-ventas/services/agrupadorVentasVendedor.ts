import { Venta } from '../lib/types';
import { MESES } from './agrupadorVentasGenerales';

export function resolverVendedor(
  referenciaVendedor: string,
  razonSocialCliente: string,
  clienteVendorMap?: Map<string, string>
): string {
  const vendedorVentas = referenciaVendedor?.trim() || '';
  if (!vendedorVentas && !clienteVendorMap) return '';

  if (clienteVendorMap) {
    const vendorNomina = clienteVendorMap.get(razonSocialCliente?.trim() || '');
    if (vendorNomina && vendorNomina.trim()) {
      return vendorNomina.trim();
    }
  }

  return vendedorVentas;
}

export function agruparPorVendedor(ventas: Venta[], clienteVendorMap?: Map<string, string>) {
  const vendedoresSet = new Set<string>();
  ventas.forEach((v) => {
    const vend = resolverVendedor(v.ReferenciaVendedor, v.Cliente, clienteVendorMap);
    if (vend) vendedoresSet.add(vend);
  });
  const vendedores = Array.from(vendedoresSet);

  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {};
    vendedores.forEach((vend) => {
      resultado[mes][vend] = { A: 0, X: 0, AX: 0 };
    });
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

    const vend = resolverVendedor(v.ReferenciaVendedor, v.Cliente, clienteVendorMap);
    if (!vend) return;

    if (!resultado[mes][vend]) {
      resultado[mes][vend] = { A: 0, X: 0, AX: 0 };
    }
    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][vend].X += v.Total;
      resultado[mes][vend].AX += v.Total;
    } else {
      resultado[mes][vend].A += v.TotalCIVA;
      resultado[mes][vend].AX += v.TotalCIVA;
    }
  });

  return { resultado, vendedores };
}

export function agruparPorVendedorCantidad(ventas: Venta[], clienteVendorMap?: Map<string, string>) {
  const vendedoresSet = new Set<string>();
  ventas.forEach((v) => {
    const vend = resolverVendedor(v.ReferenciaVendedor, v.Cliente, clienteVendorMap);
    if (vend) vendedoresSet.add(vend);
  });
  const vendedores = Array.from(vendedoresSet);

  const resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> = {};
  MESES.forEach((mes) => {
    resultado[mes] = {};
    vendedores.forEach((vend) => {
      resultado[mes][vend] = { A: 0, X: 0, AX: 0 };
    });
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

    const vend = resolverVendedor(v.ReferenciaVendedor, v.Cliente, clienteVendorMap);
    if (!vend) return;

    if (!resultado[mes][vend]) {
      resultado[mes][vend] = { A: 0, X: 0, AX: 0 };
    }
    const comprobante = v.NroComprobante.toUpperCase();
    if (comprobante.startsWith('X')) {
      resultado[mes][vend].X += v.Cantidad;
      resultado[mes][vend].AX += v.Cantidad;
    } else {
      resultado[mes][vend].A += v.Cantidad;
      resultado[mes][vend].AX += v.Cantidad;
    }
  });

  return { resultado, vendedores };
}

export function generarDebugLogVendedores(
  ventas: Venta[],
  clienteVendorMap?: Map<string, string>
): string[] {
  const debugLog: string[] = [];
  debugLog.push(`=== LOG DE CRUCE DE VENDEDORES ===${new Date().toLocaleString('es-AR')}`);
  debugLog.push(`Total de ventas recibidas: ${ventas.length}`);
  debugLog.push(`clienteVendorMap recibido: ${clienteVendorMap ? 'SÍ' : 'NO'}`);
  if (clienteVendorMap) {
    debugLog.push(`Entradas en el mapa: ${clienteVendorMap.size}`);
    let count = 0;
    clienteVendorMap.forEach((vendedor, razonSocial) => {
      if (count < 10) {
        debugLog.push(`  Mapa[${count}]: "${razonSocial}" → "${vendedor}"`);
      }
      count++;
    });
    if (count > 10) debugLog.push(`  ... y ${count - 10} entradas más`);
  }

  debugLog.push(`\n--- Muestra de ventas (primeras 10) ---`);
  ventas.slice(0, 10).forEach((v, i) => {
    const override = clienteVendorMap ? clienteVendorMap.get(v.Cliente?.trim() || '') : undefined;
    const esHDO = v.ReferenciaVendedor?.trim().toLowerCase() === 'hierbas del oasis';
    const vendedorFinal = esHDO && override ? override : v.ReferenciaVendedor;
    debugLog.push(
      `  Venta[${i}]: Cliente="${v.Cliente}" | VendedorVentas="${v.ReferenciaVendedor}" | EsHDO=${esHDO} | OverrideNomina="${override || '(no encontrado)'}" | VendedorFinal="${vendedorFinal}"`
    );
  });

  let totalOverridesReales = 0;
  let totalOverridesIguales = 0;
  let totalHDO = 0;
  let totalSinOverride = 0;
  const vendedoresReasignados: Map<string, number> = new Map();
  const muestraCambiosReales: string[] = [];

  ventas.forEach((v) => {
    const esHDO = v.ReferenciaVendedor?.trim().toLowerCase() === 'hierbas del oasis';
    if (esHDO) {
      totalHDO++;
      const override = clienteVendorMap ? clienteVendorMap.get(v.Cliente?.trim() || '') : undefined;
      if (override) {
        const overrideEsHDO = override.trim().toLowerCase() === 'hierbas del oasis';
        if (overrideEsHDO) {
          totalOverridesIguales++;
        } else {
          totalOverridesReales++;
          vendedoresReasignados.set(override, (vendedoresReasignados.get(override) || 0) + 1);
          if (muestraCambiosReales.length < 5) {
            muestraCambiosReales.push(`    "${v.Cliente}" | HDO → "${override}"`);
          }
        }
      } else {
        totalSinOverride++;
      }
    }
  });

  debugLog.push(`\n--- Resumen de overrides ---`);
  debugLog.push(`Total de ventas: ${ventas.length}`);
  debugLog.push(`Ventas con "Hierbas del Oasis" como vendedor: ${totalHDO}`);
  debugLog.push(`  → CAMBIO REAL (HDO → vendedor real): ${totalOverridesReales}`);
  debugLog.push(`  → SIN CAMBIO (HDO → HDO en nómina): ${totalOverridesIguales}`);
  debugLog.push(`  → Sin match en nómina: ${totalSinOverride}`);
  debugLog.push(`Ventas con vendedor real (no HDO): ${ventas.length - totalHDO} (sin cambios)`);

  if (muestraCambiosReales.length > 0) {
    debugLog.push(`\n--- Muestra de cambios reales (HDO → vendedor real) ---`);
    muestraCambiosReales.forEach((l) => debugLog.push(l));
  }

  return debugLog;
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  MapeoProductos,
  MapeoFormulas,
  MapeoStock,
  MapeoConsumo,
  MapeoStockPT,
  ProductoTerminadoMaestro,
} from './types';

import { procesarHojaEspecifica } from './excelReaderCore';

// Re-exportación de las funciones de lectura física para no romper compatibilidades
export { leerHojasExcel, procesarHojaEspecifica } from './excelReaderCore';

/**
 * ==========================================
 * SECCIÓN 2: MAPEO DE DATOS A ENTIDADES
 * ==========================================
 */

/** Parsea valores numéricos de Excel de forma tolerante a caracteres de texto */
const parsearNumero = (valor: any): number => {
  if (typeof valor === 'number') return valor;
  const parseado = parseFloat(String(valor || '').replace(',', '.').trim());
  return isNaN(parseado) ? 0 : parseado;
};

export function mapearProductos(datos: any[], mapeo: MapeoProductos): Producto[] {
  return datos
    .map((fila) => {
      const codigo = String(fila[mapeo.codigo] || '').trim();
      const descripcion = String(fila[mapeo.descripcion] || '').trim();
      const unidadMedida = String(fila[mapeo.unidadMedida] || 'u').trim();
      const puntoPedido = mapeo.puntoPedido ? parsearNumero(fila[mapeo.puntoPedido]) : 0;

      if (!codigo || !descripcion) return null;
      return { codigo, descripcion, unidadMedida, puntoPedido };
    })
    .filter((p): p is Producto => p !== null);
}

export function mapearFormulas(datos: any[], mapeo: MapeoFormulas): Formula[] {
  const formulasAgrupadas: Record<string, Formula> = {};

  for (const fila of datos) {
    const codigoProducto = String(fila[mapeo.codigoProducto] || '').trim();
    const descripcion = String(fila[mapeo.descripcionProducto] || '').trim();
    const codigoComponente = String(fila[mapeo.codigoComponente] || '').trim();
    const descripcionComponente = String(fila[mapeo.descripcionComponente] || '').trim();
    const cantidad = parsearNumero(fila[mapeo.cantidad]);
    const unidadMedida = String(fila[mapeo.unidadMedidaComponente] || 'u').trim();
    const contenido = mapeo.contenido ? String(fila[mapeo.contenido] || '').trim() : '';

    if (!codigoProducto || !codigoComponente) continue;

    if (!formulasAgrupadas[codigoProducto]) {
      formulasAgrupadas[codigoProducto] = {
        codigoProducto,
        descripcion,
        componentes: [],
        unidadMedida: 'u', // Por defecto
        rendimiento: 1,
        version: 1,
        estado: 'borrador',
        fechaCreacion: '',
        contenido,
      };
    }

    formulasAgrupadas[codigoProducto].componentes.push({
      codigoComponente,
      descripcion: descripcionComponente,
      cantidad,
      unidadMedida,
    });
  }

  return Object.values(formulasAgrupadas);
}

export function mapearStock(datos: any[], mapeo: MapeoStock): StockPorDeposito[] {
  return datos
    .map((fila) => {
      const codigoProducto = String(fila[mapeo.codigoProducto] || '').trim();
      const deposito = String(fila[mapeo.deposito] || 'Principal').trim();
      const stockFisico = parsearNumero(fila[mapeo.stockFisico]);
      const stockReservado = mapeo.stockReservado ? parsearNumero(fila[mapeo.stockReservado]) : 0;
      const unidadMedida = mapeo.unidadMedida ? String(fila[mapeo.unidadMedida] || 'u').trim() : 'u';
      const cantidadARecibir = mapeo.cantidadARecibir ? parsearNumero(fila[mapeo.cantidadARecibir]) : 0;

      if (!codigoProducto) return null;

      return {
        codigoProducto,
        deposito,
        stockFisico,
        stockReservado,
        stockDisponible: stockFisico + cantidadARecibir - stockReservado,
        unidadMedida,
        cantidadARecibir,
      };
    })
    .filter((s): s is Exclude<typeof s, null> => s !== null);
}

export function mapearConsumo(datos: any[], mapeo: MapeoConsumo): ConsumoMensual[] {
  return datos
    .map((fila) => {
      const codigoProducto = String(fila[mapeo.codigoProducto] || '').trim();
      const anio = mapeo.anio ? Math.round(parsearNumero(fila[mapeo.anio])) : 2026;
      const mes = mapeo.mes ? Math.round(parsearNumero(fila[mapeo.mes])) : 1;
      const cantidadConsumida = parsearNumero(fila[mapeo.cantidadConsumida]);

      if (!codigoProducto) return null;

      return { codigoProducto, anio, mes, cantidadConsumida };
    })
    .filter((c): c is ConsumoMensual => c !== null);
}

export function mapearStockPT(datos: any[], mapeo: MapeoStockPT): ProductoTerminadoMaestro[] {
  return datos
    .map((fila) => {
      const codigo = String(fila[mapeo.codigo] || '').trim();
      const descripcion = String(fila[mapeo.descripcion] || '').trim();
      const descripcionAdicional = mapeo.descripcionAdicional
        ? String(fila[mapeo.descripcionAdicional] || '').trim()
        : '';

      if (!codigo) return null;

      return { codigo, descripcion, descripcionAdicional };
    })
    .filter((pt): pt is ProductoTerminadoMaestro => pt !== null);
}

export async function importarPrefijosDesdeHoja(file: File, hojaNombre: string): Promise<void> {
  try {
    const { usePrefijosStore } = await import('@/app/stores/prefijosStore');
    const reglasExistentes = usePrefijosStore.getState().reglas || [];
    const tieneReglasCargadas = reglasExistentes.length > 0 && !(reglasExistentes.length === 1 && reglasExistentes[0].id === 'semilla-1');
    
    if (tieneReglasCargadas) return;

    const { data } = await procesarHojaEspecifica(file, hojaNombre);
    const importadas: any[] = [];
    data.forEach((row: any) => {
      const keys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        const key = keys.find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
        return key ? row[key] : null;
      };
      const prefijo = findVal(['prefijo']);
      const linea = findVal(['linea']);
      const sitioFabricacion = findVal(['sitio', 'fabricacion', 'planta']);
      const descripcion = findVal(['descripcion', 'detalle']);
      if (prefijo && linea && sitioFabricacion) {
        importadas.push({
          prefijo: String(prefijo).trim(),
          linea: String(linea).trim(),
          sitioFabricacion: String(sitioFabricacion).trim().toUpperCase(),
          descripcion: descripcion ? String(descripcion).trim() : undefined
        });
      }
    });

    if (importadas.length > 0) {
      usePrefijosStore.getState().importarReglas(importadas);
    }
  } catch (err) {
    console.error('Error al importar prefijos desde hoja de excel:', err);
  }
}

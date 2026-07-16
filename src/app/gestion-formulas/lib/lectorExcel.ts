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

    const { data, columns } = await procesarHojaEspecifica(file, hojaNombre);
    const importadas: any[] = [];
    const keys = columns || [];

    // Si la fila de cabecera elegida es en realidad un registro de datos de regla válido, la agregamos al inicio
    const cabeceraEsReglaValida = (k: string[]) => {
      if (k.length < 3) return false;
      const sitio = k[2].trim().toUpperCase();
      return ['CABA', 'ENTRE RIOS', 'E.R.', 'ER', 'CABA + ENTRE RIOS', 'CABA + E.R.', 'TERC. CABA', 'TERC. ENTRE RIOS', 'TERC. E.R.'].includes(sitio);
    };

    if (cabeceraEsReglaValida(keys)) {
      let sitioStr = keys[2].trim().toUpperCase();
      if (sitioStr === 'E.R.' || sitioStr === 'ENTRE RIOS' || sitioStr === 'ENTRE RÍOS' || sitioStr === 'ER') {
        sitioStr = 'ENTRE RIOS';
      } else if (sitioStr === 'CABA + E.R.' || sitioStr === 'CABA + ER' || sitioStr === 'CABA + ENTRE RIOS') {
        sitioStr = 'CABA + ENTRE RIOS';
      } else if (sitioStr === 'TERC. E.R.' || sitioStr === 'TERC. ER' || sitioStr === 'TERC. ENTRE RIOS' || sitioStr === 'TERCERIZADOS ENTRE RIOS') {
        sitioStr = 'TERC. ENTRE RIOS';
      } else if (sitioStr === 'TERC. CABA' || sitioStr === 'TERCERIZADOS CABA') {
        sitioStr = 'TERC. CABA';
      }
      importadas.push({
        prefijo: keys[0].trim(),
        linea: keys[1].trim(),
        sitioFabricacion: sitioStr,
        descripcion: keys[3] ? keys[3].trim() : undefined
      });
    }

    data.forEach((row: any) => {
      const rowKeys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        const key = rowKeys.find(k => {
          const kNormalizada = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return keywords.some(kw => {
            const kwNormalizada = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return kNormalizada.includes(kwNormalizada);
          });
        });
        return key ? row[key] : null;
      };

      const prefijo = findVal(['prefijo']) || row[rowKeys[0]];
      const linea = findVal(['linea']) || row[rowKeys[1]];
      let sitioFabricacion = findVal(['sitio', 'fabricacion', 'planta']) || row[rowKeys[2]];
      const descripcion = findVal(['descripcion', 'detalle']) || (rowKeys[3] ? row[rowKeys[3]] : undefined);
      
      if (sitioFabricacion) {
        let sitioStr = String(sitioFabricacion).trim().toUpperCase();
        if (sitioStr === 'E.R.' || sitioStr === 'ENTRE RIOS' || sitioStr === 'ENTRE RÍOS' || sitioStr === 'ER') {
          sitioStr = 'ENTRE RIOS';
        } else if (sitioStr === 'CABA + E.R.' || sitioStr === 'CABA + ER' || sitioStr === 'CABA + ENTRE RIOS') {
          sitioStr = 'CABA + ENTRE RIOS';
        } else if (sitioStr === 'TERC. E.R.' || sitioStr === 'TERC. ER' || sitioStr === 'TERC. ENTRE RIOS' || sitioStr === 'TERCERIZADOS ENTRE RIOS') {
          sitioStr = 'TERC. ENTRE RIOS';
        } else if (sitioStr === 'TERC. CABA' || sitioStr === 'TERCERIZADOS CABA') {
          sitioStr = 'TERC. CABA';
        }
        sitioFabricacion = sitioStr;
      }

      if (prefijo && linea && sitioFabricacion) {
        importadas.push({
          prefijo: String(prefijo).trim(),
          linea: String(linea).trim(),
          sitioFabricacion: String(sitioFabricacion).trim(),
          descripcion: descripcion ? String(descripcion).trim() : undefined
        });
      }
    });

    // Se importa siempre para limpiar las reglas previas y quedarse con el contenido de la hoja
    const res = usePrefijosStore.getState().importarReglas(importadas);
    console.log(`[importarPrefijosDesdeHoja] Se procesaron ${importadas.length} reglas. Resultado store:`, res);
  } catch (err) {
    console.error('Error al importar prefijos desde hoja de excel:', err);
  }
}

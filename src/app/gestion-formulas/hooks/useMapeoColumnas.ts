// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useEffect } from 'react';
import type { CampoConfig } from './configuracionCamposMapeo.ts';
import {
  COLS_DEF_PEDIDOS,
  CAMPOS_FORMULAS,
  CAMPOS_STOCK,
  CAMPOS_CONSUMO,
  CAMPOS_STOCK_PT,
  CAMPOS_PEDIDOS_COMPRA,
} from './configuracionCamposMapeo.ts';

/**
 * Normaliza una cadena de texto para comparaciones eliminando acentos,
 * saltos de línea, caracteres especiales y espacios redundantes.
 */
export function normalizarTexto(txt: string): string {
  if (!txt) return '';
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Busca la columna más adecuada según una lista priorizada de palabras clave.
 */
export function buscarCoincidenciaColumna(
  columnas: string[],
  keywords: string[],
  asignadas?: Set<string>
): string {
  if (!columnas || columnas.length === 0) return '';
  const setAsignadas = asignadas || new Set<string>();

  const normalizadas = columnas.map((c) => ({
    original: c,
    norm: normalizarTexto(c),
  }));

  for (const kw of keywords) {
    const kwNorm = normalizarTexto(kw);
    const exactaNoAsignada = normalizadas.find(
      (c) => c.norm === kwNorm && !setAsignadas.has(c.original)
    );
    if (exactaNoAsignada) return exactaNoAsignada.original;

    const exacta = normalizadas.find((c) => c.norm === kwNorm);
    if (exacta) return exacta.original;
  }

  for (const kw of keywords) {
    const kwNorm = normalizarTexto(kw);
    const parcialNoAsignada = normalizadas.find(
      (c) => c.norm.includes(kwNorm) && !setAsignadas.has(c.original)
    );
    if (parcialNoAsignada) return parcialNoAsignada.original;

    const parcial = normalizadas.find((c) => c.norm.includes(kwNorm));
    if (parcial) return parcial.original;
  }

  return '';
}

/**
 * Resuelve el mapeo de una sección garantizando que ningún campo quede sin asignar.
 */
export function resolverMapeoSeccion(columnas: string[], campos: CampoConfig[]): Record<string, string> {
  const resultado: Record<string, string> = {};
  const asignadas = new Set<string>();

  if (!columnas || columnas.length === 0) {
    campos.forEach(({ campo }) => (resultado[campo] = ''));
    return resultado;
  }

  for (const { campo, keywords } of campos) {
    const match = buscarCoincidenciaColumna(columnas, keywords, asignadas);
    if (match) {
      resultado[campo] = match;
      asignadas.add(match);
    }
  }

  for (const { campo, defaultIndex } of campos) {
    if (!resultado[campo]) {
      if (defaultIndex !== undefined && defaultIndex < columnas.length && columnas[defaultIndex]) {
        resultado[campo] = columnas[defaultIndex];
        asignadas.add(columnas[defaultIndex]);
      } else {
        const libre = columnas.find((c) => !asignadas.has(c));
        const elegida = libre || columnas[0] || '';
        resultado[campo] = elegida;
        if (elegida) asignadas.add(elegida);
      }
    }
  }

  return resultado;
}

export function useMapeoColumnas(store: any) {
  const [mapeoLocal, setMapeoLocal] = useState({
    formulas: {
      codigoProducto: '', descripcionProducto: '', codigoComponente: '',
      descripcionComponente: '', cantidad: '', unidadMedidaComponente: '', contenido: '',
    },
    stock: {
      codigoProducto: '', deposito: '', stockFisico: '', stockReservado: '',
      unidadMedida: '', cantidadARecibir: '',
    },
    consumo: { codigoProducto: '', anio: '', mes: '', cantidadConsumida: '' },
    stockPT: { codigo: '', descripcion: '', descripcionAdicional: '' },
    consumoSemi: { codigoProducto: '', anio: '', mes: '', cantidadConsumida: '' },
    pedidosCompra: { fechaSolicitud: '', codigoProducto: '', cantidadSolicitada: '', cantidadRecibida: '' },
  });

  useEffect(() => {
    const fCols = store.columnasFormulas || [];
    const sCols = store.columnasStock || [];
    const cCols = store.columnasConsumo || [];
    const ptCols = store.columnasStockPT || [];
    const csCols = store.columnasRotacionSemiElab || [];
    const pcCols = (store.columnasPedidosCompra && store.columnasPedidosCompra.length > 0)
      ? store.columnasPedidosCompra
      : COLS_DEF_PEDIDOS;

    setMapeoLocal({
      formulas: resolverMapeoSeccion(fCols, CAMPOS_FORMULAS) as any,
      stock: resolverMapeoSeccion(sCols, CAMPOS_STOCK) as any,
      consumo: resolverMapeoSeccion(cCols, CAMPOS_CONSUMO) as any,
      stockPT: resolverMapeoSeccion(ptCols, CAMPOS_STOCK_PT) as any,
      consumoSemi: resolverMapeoSeccion(csCols, CAMPOS_CONSUMO) as any,
      pedidosCompra: resolverMapeoSeccion(pcCols, CAMPOS_PEDIDOS_COMPRA) as any,
    });
  }, [
    store.columnasFormulas,
    store.columnasStock,
    store.columnasConsumo,
    store.columnasStockPT,
    store.columnasRotacionSemiElab,
    store.columnasPedidosCompra,
  ]);

  return { mapeoLocal, setMapeoLocal };
}

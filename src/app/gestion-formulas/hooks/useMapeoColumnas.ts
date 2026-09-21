// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useEffect } from 'react';

export function buscarCoincidenciaColumna(columnas: string[], keywords: string[]): string {
  for (const kw of keywords) {
    const exacta = columnas.find((c) => c.toLowerCase() === kw.toLowerCase());
    if (exacta) return exacta;
  }
  for (const kw of keywords) {
    const parcial = columnas.find((c) => c.toLowerCase().includes(kw.toLowerCase()));
    if (parcial) return parcial;
  }
  return '';
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
  });

  useEffect(() => {
    const fCols = store.columnasFormulas;
    const sCols = store.columnasStock;
    const cCols = store.columnasConsumo;
    const ptCols = store.columnasStockPT;
    const csCols = store.columnasRotacionSemiElab;

    setMapeoLocal({
      formulas: {
        codigoProducto: buscarCoincidenciaColumna(fCols, ['CÓDIGO TANGO', 'producto', 'codigo producto', 'art_cod']),
        descripcionProducto: buscarCoincidenciaColumna(fCols, ['DESCRIPCIÓN', 'descripcion', 'desc', 'detalle']),
        codigoComponente: buscarCoincidenciaColumna(fCols, ['CÓDIGO', 'componente', 'insumo', 'mp_cod']),
        descripcionComponente: buscarCoincidenciaColumna(fCols, ['ARTÍCULO', 'nombre componente', 'descripcion insumo']),
        cantidad: buscarCoincidenciaColumna(fCols, ['CANTIDAD', 'cantidad', 'cant']),
        unidadMedidaComponente: buscarCoincidenciaColumna(fCols, ['UM', 'unidad', 'um']),
        contenido: buscarCoincidenciaColumna(fCols, ['DESCRIPCIÓN ADICIONAL / CONTENIDO', 'contenido', 'adicional']),
      },
      stock: {
        codigoProducto: buscarCoincidenciaColumna(sCols, ['Código', 'articulo', 'codigo', 'art_cod']),
        deposito: buscarCoincidenciaColumna(sCols, ['Descripción depósito', 'deposito', 'almacen']),
        stockFisico: buscarCoincidenciaColumna(sCols, ['Saldo control stock', 'stock', 'fisico', 'cantidad']),
        stockReservado: buscarCoincidenciaColumna(sCols, ['Stock reservado', 'reservado']),
        unidadMedida: buscarCoincidenciaColumna(sCols, ['Unidad medida', 'um', 'unidad']),
        cantidadARecibir: buscarCoincidenciaColumna(sCols, ['Pendiente de remitir', 'a recibir', 'pendiente']),
      },
      consumo: {
        codigoProducto: buscarCoincidenciaColumna(cCols, ['CODIGO', 'codigo', 'insumo', 'mp_cod']),
        anio: buscarCoincidenciaColumna(cCols, ['AÑO', 'año', 'ejercicio']),
        mes: buscarCoincidenciaColumna(cCols, ['MES', 'mes', 'periodo']),
        cantidadConsumida: buscarCoincidenciaColumna(cCols, ['CANTIDAD', 'consumo', 'cantidad']),
      },
      stockPT: {
        codigo: buscarCoincidenciaColumna(ptCols, ['CÓDIGO TANGO', 'codigo', 'articulo']),
        descripcion: buscarCoincidenciaColumna(ptCols, ['DESCRIPCIÓN', 'descripcion', 'producto']),
        descripcionAdicional: buscarCoincidenciaColumna(ptCols, ['DESCRIPCIÓN ADICIONAL', 'adicional', 'contenido']),
      },
      consumoSemi: {
        codigoProducto: buscarCoincidenciaColumna(csCols, ['CODIGO', 'codigo', 'insumo', 'mp_cod']),
        anio: buscarCoincidenciaColumna(csCols, ['AÑO', 'año', 'ejercicio']),
        mes: buscarCoincidenciaColumna(csCols, ['MES', 'mes', 'periodo']),
        cantidadConsumida: buscarCoincidenciaColumna(csCols, ['CANTIDAD', 'consumo', 'cantidad']),
      },
    });
  }, [
    store.columnasFormulas,
    store.columnasStock,
    store.columnasConsumo,
    store.columnasStockPT,
    store.columnasRotacionSemiElab,
  ]);

  return { mapeoLocal, setMapeoLocal };
}

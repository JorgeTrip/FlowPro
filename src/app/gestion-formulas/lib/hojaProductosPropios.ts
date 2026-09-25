// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { ResultadoMRP } from './types';
import { aplicarBordesExternos } from './excelEstilos';
import {
  obtenerColumnasProductosPropios,
  estilarEncabezadoPropios,
  estilarCeldaDatosPropios,
} from './estilosProductosPropios';

function construirFilaProductoPropio(
  r: ResultadoMRP,
  pt: any,
  esPrimeraFila: boolean,
  modoMacro: boolean,
  mesesTransferencia: number,
  mesesCompra: number
) {
  if (modoMacro) {
    return {
      codigoMP: esPrimeraFila ? r.codigoMP : '',
      descripcionMP: esPrimeraFila ? r.descripcionMP : '',
      unidadMedida: esPrimeraFila ? r.unidadMedida : '',
      codigoProducto: pt?.codigoProducto || '',
      productosUsados: pt?.descripcion || '',
      linea: pt?.linea || '',
      stockMPEntreRios: esPrimeraFila ? r.stockMPEntreRios : null,
      stockPTEntreRios: pt?.stockPTEntreRios ?? 0,
      totalEntreRios: (r.stockMPEntreRios ?? 0) + (pt?.stockPTEntreRios ?? 0),
      stockMPCABA: esPrimeraFila ? r.stockMPCABA : null,
      stockPTCABA: pt?.stockPTCABA ?? 0,
      totalCABA: (r.stockMPCABA ?? 0) + (pt?.stockPTCABA ?? 0),
      rotacionMensual: pt?.rotacionMensual ?? 0,
      rotacionTransf: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesTransferencia : 0,
      rotacionCompra: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesCompra : 0,
      transferirPT: pt?.transferirPT ?? 0,
      transferirMP: esPrimeraFila ? (r.movimientoSugerido.transferencia ?? 0) : null,
      transferirMPCabaEr: esPrimeraFila ? (r.movimientoSugerido.transferenciaCabaEr ?? 0) : null,
      cantidadFabricarCABA: pt?.produccionExistenteCABA ?? 0,
      cantidadFabricarER: pt?.produccionExistenteER ?? 0,
      comprar: esPrimeraFila ? (r.movimientoSugerido.compra ?? 0) : null,
      cantidadSugerida: esPrimeraFila ? r.cantidadSugerida : null,
      criticidad: esPrimeraFila ? r.criticidad.toUpperCase() : '',
      fechaUltimoPedido: esPrimeraFila ? (r.pedidoCompraPendiente?.fechaUltimaSolicitud || '-') : '',
      cantidadPedida: esPrimeraFila ? (r.pedidoCompraPendiente?.cantidadSolicitadaUltima ?? null) : null,
    };
  }

  return {
    codigoMP: esPrimeraFila ? r.codigoMP : '',
    descripcionMP: esPrimeraFila ? r.descripcionMP : '',
    unidadMedida: esPrimeraFila ? r.unidadMedida : '',
    stockMPEntreRios: esPrimeraFila ? r.stockMPEntreRios : null,
    stockMPCABA: esPrimeraFila ? r.stockMPCABA : null,
    codigoProducto: pt?.codigoProducto || '',
    productosUsados: pt?.descripcion || '',
    linea: pt?.linea || '',
    stockPTEntreRios: pt?.stockPTEntreRios ?? 0,
    stockPTCABA: pt?.stockPTCABA ?? 0,
    rotacionMensual: pt?.rotacionMensual ?? 0,
    rotacionTransf: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesTransferencia : 0,
    rotacionCompra: pt?.rotacionMensual !== undefined ? pt.rotacionMensual * mesesCompra : 0,
    transferirPT: pt?.transferirPT ?? 0,
    transferirMP: esPrimeraFila ? (r.movimientoSugerido.transferencia ?? 0) : null,
    transferirMPCabaEr: esPrimeraFila ? (r.movimientoSugerido.transferenciaCabaEr ?? 0) : null,
    cantidadFabricarCABA: pt?.produccionExistenteCABA ?? 0,
    cantidadFabricarER: pt?.produccionExistenteER ?? 0,
    comprar: esPrimeraFila ? (r.movimientoSugerido.compra ?? 0) : null,
    cantidadSugerida: esPrimeraFila ? r.cantidadSugerida : null,
    criticidad: esPrimeraFila ? r.criticidad.toUpperCase() : '',
    fechaUltimoPedido: esPrimeraFila ? (r.pedidoCompraPendiente?.fechaUltimaSolicitud || '-') : '',
    cantidadPedida: esPrimeraFila ? (r.pedidoCompraPendiente?.cantidadSolicitadaUltima ?? null) : null,
  };
}

export function agregarHojaProductosPropios(
  wb: ExcelJS.Workbook,
  propios: ResultadoMRP[],
  mesesTransferencia: number = 2,
  mesesCompra: number = 3,
  modoMacro: boolean = false
): void {
  const wsP = wb.addWorksheet('Productos Propios');
  wsP.views = [{ state: 'frozen', ySplit: 1 }];

  const cols = obtenerColumnasProductosPropios(modoMacro, mesesTransferencia, mesesCompra);
  wsP.columns = cols;
  const numCols = cols.length;

  const headerRow = wsP.getRow(1);
  headerRow.height = 40;
  for (let c = 1; c <= numCols; c++) {
    estilarEncabezadoPropios(headerRow.getCell(c), c, modoMacro);
  }

  let filaActual = 2;
  (propios || []).forEach((r, idx) => {
    const N = Math.max(1, r.productosUsados?.length || 0);
    const filaInicio = filaActual;

    for (let i = 0; i < N; i++) {
      const pt = r.productosUsados?.[i];
      const rowData = construirFilaProductoPropio(r, pt, i === 0, modoMacro, mesesTransferencia, mesesCompra);

      wsP.addRow(rowData);
      const row = wsP.getRow(filaActual);
      row.height = 20;

      for (let c = 1; c <= numCols; c++) {
        estilarCeldaDatosPropios(row.getCell(c), c, idx, numCols, modoMacro, r.criticidad);
      }
      filaActual++;
    }

    if (N > 1) {
      const filaFin = filaInicio + N - 1;
      const mergeCols = modoMacro
        ? [1, 2, 3, 7, 10, 17, 18, 21, 22, 23, 24, 25]
        : [1, 2, 3, 4, 5, 15, 16, 19, 20, 21, 22, 23];
      mergeCols.forEach((c) => {
        wsP.mergeCells(filaInicio, c, filaFin, c);
      });
    }
  });

  if (filaActual > 2) {
    aplicarBordesExternos(wsP, filaActual - 1, numCols);
  }
}

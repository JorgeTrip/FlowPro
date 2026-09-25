// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { borderFino } from './excelEstilos';

export function obtenerColumnasProductosPropios(
  modoMacro: boolean,
  mesesTransferencia: number,
  mesesCompra: number
) {
  if (modoMacro) {
    return [
      { header: 'CÓDIGO MP', key: 'codigoMP' },
      { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
      { header: 'UM', key: 'unidadMedida' },
      { header: 'CÓDIGO PT', key: 'codigoProducto' },
      { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados' },
      { header: 'LÍNEA DE PRODUCTO', key: 'linea' },
      { header: 'STOCK MP\nE.R.', key: 'stockMPEntreRios' },
      { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
      { header: 'TOTAL PT + MP\nE.R.', key: 'totalEntreRios' },
      { header: 'STOCK MP\nCABA', key: 'stockMPCABA' },
      { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
      { header: 'TOTAL PT + MP\nCABA', key: 'totalCABA' },
      { header: 'ROT. MENSUAL\nPT', key: 'rotacionMensual' },
      { header: `ROT. ${mesesTransferencia}M PT\n(TRANSF.)`, key: 'rotacionTransf' },
      { header: `ROT. ${mesesCompra}M PT\n(COMPRA)`, key: 'rotacionCompra' },
      { header: 'TRANSF. PT\n(E.R.→CABA)', key: 'transferirPT' },
      { header: 'TRANSF. MP\n(E.R.→CABA)', key: 'transferirMP' },
      { header: 'TRANSF. MP\n(CABA→E.R.)', key: 'transferirMPCabaEr' },
      { header: 'PRODUCIR PT\nCABA', key: 'cantidadFabricarCABA' },
      { header: 'PRODUCIR PT\nE.R.', key: 'cantidadFabricarER' },
      { header: 'COMPRA MP', key: 'comprar' },
      { header: 'CANTIDAD\nNECESARIA MP', key: 'cantidadSugerida' },
      { header: 'CRITICIDAD', key: 'criticidad' },
      { header: 'FEC. ÚLT. PEDIDO', key: 'fechaUltimoPedido' },
      { header: 'CANT. PEDIDA', key: 'cantidadPedida' },
    ];
  }

  return [
    { header: 'CÓDIGO MP', key: 'codigoMP' },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP' },
    { header: 'UM', key: 'unidadMedida' },
    { header: 'STOCK MP\nE.R.', key: 'stockMPEntreRios' },
    { header: 'STOCK MP\nCABA', key: 'stockMPCABA' },
    { header: 'CÓDIGO PT', key: 'codigoProducto' },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados' },
    { header: 'LÍNEA DE PRODUCTO', key: 'linea' },
    { header: 'STOCK PT\nE.R.', key: 'stockPTEntreRios' },
    { header: 'STOCK PT\nCABA', key: 'stockPTCABA' },
    { header: 'ROT. MENSUAL\nPT', key: 'rotacionMensual' },
    { header: `ROT. ${mesesTransferencia}M PT\n(TRANSF.)`, key: 'rotacionTransf' },
    { header: `ROT. ${mesesCompra}M PT\n(COMPRA)`, key: 'rotacionCompra' },
    { header: 'TRANSF. PT\n(E.R.→CABA)', key: 'transferirPT' },
    { header: 'TRANSF. MP\n(E.R.→CABA)', key: 'transferirMP' },
    { header: 'TRANSF. MP\n(CABA→E.R.)', key: 'transferirMPCabaEr' },
    { header: 'PRODUCIR PT\nCABA', key: 'cantidadFabricarCABA' },
    { header: 'PRODUCIR PT\nE.R.', key: 'cantidadFabricarER' },
    { header: 'COMPRA MP', key: 'comprar' },
    { header: 'CANTIDAD\nNECESARIA MP', key: 'cantidadSugerida' },
    { header: 'CRITICIDAD', key: 'criticidad' },
    { header: 'FEC. ÚLT. PEDIDO', key: 'fechaUltimoPedido' },
    { header: 'CANT. PEDIDA', key: 'cantidadPedida' },
  ];
}

export function estilarEncabezadoPropios(cell: ExcelJS.Cell, c: number, modoMacro: boolean) {
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cell.border = borderFino;

  let fillBg = 'FFF8F9FA';
  let fontColor = 'FF5F6368';

  const esGris = modoMacro ? [1, 2, 3, 4, 5, 6, 24, 25].includes(c) : [1, 2, 3, 6, 7, 8, 22, 23].includes(c);
  const esVerde = modoMacro ? [7, 8, 9].includes(c) : [4, 9].includes(c);
  const esVioleta = modoMacro ? [10, 11, 12].includes(c) : [5, 10].includes(c);
  const esAmarillo = modoMacro ? [16, 17, 18, 19, 20, 21].includes(c) : [14, 15, 16, 17, 18, 19].includes(c);
  const esAzul = modoMacro ? c === 22 : c === 20;

  if (esGris) { fillBg = 'FFF1F3F4'; fontColor = 'FF5F6368'; }
  else if (esVerde) { fillBg = 'FFE6F4EA'; fontColor = 'FF137333'; }
  else if (esVioleta) { fillBg = 'FFF3E8FF'; fontColor = 'FF6B21A8'; }
  else if (esAmarillo) { fillBg = 'FFFFF4E5'; fontColor = 'FFB06000'; }
  else if (esAzul) { fillBg = 'FFE6F0FA'; fontColor = 'FF1A73E8'; }

  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillBg } };
  cell.font = { bold: true, size: 9.5, name: 'Segoe UI', color: { argb: fontColor } };
}

export function estilarCeldaDatosPropios(
  cell: ExcelJS.Cell,
  c: number,
  idx: number,
  numCols: number,
  modoMacro: boolean,
  criticidad: string
) {
  const par = idx % 2 === 0;
  let cellBg = par ? 'FFFFFFFF' : 'FFF9F9F9';
  let cellFontColor = 'FF000000';

  const esGrisCell = modoMacro ? [1, 2, 3, 4, 5, 6, 24, 25].includes(c) : [1, 2, 3, 6, 7, 8, 22, 23].includes(c);
  const esVerdeCell = modoMacro ? [7, 8, 9].includes(c) : [4, 9].includes(c);
  const esVioletaCell = modoMacro ? [10, 11, 12].includes(c) : [5, 10].includes(c);
  const esAmarilloCell = modoMacro ? [16, 17, 18, 19, 20, 21].includes(c) : [14, 15, 16, 17, 18, 19].includes(c);
  const esAzulCell = modoMacro ? c === 22 : c === 20;

  if (esGrisCell) { cellBg = par ? 'FFFFFFFF' : 'FFF9F9F9'; cellFontColor = 'FF333333'; }
  else if (esVerdeCell) { cellBg = par ? 'FFF4FAF6' : 'FFEBF7EE'; cellFontColor = 'FF137333'; }
  else if (esVioletaCell) { cellBg = par ? 'FFF9F5FF' : 'FFF5EBFF'; cellFontColor = 'FF6B21A8'; }
  else if (esAmarilloCell) { cellBg = par ? 'FFFFFDF9' : 'FFFFF9F0'; cellFontColor = 'FFB06000'; }
  else if (esAzulCell) { cellBg = par ? 'FFF4F9FE' : 'FFEBF3FC'; cellFontColor = 'FF1A73E8'; }

  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBg } };
  cell.border = borderFino;
  cell.font = { name: 'Segoe UI', size: 9, color: { argb: cellFontColor } };

  const isCenter = [1, 3, 6, numCols - 2, numCols - 1].includes(c) || (modoMacro && c === 4);
  const isLeft = [2, 7].includes(c) || (modoMacro && c === 5);
  cell.alignment = { horizontal: isCenter ? 'center' : isLeft ? 'left' : 'right', vertical: 'top' };

  if (c === numCols - 2) {
    const cVal = (criticidad || '').toLowerCase();
    let fBg = 'FFFFFFFF';
    let fColor = 'FF000000';
    if (cVal === 'alta') { fBg = 'FFFCE8E6'; fColor = 'FFC5221F'; }
    else if (cVal === 'media') { fBg = 'FEF7E0'; fColor = 'FFB06000'; }
    else if (cVal === 'baja') { fBg = 'FFE6F4EA'; fColor = 'FF137333'; }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fBg } };
    cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: fColor } };
  }

  const isNumeric = modoMacro
    ? [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25].includes(c)
    : [4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23].includes(c);
  if (isNumeric && cell.value !== null && cell.value !== '') {
    cell.numFmt = '#,##0.0';
  }
}

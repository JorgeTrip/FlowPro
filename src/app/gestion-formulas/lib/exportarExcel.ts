// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ResultadosMRPFinal } from './motorMRP';

/**
 * Genera y descarga un archivo Excel con los requerimientos MRP divididos en dos solapas:
 * - "Productos Propios" (explosión inversa a nivel de materias primas)
 * - "Productos Tercerizados" (análisis directo a nivel de producto terminado)
 */
export async function exportarExcelMRP(resultados: ResultadosMRPFinal): Promise<void> {
  const wb = new ExcelJS.Workbook();

  // 1. Hoja de Productos Propios
  const wsP = wb.addWorksheet('Productos Propios');
  wsP.columns = [
    { header: 'CÓDIGO MP', key: 'codigoMP', width: 15 },
    { header: 'DESCRIPCIÓN MP', key: 'descripcionMP', width: 35 },
    { header: 'UM', key: 'unidadMedida', width: 8 },
    { header: 'STOCK MP ENTRE RÍOS', key: 'stockMPEntreRios', width: 18 },
    { header: 'STOCK MP CABA', key: 'stockMPCABA', width: 14 },
    { header: 'CANT. SUGERIDA', key: 'cantidadSugerida', width: 16 },
    { header: 'MOVIMIENTO SUGERIDO', key: 'movimientoSugerido', width: 25 },
    { header: 'PRODUCTOS EN LOS QUE SE USA', key: 'productosUsados', width: 40 },
    { header: 'CANTIDAD PRODUCTO (ROTACIÓN)', key: 'rotacionProductos', width: 30 },
  ];

  (resultados.propios || []).forEach((r) => {
    const productosTexto = r.productosUsados.map((p) => p.descripcion).join(', ');
    const rotacionTexto = r.productosUsados.map((p) => p.rotacion.toFixed(1)).join(', ');
    
    let movimientoTexto = '[Sin Acción]';
    if (r.movimientoSugerido.tipo === 'transferencia' && r.movimientoSugerido.transferencia !== undefined) {
      movimientoTexto = `[Transf E/R: ${r.movimientoSugerido.transferencia.toFixed(1)}]`;
    } else if (r.movimientoSugerido.tipo === 'compra' && r.movimientoSugerido.compra !== undefined) {
      movimientoTexto = `[Compra: ${r.movimientoSugerido.compra.toFixed(1)}]`;
    } else if (r.movimientoSugerido.tipo === 'combinado' && r.movimientoSugerido.transferencia !== undefined && r.movimientoSugerido.compra !== undefined) {
      movimientoTexto = `[Transf E/R: ${r.movimientoSugerido.transferencia.toFixed(1)}] + [Compra: ${r.movimientoSugerido.compra.toFixed(1)}]`;
    }

    wsP.addRow({
      codigoMP: r.codigoMP,
      descripcionMP: r.descripcionMP,
      unidadMedida: r.unidadMedida,
      stockMPEntreRios: r.stockMPEntreRios,
      stockMPCABA: r.stockMPCABA,
      cantidadSugerida: r.cantidadSugerida,
      movimientoSugerido: movimientoTexto,
      productosUsados: productosTexto,
      rotacionProductos: rotacionTexto,
    });
  });

  // 2. Hoja de Productos Tercerizados
  if (resultados.tercerizados && resultados.tercerizados.length > 0) {
    const wsT = wb.addWorksheet('Productos Tercerizados');
    wsT.columns = [
      { header: 'CÓDIGO', key: 'codigoPT', width: 15 },
      { header: 'DESCRIPCIÓN', key: 'descripcionPT', width: 45 },
      { header: 'STOCK PT ENTRE RÍOS', key: 'stockPTEntreRios', width: 18 },
      { header: 'STOCK PT CABA', key: 'stockPTCABA', width: 14 },
      { header: 'ROTACIÓN', key: 'rotacion', width: 14 },
      { header: 'MOVIMIENTO SUGERIDO', key: 'movimientoSugerido', width: 25 },
    ];

    resultados.tercerizados.forEach((r) => {
      let movimientoTexto = '[Sin Acción]';
      if (r.movimientoSugerido.tipo === 'transferencia' && r.movimientoSugerido.transferencia !== undefined) {
        movimientoTexto = `[Transf E/R: ${r.movimientoSugerido.transferencia.toFixed(1)}]`;
      } else if (r.movimientoSugerido.tipo === 'compra' && r.movimientoSugerido.compra !== undefined) {
        movimientoTexto = `[Compra: ${r.movimientoSugerido.compra.toFixed(1)}]`;
      } else if (r.movimientoSugerido.tipo === 'combinado' && r.movimientoSugerido.transferencia !== undefined && r.movimientoSugerido.compra !== undefined) {
        movimientoTexto = `[Transf E/R: ${r.movimientoSugerido.transferencia.toFixed(1)}] + [Compra: ${r.movimientoSugerido.compra.toFixed(1)}]`;
      }

      wsT.addRow({
        codigoPT: r.codigoPT,
        descripcionPT: r.descripcionPT,
        stockPTEntreRios: r.stockPTEntreRios,
        stockPTCABA: r.stockPTCABA,
        rotacion: r.rotacion,
        movimientoSugerido: movimientoTexto,
      });
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `FlowPro_Requerimientos_MRP_${Date.now()}.xlsx`);
}

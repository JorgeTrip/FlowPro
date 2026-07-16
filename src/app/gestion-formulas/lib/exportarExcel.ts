// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ResultadosMRPFinal } from './types';
import { agregarHojaProductosPropios } from './hojaProductosPropios';
import { agregarHojaMateriasPrimas } from './hojaMateriasPrimas';
import { agregarHojaRelacionMPPT } from './hojaRelacionMPPT';
import { agregarHojaTercerizados } from './hojaTercerizados';
import { autoAjustarColumnas } from './excelEstilos';

/**
 * Exporta los resultados del MRP a un libro de Excel (.xlsx) estructurado en 4 hojas.
 * 
 * Hojas generadas:
 * 1. "Productos Propios": Vista consolidada agrupada por MP con PT (cálculos de MP no repetidos y alineados top).
 * 2. "Materias Primas": Consolidado único de materias primas (sin duplicar filas).
 * 3. "Relación MP - PT": Vista plana ideal para ordenamiento y tablas dinámicas cruzadas.
 * 4. "Productos Tercerizados": Lista de productos terminados comprados de forma directa.
 */
export async function exportarExcelMRP(
  resultados: ResultadosMRPFinal,
  mesesTransferencia: number = 2,
  mesesCompra: number = 3,
  modoMacro: boolean = false
): Promise<void> {
  try {
    const wb = new ExcelJS.Workbook();

    let propios = resultados.propios || [];
    let tercerizados = resultados.tercerizados || [];

    if (modoMacro) {
      propios = propios.map((p) => ({
        ...p,
        productosUsados: p.productosUsados?.filter((pt) => pt.codigoProducto.toLowerCase().endsWith('k')) || []
      })).filter((p) => p.productosUsados.length > 0);

      tercerizados = tercerizados.filter((pt) => pt.codigoPT.toLowerCase().endsWith('k'));
    }

    // 1. Hoja de Productos Propios (Agrupados y alineados verticalmente arriba)
    agregarHojaProductosPropios(wb, propios, mesesTransferencia, mesesCompra);

    // 2. Hoja de Materias Primas (Una fila única por MP para tablas dinámicas limpias)
    agregarHojaMateriasPrimas(wb, propios, mesesTransferencia, mesesCompra);

    // 3. Hoja de Relación MP - PT (Desglose plano para ordenamientos)
    agregarHojaRelacionMPPT(wb, propios);

    // 4. Hoja de Productos Tercerizados
    agregarHojaTercerizados(wb, tercerizados, mesesTransferencia, mesesCompra);

    // Auto-ajustar el ancho de columnas en todas las hojas creadas
    wb.worksheets.forEach((ws) => {
      autoAjustarColumnas(ws);
    });

    // Guardar el libro de Excel en el cliente
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FlowPro_Requerimientos_MRP_${Date.now()}.xlsx`);
    
    console.log('Se exportó a Excel exitosamente.');
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Error al exportar a Excel. Por favor, intente nuevamente.');
  }
}

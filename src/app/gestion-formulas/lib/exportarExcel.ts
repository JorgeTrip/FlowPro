// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ResultadosMRPFinal } from './types';
import { agregarHojaProductosPropios } from './hojaProductosPropios';
import { agregarHojaMateriasPrimas } from './hojaMateriasPrimas';
import { agregarHojaRelacionMPPT } from './hojaRelacionMPPT';
import { agregarHojaTercerizados } from './hojaTercerizados';

/**
 * Exporta los resultados del MRP a un libro de Excel (.xlsx) estructurado en 4 hojas.
 * 
 * Hojas generadas:
 * 1. "Productos Propios": Vista consolidada agrupada por MP con PT (cálculos de MP no repetidos y alineados top).
 * 2. "Materias Primas": Consolidado único de materias primas (sin duplicar filas).
 * 3. "Relación MP - PT": Vista plana ideal para ordenamiento y tablas dinámicas cruzadas.
 * 4. "Productos Tercerizados": Lista de productos terminados comprados de forma directa.
 */
export async function exportarExcelMRP(resultados: ResultadosMRPFinal): Promise<void> {
  try {
    const wb = new ExcelJS.Workbook();

    // 1. Hoja de Productos Propios (Agrupados y alineados verticalmente arriba)
    agregarHojaProductosPropios(wb, resultados.propios || []);

    // 2. Hoja de Materias Primas (Una fila única por MP para tablas dinámicas limpias)
    agregarHojaMateriasPrimas(wb, resultados.propios || []);

    // 3. Hoja de Relación MP - PT (Desglose plano para ordenamientos)
    agregarHojaRelacionMPPT(wb, resultados.propios || []);

    // 4. Hoja de Productos Tercerizados
    agregarHojaTercerizados(wb, resultados.tercerizados || []);

    // Guardar el libro de Excel en el cliente
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FlowPro_Requerimientos_MRP_${Date.now()}.xlsx`);
    
    console.log('Se exportó a Excel exitosamente.');
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Error al exportar a Excel. Por favor, intente nuevamente.');
  }
}

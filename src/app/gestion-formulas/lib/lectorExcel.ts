// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  MapeoProductos,
  MapeoFormulas,
  MapeoStock,
  MapeoConsumo,
} from './types';

/**
 * ==========================================
 * SECCIÓN 1: LECTURA FÍSICA DE EXCEL Y HOJAS
 * ==========================================
 */

/**
 * Lee el archivo Excel y devuelve un listado de nombres de todas sus solapas.
 */
export async function leerHojasExcel(archivo: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        resolve(workbook.worksheets.map((ws) => ws.name));
      } catch (err) {
        reject(err);
      }
    };
    lector.onerror = () => reject(new Error('Error de lectura física del archivo.'));
    lector.readAsArrayBuffer(archivo);
  });
}

/**
 * Parsea el resultado de una celda de Excel resolviendo fórmulas o textos enriquecidos.
 */
function procesarValorCelda(celda: ExcelJS.Cell): any {
  const valor = celda.value;
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString();

  if (typeof valor === 'object') {
    // Si la celda contiene una fórmula, extraemos el resultado evaluado
    if ('result' in valor) {
      return valor.result === null || valor.result === undefined ? '' : valor.result;
    }
    // Si contiene texto enriquecido, concatenamos los fragmentos
    if ('richText' in valor) {
      return (valor as any).richText?.map((rt: any) => rt.text).join('') || '';
    }
    // Si es un hipervínculo
    if ('text' in valor) {
      return (valor as any).text || '';
    }
    return String(valor);
  }
  return valor;
}

/**
 * Lee una hoja específica del archivo Excel y la transforma en filas de objetos genéricos.
 */
export async function procesarHojaEspecifica(
  archivo: File,
  nombreHoja: string,
  filaCabeceraIndex: number = 1
): Promise<{ data: any[]; columns: string[]; previewData: any[] }> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet(nombreHoja);
        if (!worksheet) {
          return reject(new Error(`No se encontró la hoja '${nombreHoja}' en el archivo.`));
        }

        let indexCabecera = filaCabeceraIndex;

        // Función auxiliar para procesar los valores directos del array row.values
        const procesarValorDirecto = (valor: any): string => {
          if (valor === null || valor === undefined) return '';
          if (typeof valor === 'object') {
            if ('result' in valor) return String(valor.result ?? '');
            if ('richText' in valor) return (valor.richText as any[])?.map((rt) => rt.text).join('') || '';
            if ('text' in valor) return String(valor.text ?? '');
            return String(valor);
          }
          return String(valor);
        };

        // Bucle inteligente que escanea las primeras 5 filas de forma independiente en esta hoja
        if (indexCabecera === 1) {
          const palabrasClave = [
            'codigo', 'código', 'producto', 'articulo', 'artículo', 'tango',
            'formula', 'fórmula', 'stock', 'saldo', 'deposito', 'depósito',
            'rotacion', 'rotación', 'cantidad', 'cant', 'um', 'componente',
            'insumo', 'medida', 'receta', 'bom'
          ];

          let primerFilaConColumnas = 1;
          let encontroCabecera = false;

          for (let r = 1; r <= Math.min(5, worksheet.rowCount); r++) {
            const fila = worksheet.getRow(r);
            const cols = ((fila.values as any[])?.slice(1) || [])
              .map((c) => String(procesarValorDirecto(c) || '').trim())
              .filter((c) => c !== '');

            if (cols.length >= 3) {
              const colsUnicas = new Set(cols);
              const esTituloRepetido = colsUnicas.size <= 2;

              if (primerFilaConColumnas === 1 && !esTituloRepetido) {
                primerFilaConColumnas = r;
              }

              const tienePalabraClave = cols.some((c) =>
                palabrasClave.some((p) => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(p))
              );

              if (tienePalabraClave && !esTituloRepetido) {
                indexCabecera = r;
                encontroCabecera = true;
                break;
              }
            }
          }

          // Fallback: Si no coincide ninguna palabra clave, usar la primera fila con columnas válidas
          if (!encontroCabecera && primerFilaConColumnas !== 1) {
            indexCabecera = primerFilaConColumnas;
          }
        }

        const filaCabecera = worksheet.getRow(indexCabecera);
        const columnas: string[] = ((filaCabecera.values as any[])?.slice(1) || [])
          .map((c) => String(procesarValorDirecto(c) || '').trim())
          .filter((c) => c !== '');

        console.log(`[lectorExcel] Solapa: '${nombreHoja}' -> Fila cabecera elegida: ${indexCabecera}. Columnas detectadas:`, columnas);

        const data: any[] = [];
        const previewData: any[] = [];

        for (let i = indexCabecera + 1; i <= worksheet.rowCount; i++) {
          const fila = worksheet.getRow(i);
          const filaObjeto: any = {};
          let tieneValores = false;

          for (let j = 1; j <= columnas.length; j++) {
            const cabecera = columnas[j - 1];
            const celda = fila.getCell(j);
            const valor = procesarValorCelda(celda);

            filaObjeto[cabecera] = valor;
            if (valor !== '') tieneValores = true;
          }

          if (tieneValores) {
            data.push(filaObjeto);
            if (previewData.length < 5) {
              previewData.push({ ...filaObjeto });
            }
          }
        }

        console.log(`[lectorExcel] Solapa: '${nombreHoja}' -> Importadas con éxito: ${data.length} filas.`);
        resolve({ data, columns: columnas, previewData });
      } catch (err) {
        reject(err);
      }
    };
    lector.onerror = () => reject(new Error('Error de lectura física de la hoja.'));
    lector.readAsArrayBuffer(archivo);
  });
}

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

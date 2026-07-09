// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';

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
    if ('result' in valor) {
      return valor.result === null || valor.result === undefined ? '' : valor.result;
    }
    if ('richText' in valor) {
      return (valor as any).richText?.map((rt: any) => rt.text).join('') || '';
    }
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

          if (!encontroCabecera && primerFilaConColumnas !== 1) {
            indexCabecera = primerFilaConColumnas;
          }
        }

        const filaCabecera = worksheet.getRow(indexCabecera);
        const columnas: string[] = ((filaCabecera.values as any[])?.slice(1) || [])
          .map((c) => String(procesarValorDirecto(c) || '').trim())
          .filter((c) => c !== '');

        console.log(`[excelReaderCore] Solapa: '${nombreHoja}' -> Fila cabecera elegida: ${indexCabecera}. Columnas detectadas:`, columnas);

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

        console.log(`[excelReaderCore] Solapa: '${nombreHoja}' -> Importadas con éxito: ${data.length} filas.`);
        resolve({ data, columns: columnas, previewData });
      } catch (err) {
        reject(err);
      }
    };
    lector.onerror = () => reject(new Error('Error de lectura física de la hoja.'));
    lector.readAsArrayBuffer(archivo);
  });
}

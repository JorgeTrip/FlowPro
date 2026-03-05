// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as htmlToImage from 'html-to-image';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportChartAsPNG = async (
  chartContainerRef: React.RefObject<HTMLDivElement | null>,
  filename: string = 'chart'
) => {
  if (!chartContainerRef.current) {
    console.error('Chart container reference not found');
    return;
  }

  const container = chartContainerRef.current;
  let cloneContainer: HTMLDivElement | null = null;

  try {
    // 1. Create a clone of the original container
    const clonedElement = container.cloneNode(true) as HTMLElement;

    // 2. Freeze the dimensions of Recharts containers to prevent 100% height collapse
    const originalRecharts = container.querySelectorAll('.recharts-responsive-container');
    const clonedRecharts = clonedElement.querySelectorAll('.recharts-responsive-container');
    originalRecharts.forEach((orig, index) => {
      const rect = orig.getBoundingClientRect();
      const cloneCol = clonedRecharts[index] as HTMLElement;
      if (cloneCol) {
        cloneCol.style.width = `${rect.width}px`;
        cloneCol.style.height = `${rect.height}px`;
      }
    });

    // 3. Remove classes that enforce stretching (h-full, etc) to allow shrink-to-fit
    clonedElement.classList.remove('h-full');
    clonedElement.style.height = 'auto';
    clonedElement.style.maxHeight = 'none';
    // Remove minHeight override so child cards (like in Ventas Promedio) keep their Tailwind heights
    clonedElement.style.minHeight = '';

    // 4. Remove control panels entirely from the clone to avoid empty gaps
    const controls = clonedElement.querySelectorAll('.bg-gray-50, .bg-slate-50, fieldset, button, select, input, .chart-controls');
    controls.forEach(el => el.remove());

    // 5. Create an invisible container in the body to hold the clone so computed styles work
    cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '-9999px';
    cloneContainer.style.top = '-9999px';
    cloneContainer.style.width = `${container.offsetWidth}px`;
    cloneContainer.appendChild(clonedElement);
    document.body.appendChild(cloneContainer);

    // Give the browser a tick to reflow
    await new Promise(resolve => setTimeout(resolve, 100));

    // 6. Capture the clone using html-to-image
    const scale = 2; // High resolution
    const dataUrl = await htmlToImage.toPng(clonedElement, {
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      style: {
        background: '#ffffff',
        margin: '0',
      }
    });

    // 7. Download
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Chart exported successfully');

  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    alert('Error al exportar el gráfico. Por favor, intente nuevamente o tome una captura de pantalla manualmente.');
  } finally {
    // 8. Clean up the clone from the DOM
    if (cloneContainer && cloneContainer.parentNode) {
      cloneContainer.parentNode.removeChild(cloneContainer);
    }
  }
};

/**
 * Exporta datos a un archivo Excel (.xlsx)
 * @param data Matriz de datos (filas x columnas), donde la primera fila son los encabezados
 * @param filename Nombre del archivo sin extensión
 * @param sheetName Nombre de la hoja de cálculo
 */
export const exportToExcel = async (
  data: (string | number | null | undefined)[][],
  filename: string,
  sheetName: string = 'Datos'
) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Añadir filas
    worksheet.addRows(data);

    // Dar formato a la primera fila (encabezados)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Ajustar ancho de columnas (aproximación simple)
    if (data.length > 0) {
      const numColumns = data[0].length;
      for (let i = 1; i <= numColumns; i++) {
        const column = worksheet.getColumn(i);
        let maxLength = 0;
        // Comprobar las primeras 50 filas para rendimiento
        let rowCount = 0;

        column.eachCell({ includeEmpty: true }, (cell) => {
          if (rowCount < 50) {
            const cellValue = cell.value ? String(cell.value) : '';
            const columnLength = cellValue.length;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
            rowCount++;
          }
        });

        column.width = maxLength < 10 ? 10 : (maxLength > 50 ? 50 : maxLength + 2);
      }
    }

    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
    
    console.log('Excel exported successfully');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error al exportar a Excel. Por favor, intente nuevamente.');
  }
};

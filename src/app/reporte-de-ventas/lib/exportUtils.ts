// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as htmlToImage from 'html-to-image';

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

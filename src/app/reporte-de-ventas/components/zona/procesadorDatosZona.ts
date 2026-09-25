import { FilaTablaZonaAcumulado } from './types';

export function procesarDatosTablaZona(
  modoVista: 'acumulado' | 'comparativo',
  ventasPorZona: Record<string, Record<string, { A: number; X: number }>>,
  cantidadesPorZona: Record<string, Record<string, { A: number; X: number }>>,
  zonasSeleccionadas: string[],
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  ordenAscendente: boolean,
  mostrarVariacion: boolean
): (FilaTablaZonaAcumulado | any)[] {
  if (modoVista === 'acumulado') {
    const mapaAgrupado: Record<string, FilaTablaZonaAcumulado> = {};

    mesesSeleccionados.forEach((mes) => {
      const subzonas = ventasPorZona[mes];
      if (!subzonas) return;

      Object.entries(subzonas).forEach(([subzona, data]) => {
        const nombreZona = subzona || 'Sin zona';
        if (zonasSeleccionadas.includes(nombreZona)) {
          if (!mapaAgrupado[nombreZona]) {
            mapaAgrupado[nombreZona] = {
              zona: nombreZona,
              importeA: 0,
              importeX: 0,
              cantidadA: 0,
              cantidadX: 0,
              total: 0,
              totalCantidad: 0,
            };
          }
          const cantidades = cantidadesPorZona[mes]?.[subzona] || { A: 0, X: 0 };
          mapaAgrupado[nombreZona].importeA += data.A || 0;
          mapaAgrupado[nombreZona].importeX += data.X || 0;
          mapaAgrupado[nombreZona].cantidadA += cantidades.A || 0;
          mapaAgrupado[nombreZona].cantidadX += cantidades.X || 0;
          mapaAgrupado[nombreZona].total += (data.A || 0) + (data.X || 0);
          mapaAgrupado[nombreZona].totalCantidad += (cantidades.A || 0) + (cantidades.X || 0);
        }
      });
    });

    const datos = Object.values(mapaAgrupado);
    datos.sort((a, b) => {
      const valorA = mostrarCantidad ? a.totalCantidad : a.total;
      const valorB = mostrarCantidad ? b.totalCantidad : b.total;
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });
    return datos;
  } else {
    const mapaZonas: Record<string, any> = {};
    zonasSeleccionadas.forEach((zona) => {
      mapaZonas[zona] = { zona, meses: {}, variaciones: {}, total: 0 };
    });

    mesesSeleccionados.forEach((mes, index) => {
      zonasSeleccionadas.forEach((zona) => {
        const dataVenta = ventasPorZona[mes]?.[zona] || { A: 0, X: 0 };
        const dataCant = cantidadesPorZona[mes]?.[zona] || { A: 0, X: 0 };
        const valorActual = mostrarCantidad
          ? (dataCant.A || 0) + (dataCant.X || 0)
          : (dataVenta.A || 0) + (dataVenta.X || 0);

        if (mapaZonas[zona]) {
          mapaZonas[zona].meses[mes] = valorActual;
          mapaZonas[zona].total += valorActual;

          if (index > 0 && mostrarVariacion) {
            const mesAnterior = mesesSeleccionados[index - 1];
            const valorAnterior = mapaZonas[zona].meses[mesAnterior] || 0;
            if (valorAnterior > 0) {
              mapaZonas[zona].variaciones[mes] =
                ((valorActual - valorAnterior) / valorAnterior) * 100;
            }
          }
        }
      });
    });

    const datos = Object.values(mapaZonas).filter((item: any) => item.total > 0);
    datos.sort((a: any, b: any) => (ordenAscendente ? a.total - b.total : b.total - a.total));
    return datos;
  }
}

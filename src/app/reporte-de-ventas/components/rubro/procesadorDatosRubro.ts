import { FilaTablaRubroAcumulado } from './types';

export function procesarDatosTablaRubro(
  modoVista: 'acumulado' | 'comparativo',
  ventasPorRubro: Record<string, Record<string, { A: number; X: number }>>,
  cantidadesPorRubro: Record<string, Record<string, { A: number; X: number }>>,
  rubrosSeleccionados: string[],
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  ordenAscendente: boolean,
  mostrarVariacion: boolean
): (FilaTablaRubroAcumulado | any)[] {
  if (modoVista === 'acumulado') {
    const mapaAgrupado: Record<string, FilaTablaRubroAcumulado> = {};

    mesesSeleccionados.forEach((mes) => {
      const subrubros = ventasPorRubro[mes];
      if (!subrubros) return;

      Object.entries(subrubros).forEach(([subrubro, data]) => {
        const nombreRubro = subrubro || 'Sin rubro';
        if (rubrosSeleccionados.includes(nombreRubro)) {
          if (!mapaAgrupado[nombreRubro]) {
            mapaAgrupado[nombreRubro] = {
              rubro: nombreRubro,
              importeA: 0,
              importeX: 0,
              cantidadA: 0,
              cantidadX: 0,
              total: 0,
              totalCantidad: 0,
            };
          }
          const cantidades = cantidadesPorRubro[mes]?.[subrubro] || { A: 0, X: 0 };
          mapaAgrupado[nombreRubro].importeA += data.A || 0;
          mapaAgrupado[nombreRubro].importeX += data.X || 0;
          mapaAgrupado[nombreRubro].cantidadA += cantidades.A || 0;
          mapaAgrupado[nombreRubro].cantidadX += cantidades.X || 0;
          mapaAgrupado[nombreRubro].total += (data.A || 0) + (data.X || 0);
          mapaAgrupado[nombreRubro].totalCantidad += (cantidades.A || 0) + (cantidades.X || 0);
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
    const mapaRubros: Record<string, any> = {};
    rubrosSeleccionados.forEach((rubro) => {
      mapaRubros[rubro] = { rubro, meses: {}, variaciones: {}, total: 0 };
    });

    mesesSeleccionados.forEach((mes, index) => {
      rubrosSeleccionados.forEach((rubro) => {
        const dataVenta = ventasPorRubro[mes]?.[rubro] || { A: 0, X: 0 };
        const dataCant = cantidadesPorRubro[mes]?.[rubro] || { A: 0, X: 0 };
        const valorActual = mostrarCantidad
          ? (dataCant.A || 0) + (dataCant.X || 0)
          : (dataVenta.A || 0) + (dataVenta.X || 0);

        if (mapaRubros[rubro]) {
          mapaRubros[rubro].meses[mes] = valorActual;
          mapaRubros[rubro].total += valorActual;

          if (index > 0 && mostrarVariacion) {
            const mesAnterior = mesesSeleccionados[index - 1];
            const valorAnterior = mapaRubros[rubro].meses[mesAnterior] || 0;
            if (valorAnterior > 0) {
              mapaRubros[rubro].variaciones[mes] =
                ((valorActual - valorAnterior) / valorAnterior) * 100;
            }
          }
        }
      });
    });

    const datos = Object.values(mapaRubros).filter((item: any) => item.total > 0);
    datos.sort((a: any, b: any) => (ordenAscendente ? a.total - b.total : b.total - a.total));
    return datos;
  }
}

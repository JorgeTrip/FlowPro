import { FilaVendedorAcumulado, FilaVendedorComparativo, MesDato } from './types';

export function procesarDatosTablaVendedor(
  modoVista: 'acumulado' | 'comparativo',
  ventasPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> },
  cantidadesPorVendedor: { resultado: Record<string, Record<string, { A: number; X: number; AX: number }>> },
  vendedoresSeleccionados: string[],
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  ordenAscendente: boolean
): (FilaVendedorAcumulado | FilaVendedorComparativo)[] {
  if (modoVista === 'acumulado') {
    const mapaAgrupado: Record<string, FilaVendedorAcumulado> = {};

    mesesSeleccionados.forEach((mes) => {
      const subvendedores = ventasPorVendedor.resultado[mes] || {};
      Object.entries(subvendedores).forEach(([_subvendedor, data]) => {
        const nombreVendedor = _subvendedor || 'Sin vendedor';

        if (vendedoresSeleccionados.includes(nombreVendedor)) {
          if (!mapaAgrupado[nombreVendedor]) {
            mapaAgrupado[nombreVendedor] = {
              vendedor: nombreVendedor,
              importeA: 0,
              importeX: 0,
              cantidadA: 0,
              cantidadX: 0,
              total: 0,
              totalCantidad: 0,
            };
          }

          const cantidades = cantidadesPorVendedor.resultado[mes]?.[_subvendedor] || { A: 0, X: 0 };
          mapaAgrupado[nombreVendedor].importeA += data.A || 0;
          mapaAgrupado[nombreVendedor].importeX += data.X || 0;
          mapaAgrupado[nombreVendedor].cantidadA += cantidades.A || 0;
          mapaAgrupado[nombreVendedor].cantidadX += cantidades.X || 0;
          mapaAgrupado[nombreVendedor].total += (data.A || 0) + (data.X || 0);
          mapaAgrupado[nombreVendedor].totalCantidad += (cantidades.A || 0) + (cantidades.X || 0);
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
    const mapaComparativo: Record<string, FilaVendedorComparativo> = {};

    vendedoresSeleccionados.forEach((vendedor) => {
      mapaComparativo[vendedor] = {
        vendedor,
        totalGlobalImporte: 0,
        totalGlobalCantidad: 0,
        meses: {},
      };

      mesesSeleccionados.forEach((mes) => {
        const dataImp = ventasPorVendedor.resultado[mes]?.[vendedor] || { A: 0, X: 0 };
        const dataCant = cantidadesPorVendedor.resultado[mes]?.[vendedor] || { A: 0, X: 0 };

        const importeTotal = (dataImp.A || 0) + (dataImp.X || 0);
        const cantidadTotal = (dataCant.A || 0) + (dataCant.X || 0);

        mapaComparativo[vendedor].meses[mes] = {
          importeA: dataImp.A || 0,
          importeX: dataImp.X || 0,
          cantidadA: dataCant.A || 0,
          cantidadX: dataCant.X || 0,
          totalImporte: importeTotal,
          totalCantidad: cantidadTotal,
        };

        mapaComparativo[vendedor].totalGlobalImporte += importeTotal;
        mapaComparativo[vendedor].totalGlobalCantidad += cantidadTotal;
      });
    });

    const datos = Object.values(mapaComparativo).filter((d) =>
      mostrarCantidad ? d.totalGlobalCantidad > 0 : d.totalGlobalImporte > 0
    );

    datos.sort((a, b) => {
      const valorA = mostrarCantidad ? a.totalGlobalCantidad : a.totalGlobalImporte;
      const valorB = mostrarCantidad ? b.totalGlobalCantidad : b.totalGlobalImporte;
      return ordenAscendente ? valorA - valorB : valorB - valorA;
    });
    return datos;
  }
}

export function calcularTotalesVendedorComparativo(
  datosProcesados: FilaVendedorComparativo[],
  mesesSeleccionados: string[]
) {
  const totales = {
    totalGlobalImporte: 0,
    totalGlobalCantidad: 0,
    meses: {} as Record<string, MesDato>,
  };

  mesesSeleccionados.forEach((mes) => {
    totales.meses[mes] = {
      importeA: 0,
      importeX: 0,
      cantidadA: 0,
      cantidadX: 0,
      totalImporte: 0,
      totalCantidad: 0,
    };
  });

  datosProcesados.forEach((item) => {
    totales.totalGlobalImporte += item.totalGlobalImporte;
    totales.totalGlobalCantidad += item.totalGlobalCantidad;

    mesesSeleccionados.forEach((mes) => {
      if (item.meses[mes]) {
        totales.meses[mes].importeA += item.meses[mes].importeA;
        totales.meses[mes].importeX += item.meses[mes].importeX;
        totales.meses[mes].cantidadA += item.meses[mes].cantidadA;
        totales.meses[mes].cantidadX += item.meses[mes].cantidadX;
        totales.meses[mes].totalImporte += item.meses[mes].totalImporte;
        totales.meses[mes].totalCantidad += item.meses[mes].totalCantidad;
      }
    });
  });

  return totales;
}

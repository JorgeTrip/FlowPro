'use client';

import React from 'react';
import { Bar, LabelList } from 'recharts';
import { DatoGraficoMensual } from './types';
import { SegmentLabel, TotalLabel } from './EtiquetasVentasMensuales';

interface BarrasVentasMensualesProps {
  metrica: 'importe' | 'cantidad';
  modoVista: 'acumulado' | 'comparativo';
  mostrarVariacion: boolean;
  barSize: number;
  data: DatoGraficoMensual[];
}

export const BarrasVentasMensuales: React.FC<BarrasVentasMensualesProps> = ({
  metrica,
  modoVista,
  mostrarVariacion,
  barSize,
  data,
}) => {
  if (metrica === 'importe') {
    return (
      <>
        <Bar
          dataKey="A"
          stackId="ventas"
          barSize={barSize}
          fill="url(#colorBarA)"
          name="Facturas"
          stroke="#6c5ce7"
          strokeWidth={1}
          filter="url(#shadowVentasMensuales)"
        >
          <LabelList
            dataKey="A"
            content={(props) => (
              <SegmentLabel
                {...props}
                serie="A"
                data={data}
                metrica={metrica}
                modoVista={modoVista}
                mostrarVariacion={mostrarVariacion}
              />
            )}
          />
        </Bar>
        <Bar
          dataKey="X"
          stackId="ventas"
          barSize={barSize}
          fill="url(#colorBarX)"
          name="Remitos"
          stroke="#6eb58a"
          strokeWidth={1}
          filter="url(#shadowVentasMensuales)"
        >
          <LabelList
            dataKey="X"
            content={(props) => (
              <SegmentLabel
                {...props}
                serie="X"
                data={data}
                metrica={metrica}
                modoVista={modoVista}
                mostrarVariacion={mostrarVariacion}
              />
            )}
          />
          <LabelList
            dataKey="X"
            position="top"
            content={(p) => (
              <TotalLabel
                {...p}
                data={data}
                metrica={metrica}
                modoVista={modoVista}
                mostrarVariacion={mostrarVariacion}
              />
            )}
          />
        </Bar>
      </>
    );
  }

  return (
    <>
      <Bar
        dataKey="cantidadA"
        stackId="ventas"
        barSize={barSize}
        fill="url(#colorBarA)"
        name="Facturas (cantidad)"
        stroke="#6c5ce7"
        strokeWidth={1}
        filter="url(#shadowVentasMensuales)"
      >
        <LabelList
          dataKey="cantidadA"
          content={(props) => (
            <SegmentLabel
              {...props}
              serie="cantidadA"
              data={data}
              metrica={metrica}
              modoVista={modoVista}
              mostrarVariacion={mostrarVariacion}
            />
          )}
        />
      </Bar>
      <Bar
        dataKey="cantidadX"
        stackId="ventas"
        barSize={barSize}
        fill="url(#colorBarX)"
        name="Remitos (cantidad)"
        stroke="#6eb58a"
        strokeWidth={1}
        filter="url(#shadowVentasMensuales)"
      >
        <LabelList
          dataKey="cantidadX"
          content={(props) => (
            <SegmentLabel
              {...props}
              serie="cantidadX"
              data={data}
              metrica={metrica}
              modoVista={modoVista}
              mostrarVariacion={mostrarVariacion}
            />
          )}
        />
        <LabelList
          dataKey="cantidadX"
          position="top"
          content={(p) => (
            <TotalLabel
              {...p}
              data={data}
              metrica={metrica}
              modoVista={modoVista}
              mostrarVariacion={mostrarVariacion}
            />
          )}
        />
      </Bar>
    </>
  );
};

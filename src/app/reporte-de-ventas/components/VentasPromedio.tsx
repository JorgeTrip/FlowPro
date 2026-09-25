// 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { exportChartAsPNG } from '../lib/exportUtils';
import { useAppStore } from '@/app/stores/appStore';
import { ControlPanel, ControlGroup, SelectControl, ButtonControl } from './shared/ControlPanel';
import { TarjetaPromedio } from './promedios/TarjetaPromedio';

interface VentasPromedioProps {
  ventasPorMes: Record<string, { A: number; X: number; AX: number }>;
  cantidadesPorMes: Record<string, { A: number; X: number; AX: number }>;
}

export const VentasPromedio = ({ ventasPorMes, cantidadesPorMes }: VentasPromedioProps) => {
  const [metrica, setMetrica] = useState<'importe' | 'cantidad'>('importe');
  const [filtroMeses, setFiltroMeses] = useState<'todos' | 'conDatos' | 'individual'>('conDatos');
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
  const [mesesConDatos, setMesesConDatos] = useState<string[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const tema = useAppStore((state) => state.configuracionGlobal.tema);
  const esOscuro = tema === 'dark';

  const meses = useMemo(
    () => [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    []
  );

  useEffect(() => {
    const mesesDisponibles = meses.filter((mes) => {
      const mesData = ventasPorMes[mes];
      return mesData && (mesData.A > 0 || mesData.X > 0 || mesData.AX > 0);
    });
    setMesesConDatos(mesesDisponibles);

    if (filtroMeses === 'individual' && !mesSeleccionado && mesesDisponibles.length > 0) {
      setMesSeleccionado(mesesDisponibles[0]);
    }
  }, [ventasPorMes, filtroMeses, mesSeleccionado, meses]);

  const promedios = useMemo(() => {
    let mesesACalcular: string[] = [];

    if (filtroMeses === 'todos') {
      mesesACalcular = meses;
    } else if (filtroMeses === 'conDatos') {
      mesesACalcular = mesesConDatos;
    } else if (filtroMeses === 'individual' && mesSeleccionado) {
      mesesACalcular = [mesSeleccionado];
    }

    const totales = { A: 0, X: 0, AX: 0, cantidadA: 0, cantidadX: 0, cantidadAX: 0 };
    let mesesValidos = 0;

    mesesACalcular.forEach((mes) => {
      const mesData = ventasPorMes[mes];
      const cantidadData = cantidadesPorMes[mes];

      if (mesData && (mesData.A > 0 || mesData.X > 0 || mesData.AX > 0)) {
        totales.A += mesData.A;
        totales.X += mesData.X;
        totales.AX += mesData.AX;

        if (cantidadData) {
          totales.cantidadA += cantidadData.A;
          totales.cantidadX += cantidadData.X;
          totales.cantidadAX += cantidadData.AX;
        }
        mesesValidos++;
      }
    });

    if (mesesValidos === 0) {
      return { A: 0, X: 0, AX: 0, cantidadA: 0, cantidadX: 0, cantidadAX: 0, mesesValidos: 0 };
    }

    return {
      A: totales.A / mesesValidos,
      X: totales.X / mesesValidos,
      AX: totales.AX / mesesValidos,
      cantidadA: totales.cantidadA / mesesValidos,
      cantidadX: totales.cantidadX / mesesValidos,
      cantidadAX: totales.cantidadAX / mesesValidos,
      mesesValidos,
    };
  }, [ventasPorMes, cantidadesPorMes, filtroMeses, mesSeleccionado, mesesConDatos, meses]);

  const handleExport = () => {
    exportChartAsPNG(chartRef, 'ventas-promedio');
  };

  return (
    <div
      ref={chartRef}
      className={`rounded-lg border p-6 shadow-sm ${esOscuro ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-lg font-semibold ${esOscuro ? 'text-gray-200' : 'text-gray-800'}`}>Venta Promedio</h4>
      </div>

      <ControlPanel title="Controles de Visualización">
        <ControlGroup label="Exportar">
          <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
            <CameraIcon className="w-4 h-4" />
          </ButtonControl>
        </ControlGroup>

        <ControlGroup label="Filtro de Meses">
          <SelectControl
            value={filtroMeses}
            onChange={(value) => {
              setFiltroMeses(value as 'todos' | 'conDatos' | 'individual');
              if (value === 'individual' && mesesConDatos.length > 0 && !mesSeleccionado) {
                setMesSeleccionado(mesesConDatos[0]);
              }
            }}
            options={[
              { value: 'todos', label: 'Todos los meses' },
              { value: 'conDatos', label: 'Solo con datos' },
              { value: 'individual', label: 'Seleccionar mes' },
            ]}
            className="w-44"
          />
          {filtroMeses === 'individual' && (
            <SelectControl
              value={mesSeleccionado || (mesesConDatos.length > 0 ? mesesConDatos[0] : meses[0])}
              onChange={(value) => setMesSeleccionado(value)}
              options={meses.map((mes) => ({
                value: mes,
                label: `${mes}${!mesesConDatos.includes(mes) ? ' (sin datos)' : ''}`,
                disabled: !mesesConDatos.includes(mes),
              }))}
              className="w-36"
            />
          )}
        </ControlGroup>

        <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

        <ControlGroup label="Métrica">
          <SelectControl
            value={metrica}
            onChange={(value) => setMetrica(value as 'importe' | 'cantidad')}
            options={[
              { value: 'importe', label: 'Importe' },
              { value: 'cantidad', label: 'Cantidad' },
            ]}
            className="w-32"
          />
        </ControlGroup>
      </ControlPanel>

      <div className="space-y-4">
        <TarjetaPromedio
          label={metrica === 'importe' ? 'Promedio Facturas' : 'Promedio Facturas (cantidad)'}
          value={metrica === 'importe' ? promedios.A : promedios.cantidadA}
          color="#8884d8"
          metrica={metrica}
          esOscuro={esOscuro}
        />
        <TarjetaPromedio
          label={metrica === 'importe' ? 'Promedio Remitos' : 'Promedio Remitos (cantidad)'}
          value={metrica === 'importe' ? promedios.X : promedios.cantidadX}
          color="#82ca9d"
          metrica={metrica}
          esOscuro={esOscuro}
        />
        <TarjetaPromedio
          label={metrica === 'importe' ? 'Promedio Facturas + Remitos' : 'Promedio Facturas + Remitos (cantidad)'}
          value={metrica === 'importe' ? promedios.AX : promedios.cantidadAX}
          color="#ffc658"
          metrica={metrica}
          esOscuro={esOscuro}
        />
      </div>

      <div className="text-center mt-4">
        <span className={`text-sm ${esOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
          {filtroMeses === 'individual'
            ? `Datos del mes: ${mesSeleccionado}`
            : `Promedio calculado sobre ${promedios.mesesValidos} ${
                promedios.mesesValidos === 1 ? 'mes' : 'meses'
              } con datos`}
        </span>
      </div>
    </div>
  );
};

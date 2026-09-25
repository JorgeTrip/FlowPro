'use client';

import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import {
  ControlPanel,
  ControlGroup,
  SwitchControl,
  SelectControl,
  ButtonControl,
  RangeControl,
  MultiSelectDropdown,
} from '../shared/ControlPanel';

interface ControlesVentasRubroProps {
  onExport: () => void;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (meses: string[]) => void;
  mesesConDatos: string[];
  activeMetric: 'importe' | 'cantidad';
  setMetric: (v: 'importe' | 'cantidad') => void;
  modoVista: 'acumulado' | 'comparativo';
  setModoVista: (v: 'acumulado' | 'comparativo') => void;
  distanciaEtiquetas: number;
  setDistanciaEtiquetas: (v: number) => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
}

export const ControlesVentasRubro: React.FC<ControlesVentasRubroProps> = ({
  onExport,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  activeMetric,
  setMetric,
  modoVista,
  setModoVista,
  distanciaEtiquetas,
  setDistanciaEtiquetas,
  mostrarVariacion,
  setMostrarVariacion,
}) => {
  return (
    <ControlPanel title="Controles de Visualización">
      <ControlGroup label="Exportar">
        <ButtonControl onClick={onExport} variant="icon" title="Exportar como PNG">
          <CameraIcon className="w-4 h-4" />
        </ButtonControl>
      </ControlGroup>

      <ControlGroup label="Meses">
        <MultiSelectDropdown
          options={meses}
          selected={mesesSeleccionados}
          onChange={setMesesSeleccionados}
          optionsWithData={mesesConDatos}
          label="Meses"
        />
      </ControlGroup>

      <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

      <ControlGroup label="Métrica">
        <SelectControl
          value={activeMetric}
          onChange={(value) => setMetric(value as 'importe' | 'cantidad')}
          options={[
            { value: 'importe', label: 'Importe' },
            { value: 'cantidad', label: 'Cantidad' },
          ]}
          className="w-32"
        />
      </ControlGroup>

      <ControlGroup label="Vista">
        <SelectControl
          value={modoVista}
          onChange={(value) => setModoVista(value as 'acumulado' | 'comparativo')}
          options={[
            { value: 'acumulado', label: 'Acumulado' },
            {
              value: 'comparativo',
              label: 'Comparativo',
              disabled: mesesSeleccionados.length < 2,
            },
          ]}
        />
      </ControlGroup>

      {modoVista === 'acumulado' && (
        <RangeControl
          value={distanciaEtiquetas}
          onChange={setDistanciaEtiquetas}
          min={1}
          max={6}
          step={0.5}
          label="Distancia etiquetas"
        />
      )}

      {modoVista === 'comparativo' && (
        <SwitchControl
          checked={mostrarVariacion}
          onChange={setMostrarVariacion}
          label="Variación %"
        />
      )}
    </ControlPanel>
  );
};

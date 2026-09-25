'use client';

import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import {
  ControlPanel,
  ControlGroup,
  SelectControl,
  ButtonControl,
  MultiSelectDropdown,
  SwitchControl,
} from '../shared/ControlPanel';

interface ControlesVentasVendedorProps {
  onExport: () => void;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (m: string[]) => void;
  mesesConDatos: string[];
  metric: 'importe' | 'cantidad';
  setMetric: (v: 'importe' | 'cantidad') => void;
  modoVista: 'acumulado' | 'comparativo';
  setModoVista: (v: 'acumulado' | 'comparativo') => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
}

export const ControlesVentasVendedor: React.FC<ControlesVentasVendedorProps> = ({
  onExport,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  metric,
  setMetric,
  modoVista,
  setModoVista,
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
          value={metric}
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

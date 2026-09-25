'use client';

import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import {
  ControlPanel,
  ControlGroup,
  SwitchControl,
  SelectControl,
  ButtonControl,
  MultiSelectDropdown,
  RangeControl,
} from '../shared/ControlPanel';

interface ControlesVentasMensualesProps {
  handleExport: () => void;
  meses: string[];
  mesesSeleccionados: string[];
  setMesesSeleccionados: (v: string[]) => void;
  mesesConDatos: string[];
  metrica: 'importe' | 'cantidad';
  setMetrica: (v: 'importe' | 'cantidad') => void;
  barSize: number;
  setBarSize: (v: number) => void;
  setBarSizeTouched: (v: boolean) => void;
  modoVista: 'acumulado' | 'comparativo';
  setModoVista: (v: 'acumulado' | 'comparativo') => void;
  mostrarVariacion: boolean;
  setMostrarVariacion: (v: boolean) => void;
  dataLength: number;
}

export const ControlesVentasMensuales: React.FC<ControlesVentasMensualesProps> = ({
  handleExport,
  meses,
  mesesSeleccionados,
  setMesesSeleccionados,
  mesesConDatos,
  metrica,
  setMetrica,
  barSize,
  setBarSize,
  setBarSizeTouched,
  modoVista,
  setModoVista,
  mostrarVariacion,
  setMostrarVariacion,
  dataLength,
}) => {
  return (
    <ControlPanel title="Controles de Visualización" className="mb-2">
      <ControlGroup label="Exportar">
        <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
          <CameraIcon className="w-4 h-4" />
        </ButtonControl>
      </ControlGroup>

      <ControlGroup label="Meses">
        <MultiSelectDropdown
          label="Meses"
          options={meses}
          selected={mesesSeleccionados}
          onChange={setMesesSeleccionados}
          optionsWithData={mesesConDatos}
        />
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

      <RangeControl
        value={barSize}
        onChange={(v) => {
          setBarSizeTouched(true);
          setBarSize(v);
        }}
        min={10}
        max={70}
        step={1}
        label="Ancho barra"
      />

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
          disabled={dataLength < 2}
        />
      )}
    </ControlPanel>
  );
};

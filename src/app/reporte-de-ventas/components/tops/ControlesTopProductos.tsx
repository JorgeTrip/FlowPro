'use client';

import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import {
  ControlPanel,
  ControlGroup,
  SelectControl,
  SwitchControl,
  ButtonControl,
} from '../shared/ControlPanel';

interface ControlesTopProductosProps {
  tipo: 'mas' | 'menos';
  setTipo: (v: 'mas' | 'menos') => void;
  metric: 'importe' | 'cantidad';
  setMetric: (v: 'importe' | 'cantidad') => void;
  numProductos: number;
  setNumProductos: (v: number) => void;
  excluirAjustes: boolean;
  setExcluirAjustes: (v: boolean) => void;
  handleExport: () => void;
}

export const ControlesTopProductos: React.FC<ControlesTopProductosProps> = ({
  tipo,
  setTipo,
  metric,
  setMetric,
  numProductos,
  setNumProductos,
  excluirAjustes,
  setExcluirAjustes,
  handleExport,
}) => {
  return (
    <ControlPanel title="Controles de Visualización">
      <ControlGroup label="Exportar">
        <ButtonControl onClick={handleExport} variant="icon" title="Exportar como PNG">
          <CameraIcon className="w-4 h-4" />
        </ButtonControl>
      </ControlGroup>

      <ControlGroup label="Tipo">
        <SelectControl
          value={tipo}
          onChange={(value) => setTipo(value as 'mas' | 'menos')}
          options={[
            { value: 'mas', label: 'Más vendidos' },
            { value: 'menos', label: 'Menos vendidos' },
          ]}
          className="w-36"
        />
      </ControlGroup>

      <ControlGroup label="Cantidad">
        <SelectControl
          value={String(numProductos)}
          onChange={(value) => setNumProductos(Number(value))}
          options={[
            { value: '5', label: 'Top 5' },
            { value: '10', label: 'Top 10' },
            { value: '15', label: 'Top 15' },
            { value: '20', label: 'Top 20' },
          ]}
          className="w-28"
        />
      </ControlGroup>

      <ControlGroup label="Métrica">
        <SelectControl
          value={metric}
          onChange={(value) => setMetric(value as 'importe' | 'cantidad')}
          options={[
            { value: 'cantidad', label: 'Cantidad' },
            { value: 'importe', label: 'Importe' },
          ]}
          className="w-32"
        />
      </ControlGroup>

      <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

      <ControlGroup label="Filtros">
        <SwitchControl
          checked={excluirAjustes}
          onChange={setExcluirAjustes}
          label="Excluir ajustes y combos"
        />
      </ControlGroup>
    </ControlPanel>
  );
};

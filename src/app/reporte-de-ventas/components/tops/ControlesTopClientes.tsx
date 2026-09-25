'use client';

import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { ControlPanel, ControlGroup, SelectControl, ButtonControl } from '../shared/ControlPanel';

interface ControlesTopClientesProps {
  tipoCliente: 'Minoristas' | 'Distribuidores';
  setTipoCliente: (v: 'Minoristas' | 'Distribuidores') => void;
  numClientes: number;
  setNumClientes: (v: number) => void;
  metric: 'importe' | 'cantidad';
  setMetric: (v: 'importe' | 'cantidad') => void;
  orden: 'mas' | 'menos';
  setOrden: (v: 'mas' | 'menos') => void;
  filtroMeses: 'todos' | 'conDatos' | 'individual';
  setFiltroMeses: (v: 'todos' | 'conDatos' | 'individual') => void;
  mesSeleccionado: string | null;
  setMesSeleccionado: (v: string) => void;
  mesesConDatos: string[];
  meses: string[];
  handleExport: () => void;
}

export const ControlesTopClientes: React.FC<ControlesTopClientesProps> = ({
  tipoCliente,
  setTipoCliente,
  numClientes,
  setNumClientes,
  metric,
  setMetric,
  orden,
  setOrden,
  filtroMeses,
  setFiltroMeses,
  mesSeleccionado,
  setMesSeleccionado,
  mesesConDatos,
  meses,
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
          value={tipoCliente}
          onChange={(value) => setTipoCliente(value as 'Minoristas' | 'Distribuidores')}
          options={[
            { value: 'Distribuidores', label: 'Distribuidores' },
            { value: 'Minoristas', label: 'Minoristas' },
          ]}
          className="w-40"
        />
      </ControlGroup>

      <ControlGroup label="Cantidad">
        <SelectControl
          value={String(numClientes)}
          onChange={(value) => setNumClientes(Number(value))}
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
            { value: 'importe', label: 'Importe' },
            { value: 'cantidad', label: 'Cantidad' },
          ]}
          className="w-32"
        />
      </ControlGroup>

      <ControlGroup label="Orden">
        <SelectControl
          value={orden}
          onChange={(value) => setOrden(value as 'mas' | 'menos')}
          options={[
            { value: 'mas', label: 'Más vendidos' },
            { value: 'menos', label: 'Menos vendidos' },
          ]}
          className="w-36"
        />
      </ControlGroup>

      <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

      <ControlGroup label="Filtro Meses">
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
            { value: 'conDatos', label: 'Solo meses con datos' },
            { value: 'individual', label: 'Seleccionar mes' },
          ]}
          className="w-44"
        />
        {filtroMeses === 'individual' && (
          <SelectControl
            value={mesSeleccionado || meses[0]}
            onChange={(value) => setMesSeleccionado(value)}
            options={meses.map((mes) => ({
              value: mes,
              label: mes,
            }))}
            className="w-36"
          />
        )}
      </ControlGroup>
    </ControlPanel>
  );
};

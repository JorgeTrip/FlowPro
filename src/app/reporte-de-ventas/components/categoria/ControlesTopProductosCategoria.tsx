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
import { SelectorCategoriasPopover } from './SelectorCategoriasPopover';
import { CategoriaData } from './types';

interface ControlesTopProductosCategoriaProps {
  onExport: () => void;
  filtroMeses: 'todos' | 'conDatos' | 'individual';
  setFiltroMeses: (v: 'todos' | 'conDatos' | 'individual') => void;
  meses: string[];
  mesesConDatos: string[];
  mesSeleccionado: string | null;
  setMesSeleccionado: (v: string) => void;
  topPorCategoria: number;
  setTopPorCategoria: (v: number) => void;
  mostrarCantidad: boolean;
  setMostrarCantidad: (v: boolean) => void;
  ordenAscendente: boolean;
  setOrdenAscendente: (v: boolean) => void;
  categoriasSeleccionadas: string[];
  setCategoriasSeleccionadas: (cats: string[]) => void;
  popoverVisible: boolean;
  setPopoverVisible: (v: boolean) => void;
  data: CategoriaData[];
}

export const ControlesTopProductosCategoria: React.FC<ControlesTopProductosCategoriaProps> = ({
  onExport,
  filtroMeses,
  setFiltroMeses,
  meses,
  mesesConDatos,
  mesSeleccionado,
  setMesSeleccionado,
  topPorCategoria,
  setTopPorCategoria,
  mostrarCantidad,
  setMostrarCantidad,
  ordenAscendente,
  setOrdenAscendente,
  categoriasSeleccionadas,
  setCategoriasSeleccionadas,
  popoverVisible,
  setPopoverVisible,
  data,
}) => {
  return (
    <ControlPanel title="Controles de Visualización">
      <ControlGroup label="Exportar">
        <ButtonControl onClick={onExport} variant="icon" title="Exportar como PNG">
          <CameraIcon className="w-4 h-4" />
        </ButtonControl>
      </ControlGroup>

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

      <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

      <ControlGroup label="Prod/Categoría">
        <SelectControl
          value={String(topPorCategoria)}
          onChange={(value) => setTopPorCategoria(Number(value))}
          options={[
            { value: '-1', label: 'Todos/Categoría' },
            { value: '1', label: '1 Prod/Categoría' },
            { value: '2', label: '2 Prod/Categoría' },
            { value: '3', label: '3 Prod/Categoría' },
            { value: '4', label: '4 Prod/Categoría' },
            { value: '5', label: '5 Prod/Categoría' },
            { value: '6', label: '6 Prod/Categoría' },
            { value: '7', label: '7 Prod/Categoría' },
            { value: '8', label: '8 Prod/Categoría' },
            { value: '9', label: '9 Prod/Categoría' },
            { value: '10', label: '10 Prod/Categoría' },
          ]}
          className="w-44"
        />
      </ControlGroup>

      <ControlGroup label="Métrica">
        <SelectControl
          value={mostrarCantidad ? 'cantidad' : 'importe'}
          onChange={(value) => setMostrarCantidad(value === 'cantidad')}
          options={[
            { value: 'importe', label: 'Importe' },
            { value: 'cantidad', label: 'Cantidad' },
          ]}
          className="w-32"
        />
      </ControlGroup>

      <SwitchControl
        checked={ordenAscendente}
        onChange={setOrdenAscendente}
        label={ordenAscendente ? 'Ascendente' : 'Descendente'}
      />

      <ControlGroup label="Categorías">
        <SelectorCategoriasPopover
          categoriasSeleccionadas={categoriasSeleccionadas}
          setCategoriasSeleccionadas={setCategoriasSeleccionadas}
          popoverVisible={popoverVisible}
          setPopoverVisible={setPopoverVisible}
          data={data}
          mostrarCantidad={mostrarCantidad}
        />
      </ControlGroup>
    </ControlPanel>
  );
};

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { SelectAsignacion } from './SelectAsignacion';

interface FormularioMapeoColumnasProps {
  mapeo: {
    ventas: { productoId: string; cantidad: string; fecha: string; descripcion: string };
    stock: { productoId: string; cantidad: string; deposito: string; stockReservado: string; descripcion: string };
  };
  ventasColumnas: string[];
  stockColumnas: string[];
  onMapeoChange: (fileType: 'ventas' | 'stock', campo: string, valor: string) => void;
}

export function FormularioMapeoColumnas({
  mapeo,
  ventasColumnas,
  stockColumnas,
  onMapeoChange,
}: FormularioMapeoColumnasProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Mapeo de Ventas */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Archivo de Ventas</h4>
        <SelectAsignacion
          label="ID de Producto *"
          columnas={ventasColumnas}
          value={mapeo.ventas.productoId}
          onChange={(e) => onMapeoChange('ventas', 'productoId', e.target.value)}
        />
        <SelectAsignacion
          label="Cantidad *"
          columnas={ventasColumnas}
          value={mapeo.ventas.cantidad}
          onChange={(e) => onMapeoChange('ventas', 'cantidad', e.target.value)}
        />
        <SelectAsignacion
          label="Fecha *"
          columnas={ventasColumnas}
          value={mapeo.ventas.fecha}
          onChange={(e) => onMapeoChange('ventas', 'fecha', e.target.value)}
        />
        <SelectAsignacion
          label="Descripción (Opcional si está en Stock)"
          columnas={ventasColumnas}
          value={mapeo.ventas.descripcion}
          onChange={(e) => onMapeoChange('ventas', 'descripcion', e.target.value)}
          disabled={!!mapeo.stock.descripcion}
        />
      </div>

      {/* Mapeo de Stock */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Archivo de Stock</h4>
        <SelectAsignacion
          label="ID de Producto *"
          columnas={stockColumnas}
          value={mapeo.stock.productoId}
          onChange={(e) => onMapeoChange('stock', 'productoId', e.target.value)}
        />
        <SelectAsignacion
          label="Cantidad *"
          columnas={stockColumnas}
          value={mapeo.stock.cantidad}
          onChange={(e) => onMapeoChange('stock', 'cantidad', e.target.value)}
        />
        <SelectAsignacion
          label="Depósito *"
          columnas={stockColumnas}
          value={mapeo.stock.deposito}
          onChange={(e) => onMapeoChange('stock', 'deposito', e.target.value)}
        />
        <SelectAsignacion
          label="Stock Reservado"
          columnas={stockColumnas}
          value={mapeo.stock.stockReservado}
          onChange={(e) => onMapeoChange('stock', 'stockReservado', e.target.value)}
        />
        <SelectAsignacion
          label="Descripción (Opcional si está en Ventas)"
          columnas={stockColumnas}
          value={mapeo.stock.descripcion}
          onChange={(e) => onMapeoChange('stock', 'descripcion', e.target.value)}
          disabled={!!mapeo.ventas.descripcion}
        />
      </div>
    </div>
  );
}

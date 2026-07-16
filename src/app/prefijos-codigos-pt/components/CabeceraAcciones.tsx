// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useRef, useState, useEffect } from 'react';

interface CabeceraAccionesProps {
  ui: {
    busqueda: string;
    setBusqueda: (v: string) => void;
    abrirModalCrear: () => void;
    exportarAJSON: () => void;
    exportarAExcel: () => void;
    exportarACSV: () => void;
    importarDesdeArchivo: (e: React.ChangeEvent<HTMLInputElement>) => void;
    confirmarBorrarTodo: () => void;
    procesando: boolean;
  };
}

export function CabeceraAcciones({ ui }: CabeceraAccionesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportMenuAbierto, setExportMenuAbierto] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const dispararImportacion = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const alHacerClickAfuera = (evento: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(evento.target as Node)) {
        setExportMenuAbierto(false);
      }
    };
    if (exportMenuAbierto) {
      document.addEventListener('mousedown', alHacerClickAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', alHacerClickAfuera);
    };
  }, [exportMenuAbierto]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 gap-4 shadow-sm">
      {/* Buscador */}
      <div className="flex flex-col w-full md:w-auto">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          Buscar Prefijos o Líneas
        </span>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar prefijo, línea..."
            value={ui.busqueda}
            onChange={(e) => ui.setBusqueda(e.target.value)}
            className="pl-8 pr-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-72 transition-all shadow-sm"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs select-none">🔍</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
        {/* Input file oculto para importar múltiples formatos */}
        <input
          type="file"
          accept=".json,.csv,.xlsx"
          ref={fileInputRef}
          onChange={ui.importarDesdeArchivo}
          className="hidden"
          disabled={ui.procesando}
        />

        <button
          onClick={dispararImportacion}
          disabled={ui.procesando}
          className="flex items-center space-x-1 px-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          title="Importar reglas desde archivo JSON, CSV o Excel"
        >
          <span>📥</span>
          <span>Importar</span>
        </button>

        {/* Dropdown de Exportación */}
        <div ref={exportRef} className="relative inline-block text-left">
          <button
            onClick={() => setExportMenuAbierto(!exportMenuAbierto)}
            className="flex items-center space-x-1.5 px-3 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm"
            title="Exportar reglas a distintos formatos"
          >
            <span>📤</span>
            <span>Exportar</span>
            <span className="text-[9px] text-gray-400">▼</span>
          </button>

          {exportMenuAbierto && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-250 dark:border-gray-800 shadow-lg p-2.5 z-40 space-y-1 transition-all animate-in fade-in slide-in-from-top-1 duration-100">
              <button
                onClick={() => {
                  ui.exportarAExcel();
                  setExportMenuAbierto(false);
                }}
                className="w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 text-xs text-gray-700 dark:text-gray-300 cursor-pointer font-bold"
              >
                <span>📊</span>
                <span>Exportar a Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => {
                  ui.exportarACSV();
                  setExportMenuAbierto(false);
                }}
                className="w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 text-xs text-gray-700 dark:text-gray-300 cursor-pointer font-bold"
              >
                <span>📝</span>
                <span>Exportar a CSV (.csv)</span>
              </button>
              <button
                onClick={() => {
                  ui.exportarAJSON();
                  setExportMenuAbierto(false);
                }}
                className="w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/40 text-xs text-gray-700 dark:text-gray-300 cursor-pointer font-bold"
              >
                <span>⚙️</span>
                <span>Exportar a JSON (.json)</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={ui.confirmarBorrarTodo}
          disabled={ui.procesando}
          className="flex items-center space-x-1 px-3 h-9 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
          title="Borrar todas las reglas de prefijos cargadas"
        >
          <span>🗑️</span>
          <span>Borrar todo</span>
        </button>

        <button
          onClick={ui.abrirModalCrear}
          disabled={ui.procesando}
          className="flex items-center space-x-1 px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <span>＋</span>
          <span>Nuevo Prefijo</span>
        </button>
      </div>
    </div>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, GitCommit, RefreshCw } from 'lucide-react';
import type { CommitHistorial } from './typesConfiguracion';
import { ItemCommitHistorial } from './ItemCommitHistorial';

interface ModalHistorialCambiosProps {
  abierto: boolean;
  commits: CommitHistorial[];
  version: string;
  cargando: boolean;
  onRecargar: () => void;
  onCerrar: () => void;
}

export function ModalHistorialCambios({
  abierto,
  commits,
  version,
  cargando,
  onRecargar,
  onCerrar,
}: ModalHistorialCambiosProps) {
  const [busqueda, setBusqueda] = useState('');

  const commitsFiltrados = useMemo(() => {
    if (!busqueda.trim()) return commits;
    const query = busqueda.trim().toLowerCase();
    return commits.filter(
      (c) =>
        c.titulo.toLowerCase().includes(query) ||
        c.shortHash.toLowerCase().includes(query) ||
        (c.cuerpo && c.cuerpo.toLowerCase().includes(query))
    );
  }, [commits, busqueda]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold">Historial de Cambios</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  v{version || '1.0.0'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {commits.length} commits registrados en el repositorio
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRecargar}
              disabled={cargando}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Recargar historial"
            >
              <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button
              onClick={onCerrar}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="my-3.5 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por mensaje, hash o módulo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Lista de Commits */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
          {cargando ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
              ))}
            </div>
          ) : commitsFiltrados.length > 0 ? (
            commitsFiltrados.map((c) => (
              <ItemCommitHistorial key={c.hash} commit={c} />
            ))
          ) : (
            <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
              No se encontraron commits que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

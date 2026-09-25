// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info, History } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeSwitcher } from '../layout/ThemeSwitcher';
import { ModalAcercaDe } from './ModalAcercaDe';
import { ModalHistorialCambios } from './ModalHistorialCambios';
import type { CommitHistorial, RespuestaChangelog } from './typesConfiguracion';

interface BotonConfiguracionProps {
  estaColapsado: boolean;
}

export function BotonConfiguracion({ estaColapsado }: BotonConfiguracionProps) {
  const [popoverAbierto, setPopoverAbierto] = useState(false);
  const [modalAcercaDe, setModalAcercaDe] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);

  const [version, setVersion] = useState('1.0.0');
  const [commits, setCommits] = useState<CommitHistorial[]>([]);
  const [cargando, setCargando] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);

  const cargarChangelog = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/changelog');
      if (res.ok) {
        const data: RespuestaChangelog = await res.json();
        if (data.version) setVersion(data.version);
        if (data.commits) setCommits(data.commits);
      }
    } catch (e) {
      console.warn('[BotonConfiguracion] Error al obtener changelog:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarChangelog();
  }, []);

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleClicFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setPopoverAbierto(false);
      }
    };
    if (popoverAbierto) {
      document.addEventListener('mousedown', handleClicFuera);
    }
    return () => document.removeEventListener('mousedown', handleClicFuera);
  }, [popoverAbierto]);

  return (
    <div className="relative" ref={contenedorRef}>
      {/* Botón en Sidebar */}
      <button
        type="button"
        onClick={() => setPopoverAbierto(!popoverAbierto)}
        title="Configuración"
        className={clsx(
          'group relative flex items-center rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap overflow-hidden',
          estaColapsado ? 'h-10 w-10 justify-center mx-auto p-0' : 'space-x-3 p-2.5 w-full',
          popoverAbierto
            ? 'bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/60'
        )}
      >
        <span className="relative text-xl shrink-0 flex items-center justify-center">
          <Settings className={clsx('h-5 w-5 transition-transform duration-300', popoverAbierto && 'rotate-90 text-blue-500')} />
        </span>
        {!estaColapsado && (
          <span className="relative truncate transition-opacity duration-200 whitespace-nowrap">
            Configuración
          </span>
        )}
      </button>

      {/* Popover Desplegable Estilo Apple */}
      {popoverAbierto && (
        <div
          className={clsx(
            'fixed z-50 w-64 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-[#1C1C1E]/95 animate-fadeIn',
            estaColapsado ? 'left-20 bottom-4' : 'left-4 bottom-16'
          )}
        >
          <div className="mb-2 px-2 pb-2 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Preferencias
            </span>
            <span className="text-[10px] font-mono font-bold rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              v{version}
            </span>
          </div>

          <div className="space-y-1">
            {/* Control de Tema */}
            <div className="py-1">
              <ThemeSwitcher estaColapsado={false} />
            </div>

            {/* Acerca de */}
            <button
              type="button"
              onClick={() => {
                setPopoverAbierto(false);
                setModalAcercaDe(true);
              }}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Acerca de FlowPro</span>
            </button>

            {/* Historial de Cambios */}
            <button
              type="button"
              onClick={() => {
                setPopoverAbierto(false);
                setModalHistorial(true);
              }}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <History className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>Historial de cambios</span>
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalAcercaDe
        abierto={modalAcercaDe}
        version={version}
        onCerrar={() => setModalAcercaDe(false)}
        onAbrirHistorial={() => setModalHistorial(true)}
      />

      <ModalHistorialCambios
        abierto={modalHistorial}
        commits={commits}
        version={version}
        cargando={cargando}
        onRecargar={cargarChangelog}
        onCerrar={() => setModalHistorial(false)}
      />
    </div>
  );
}

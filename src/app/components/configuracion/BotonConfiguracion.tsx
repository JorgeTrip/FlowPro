// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info } from 'lucide-react';
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
  const [posicionPopover, setPosicionPopover] = useState<{ left: number; bottom: number }>({ left: 0, bottom: 0 });

  const actualizarPosicion = () => {
    if (contenedorRef.current) {
      const rect = contenedorRef.current.getBoundingClientRect();
      setPosicionPopover({
        left: rect.right + 10,
        bottom: Math.max(12, Math.min(window.innerHeight - 150, window.innerHeight - rect.bottom)),
      });
    }
  };

  const alternarPopover = () => {
    if (!popoverAbierto) {
      actualizarPosicion();
    }
    setPopoverAbierto((prev) => !prev);
  };

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

  // Mantener posición alineada ante scroll o resize
  useEffect(() => {
    if (popoverAbierto) {
      actualizarPosicion();
      window.addEventListener('resize', actualizarPosicion);
      window.addEventListener('scroll', actualizarPosicion, true);
      return () => {
        window.removeEventListener('resize', actualizarPosicion);
        window.removeEventListener('scroll', actualizarPosicion, true);
      };
    }
  }, [popoverAbierto, estaColapsado]);

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
        onClick={alternarPopover}
        title="Configuración"
        className={clsx(
          'group relative flex items-center h-10 w-full rounded-xl transition-colors duration-200 text-sm font-medium whitespace-nowrap overflow-hidden px-1.5',
          popoverAbierto
            ? 'bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50'
        )}
      >
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-xl">
          <Settings className={clsx('h-5 w-5 transition-transform duration-300', popoverAbierto && 'rotate-90 text-blue-500')} />
        </span>
        <div
          className={clsx(
            'relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap flex-1 text-left',
            estaColapsado
              ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
              : 'max-w-[180px] opacity-100 translate-x-0 ml-3'
          )}
        >
          <span className="truncate block">Configuración</span>
        </div>
      </button>

      {/* Popover anclado directamente al botón */}
      {popoverAbierto && (
        <div
          style={{
            left: `${posicionPopover.left}px`,
            bottom: `${posicionPopover.bottom}px`,
          }}
          className="fixed z-50 w-64 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-[#1C1C1E]/95 animate-fadeIn"
        >
          <div className="mb-2 px-2 pb-2 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Configuración
            </span>
            <span className="text-[10px] font-mono font-bold rounded bg-gray-100 px-1.5 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              v{version}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Control de Modo Oscuro / Claro */}
            <div className="py-1">
              <ThemeSwitcher estaColapsado={false} />
            </div>

            {/* Acerca de FlowPro */}
            <button
              type="button"
              onClick={() => {
                setPopoverAbierto(false);
                setModalAcercaDe(true);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Acerca de FlowPro</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">v{version}</span>
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

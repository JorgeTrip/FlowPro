// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { MODULOS_DISPONIBLES, CATEGORIAS_MODULOS, type Modulo } from '@/app/lib/moduleRegistry';
import { clsx } from 'clsx';
import { BotonConfiguracion } from '../configuracion/BotonConfiguracion';
import { Layers } from 'lucide-react';

function ModuloNavItem({ modulo, estaColapsado }: { modulo: Modulo; estaColapsado: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === modulo.ruta;
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (itemRef.current && (modulo.tooltip || estaColapsado)) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 12,
        y: rect.top,
      });
    }
  };

  return (
    <div className="group relative" ref={itemRef} onMouseEnter={handleMouseEnter}>
      <Link
        href={modulo.ruta}
        className={clsx(
          'group relative flex items-center h-10 w-full rounded-xl transition-colors duration-200 text-sm font-medium whitespace-nowrap overflow-hidden px-1.5',
          isActive
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50'
        )}
      >
        {/* Fondo estado activo */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-blue-50/80 border border-blue-200/60 dark:bg-blue-950/50 dark:border-blue-800/50"></div>
        )}

        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center text-xl">{modulo.icono}</span>
        <div
          className={clsx(
            'relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap flex-1',
            estaColapsado
              ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
              : 'max-w-[180px] opacity-100 translate-x-0 ml-3'
          )}
        >
          <span className="truncate block">{modulo.nombre}</span>
        </div>
      </Link>

      {/* Tooltip interactivo */}
      {(estaColapsado || modulo.tooltip) && (
        <div
          className="fixed z-[9999] w-72 rounded-xl bg-gray-900/95 backdrop-blur p-3.5 text-xs text-white shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 delay-150 border border-gray-800"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="absolute -left-1 top-4 h-2 w-2 rotate-45 bg-gray-900"></div>
          <h4 className="font-semibold text-blue-400 mb-1 text-sm">{modulo.nombre}</h4>
          <p className="text-gray-300 text-xs">{modulo.tooltip?.descripcion || modulo.nombre}</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const esPaginaModulo = pathname !== '/';
  const estaColapsado = esPaginaModulo && !hovered;

  const modulosPorCategoria = MODULOS_DISPONIBLES
    .filter((modulo) => modulo.activo)
    .reduce((acc: Record<string, Modulo[]>, modulo) => {
      const categoria = modulo.categoria;
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(modulo);
      return acc;
    }, {});

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        'relative flex h-full flex-col border-r border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] shrink-0 z-40 overflow-hidden overflow-x-hidden',
        estaColapsado ? 'w-16' : 'w-64'
      )}
    >
      {/* Cabecera Sidebar */}
      <div className="flex items-center h-16 px-3.5 border-b border-gray-100 dark:border-gray-800/60 overflow-hidden whitespace-nowrap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <Layers className="h-5 w-5" />
        </div>
        <div
          className={clsx(
            'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap',
            estaColapsado
              ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
              : 'max-w-xs opacity-100 translate-x-0 ml-3'
          )}
        >
          <h2 className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 truncate whitespace-nowrap">
            FlowPro
          </h2>
        </div>
      </div>

      {/* Lista de Módulos con reserva estricta de espacio vertical */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-2 py-4 space-y-6 scrollbar-none">
        {Object.entries(modulosPorCategoria).map(([categoria, modulos]) => (
          <div key={categoria}>
            <h3
              className={clsx(
                'mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-4 flex items-center',
                estaColapsado
                  ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none select-none'
                  : 'max-w-[200px] opacity-100 translate-x-0'
              )}
            >
              {CATEGORIAS_MODULOS[categoria as keyof typeof CATEGORIAS_MODULOS].nombre}
            </h3>
            <nav className="space-y-1.5">
              {modulos.map((modulo) => (
                <ModuloNavItem key={modulo.id} modulo={modulo} estaColapsado={estaColapsado} />
              ))}
            </nav>
          </div>
        ))}

        {/* Botón de Configuración (Tema, Acerca de, Historial) */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 overflow-x-hidden">
          <BotonConfiguracion estaColapsado={estaColapsado} />
        </div>
      </div>
    </aside>
  );
}

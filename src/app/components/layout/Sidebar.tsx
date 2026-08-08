// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { MODULOS_DISPONIBLES, CATEGORIAS_MODULOS, type Modulo } from '@/app/lib/moduleRegistry';
import { clsx } from 'clsx';
import { ThemeSwitcher } from './ThemeSwitcher';
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
          'group relative flex items-center rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap overflow-hidden',
          estaColapsado ? 'h-10 w-10 justify-center mx-auto p-0' : 'space-x-3 p-2.5 w-full',
          isActive
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
        )}
      >
        {/* Fondo estado activo */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-blue-50/80 border border-blue-200/60 dark:bg-blue-950/50 dark:border-blue-800/50"></div>
        )}

        <span className="relative text-xl shrink-0 flex items-center justify-center">{modulo.icono}</span>
        {!estaColapsado && (
          <span className="relative truncate transition-opacity duration-200 whitespace-nowrap">{modulo.nombre}</span>
        )}
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
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const esPaginaModulo = mounted && pathname !== '/';
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
        'relative flex h-full flex-col border-r border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] transition-all duration-300 ease-in-out shrink-0 z-40 overflow-hidden overflow-x-hidden',
        estaColapsado ? 'w-16' : 'w-64'
      )}
    >
      {/* Cabecera Sidebar */}
      <div
        className={clsx(
          'flex items-center p-4 border-b border-gray-100 dark:border-gray-800/60 overflow-x-hidden whitespace-nowrap',
          estaColapsado ? 'justify-center px-0' : 'space-x-3'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <Layers className="h-5 w-5" />
        </div>
        {!estaColapsado && (
          <h2 className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 truncate whitespace-nowrap">
            FlowPro
          </h2>
        )}
      </div>

      {/* Lista de Módulos con reserva estricta de espacio vertical */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-2 py-4 space-y-6 scrollbar-none">
        {Object.entries(modulosPorCategoria).map(([categoria, modulos]) => (
          <div key={categoria}>
            <h3
              className={clsx(
                'mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap transition-opacity duration-200 h-4 flex items-center',
                estaColapsado ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
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

        {/* Cambiador de Tema integrado */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 overflow-x-hidden">
          <ThemeSwitcher estaColapsado={estaColapsado} />
        </div>
      </div>
    </aside>
  );
}

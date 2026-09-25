// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';

interface ItemMultiple {
  codigo: string;
  descripcion: string;
}

interface BadgeAlertaPedidosMultiplesProps {
  itemsConMultiples: ItemMultiple[];
  tipo: 'propios' | 'tercerizados';
}

export default function BadgeAlertaPedidosMultiples({
  itemsConMultiples,
  tipo,
}: BadgeAlertaPedidosMultiplesProps) {
  const [indiceActual, setIndiceActual] = useState(0);

  const total = itemsConMultiples.length;

  const navegarAFila = () => {
    if (total === 0) return;
    const item = itemsConMultiples[indiceActual % total];
    const prefijo = tipo === 'propios' ? 'fila-propio-' : 'fila-tercerizado-';
    const id = prefijo + item.codigo;
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elemento.classList.add('ring-2', 'ring-red-500', 'bg-red-100/60', 'dark:bg-red-950/50');
      setTimeout(() => {
        elemento.classList.remove('ring-2', 'ring-red-500', 'bg-red-100/60', 'dark:bg-red-950/50');
      }, 2200);
    }

    setIndiceActual((prev) => (prev + 1) % total);
  };

  if (total === 0) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm select-none"
        title="No hay productos con múltiples pedidos de compra pendientes sin recibir"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
        <span className="whitespace-nowrap">Sin pedidos múltiples</span>
      </div>
    );
  }

  const idxMostrado = (indiceActual % total) + 1;

  return (
    <button
      onClick={navegarAFila}
      type="button"
      title="Tocar para desplazarse a la fila del producto con pedidos múltiples"
      className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs font-bold shadow-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-all cursor-pointer group active:scale-95 whitespace-nowrap"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-pulse" />
      <span>
        {total === 1
          ? '1 con pedidos múltiples'
          : `${total} con pedidos múltiples (${idxMostrado}/${total})`}
      </span>
      <span className="text-[10px] opacity-75 group-hover:opacity-100 transition-opacity">↓ Ir</span>
    </button>
  );
}

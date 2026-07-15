// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import React, { useState, useEffect } from 'react';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';

interface FormularioPrefijoProps {
  ui: {
    reglaEnEdicion: ReglaPrefijo | null;
    cerrarModal: () => void;
    guardarRegla: (datos: Omit<ReglaPrefijo, 'id'>) => Promise<void>;
    procesando: boolean;
  };
}

export function FormularioPrefijo({ ui }: FormularioPrefijoProps) {
  const [prefijo, setPrefijo] = useState('');
  const [linea, setLinea] = useState('');
  const [sitioFabricacion, setSitioFabricacion] = useState<ReglaPrefijo['sitioFabricacion']>('CABA');
  const [descripcion, setDescripcion] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (ui.reglaEnEdicion) {
      setPrefijo(ui.reglaEnEdicion.prefijo);
      setLinea(ui.reglaEnEdicion.linea);
      setSitioFabricacion(ui.reglaEnEdicion.sitioFabricacion);
      setDescripcion(ui.reglaEnEdicion.descripcion || '');
    }
  }, [ui.reglaEnEdicion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!prefijo.trim()) {
      setErrorLocal('El prefijo de código PT es obligatorio.');
      return;
    }
    if (!linea.trim()) {
      setErrorLocal('La línea de producto es obligatoria.');
      return;
    }

    ui.guardarRegla({
      prefijo: prefijo.trim().toUpperCase(),
      linea: linea.trim(),
      sitioFabricacion,
      descripcion: descripcion.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-150 dark:bg-[#1C1C1E] dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between border-b border-gray-150 pb-4 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {ui.reglaEnEdicion ? '✏️ Editar Prefijo de Código' : '🔖 Nuevo Prefijo de Código'}
          </h3>
          <button
            onClick={ui.cerrarModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer select-none text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {errorLocal && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
              {errorLocal}
            </div>
          )}

          {/* Prefijo */}
          <div className="flex flex-col">
            <label className="font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Prefijo de Código PT *
            </label>
            <input
              type="text"
              placeholder="Ej: 01ACE"
              value={prefijo}
              onChange={(e) => setPrefijo(e.target.value)}
              disabled={ui.procesando}
              className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              Los códigos PT que comiencen con este prefijo heredarán esta clasificación.
            </span>
          </div>

          {/* Línea */}
          <div className="flex flex-col">
            <label className="font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Línea de Productos *
            </label>
            <input
              type="text"
              placeholder="Ej: Aceites esenciales"
              value={linea}
              onChange={(e) => setLinea(e.target.value)}
              disabled={ui.procesando}
              className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Planta / Sitio */}
          <div className="flex flex-col">
            <label className="font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Planta de Fabricación *
            </label>
            <select
              value={sitioFabricacion}
              onChange={(e) => setSitioFabricacion(e.target.value as any)}
              disabled={ui.procesando}
              className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="CABA">CABA</option>
              <option value="ENTRE RIOS">ENTRE RIOS</option>
              <option value="CABA + ENTRE RIOS">CABA + ENTRE RIOS</option>
              <option value="TERC. CABA">TERC. CABA</option>
              <option value="TERC. ENTRE RIOS">TERC. ENTRE RIOS</option>
              <option value="TERC. CON PROV. MP">TERC. CON PROV. MP</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Descripción / Notas Adicionales
            </label>
            <textarea
              placeholder="Notas sobre esta línea o requerimientos específicos..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={ui.procesando}
              rows={3}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2C2C2E] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-150 dark:border-gray-800">
            <button
              type="button"
              onClick={ui.cerrarModal}
              disabled={ui.procesando}
              className="px-4 h-9 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 transition-all cursor-pointer font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={ui.procesando}
              className="px-4 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {ui.procesando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

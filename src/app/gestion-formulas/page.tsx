// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useEffect, useState } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import UploadStep from './components/UploadStep';
import ConfigStep from './components/ConfigStep';
import VistaResultados from './components/VistaResultados';
import ModalConfirmacionVersiones from './components/ModalConfirmacionVersiones';

/**
 * Componente indicador visual de pasos (ProgressBar) del Wizard.
 */
function BarraProgreso({ pasoActual }: { pasoActual: number }) {
  const pasos = ['Carga de Archivos', 'Mapeo de Columnas', 'Resultados MRP'];
  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
      {pasos.map((paso, idx) => {
        const numeroPaso = idx + 1;
        const completado = pasoActual > numeroPaso;
        const activo = pasoActual === numeroPaso;

        return (
          <div key={paso} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  completado
                    ? 'bg-green-600 text-white'
                    : activo
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {completado ? '✔' : numeroPaso}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                  activo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {paso}
              </span>
            </div>
            {idx < pasos.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-4 transition-colors duration-500 ${
                  completado ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Página Principal del módulo de Gestión de Fórmulas.
 * Orquesta y renderiza los pasos del Wizard de importación y el cálculo MRP.
 */
export default function PaginaGestionFormulas() {
  const step = useGestionFormulasStore((s) => s.step);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-[#2C2C2E] rounded-lg w-3/4 mx-auto" />
          <div className="h-4 bg-gray-150 dark:bg-[#1C1C1E] rounded-lg w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Encabezado */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Gestión de Fórmulas (BOM/MRP)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Optimizador intermedio: absorbe stocks y recetas desde Excel y procesa la planificación de compras.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <BarraProgreso pasoActual={step} />

      {/* Renderizado Dinámico de Pasos */}
      <div className="w-full">
        {step === 1 && <UploadStep />}
        {step === 2 && <ConfigStep />}
        {step === 3 && <VistaResultados />}
      </div>

      {/* Modal de confirmación de control de versiones (Cruce Inteligente) */}
      <ModalConfirmacionVersiones />
    </div>
  );
}

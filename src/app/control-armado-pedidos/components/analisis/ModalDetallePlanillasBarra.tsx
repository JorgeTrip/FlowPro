// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { SheetCard } from '../datos/SheetCard';
import { SheetEditorModal } from '../datos/SheetEditorModal';
import { ImageLightboxModal } from '../datos/ImageLightboxModal';
import { eliminarPlanillaVerificada } from '../../services/firestoreService';
import { generarVariacionesBusquedaBD, coincideFechaConBusquedaFlexible } from '../../utils/calcularRangoFechasDatos';
import { X, Search, FileSpreadsheet, Layers } from 'lucide-react';

interface ModalDetallePlanillasBarraProps {
  titulo: string;
  subtitulo?: string;
  planillas: RegistroArmadoDocumento[];
  onCerrar: () => void;
  onActualizado?: () => void;
}

export function ModalDetallePlanillasBarra({
  titulo,
  subtitulo,
  planillas: planillasIniciales,
  onCerrar,
  onActualizado,
}: ModalDetallePlanillasBarraProps) {
  const [busqueda, setBusqueda] = useState('');
  const [listaPlanillas, setListaPlanillas] = useState<RegistroArmadoDocumento[]>(planillasIniciales);
  const [planillaEditar, setPlanillaEditar] = useState<RegistroArmadoDocumento | null>(null);
  const [lightboxData, setLightboxData] = useState<{ base64: string; titulo: string } | null>(null);

  const handleEliminar = async (id: string, emp: string) => {
    if (confirm(`¿Estás seguro de eliminar la planilla de "${emp}"?`)) {
      try {
        await eliminarPlanillaVerificada(id);
        setListaPlanillas((prev) => prev.filter((p) => p.id !== id));
        onActualizado?.();
      } catch (err: any) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  const planillasFiltradas = listaPlanillas.filter((p) => {
    const term = busqueda.trim();
    if (!term) return true;

    const terminosBusqueda = generarVariacionesBusquedaBD(term);

    return terminosBusqueda.some((t) => {
      if (p.empleadoHeader?.toLowerCase().includes(t)) return true;
      if (p.fechaPrimeraFila?.toLowerCase().includes(t)) return true;
      if (p.fechaPlanilla?.toLowerCase().includes(t)) return true;
      if (p.nombreArchivoOriginal?.toLowerCase().includes(t)) return true;
      if (p.id?.toLowerCase().includes(t)) return true;
      if (coincideFechaConBusquedaFlexible(p.fechaPrimeraFila, t)) return true;
      if (coincideFechaConBusquedaFlexible(p.fechaPlanilla, t)) return true;
      return p.filas?.some(
        (f) =>
          f.empleadoAsignado?.toLowerCase().includes(t) ||
          f.fecha?.toLowerCase().includes(t) ||
          coincideFechaConBusquedaFlexible(f.fecha, t)
      );
    });
  });

  const totalPedidos = planillasFiltradas.reduce((acc, p) => acc + (p.filas?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
      <div className="flex max-h-[92vh] w-full max-w-[1300px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-[#F5F5F7] shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        {/* Cabecera del Modal */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-[#1C1C1E]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{titulo}</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  {listaPlanillas.length} {listaPlanillas.length === 1 ? 'planilla' : 'planillas'} ({totalPedidos} pedidos)
                </span>
              </h2>
              {subtitulo && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitulo}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar en esta lista..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-48 sm:w-64 rounded-xl border border-gray-300 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              onClick={onCerrar}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lista de Planillas Tipo Datos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {planillasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500 dark:border-gray-800">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                No se encontraron planillas con los criterios especificados.
              </p>
            </div>
          ) : (
            planillasFiltradas.map((p) => (
              <SheetCard
                key={p.id}
                p={p}
                onEditar={setPlanillaEditar}
                onEliminar={handleEliminar}
                onVerImagen={(base64, t) => setLightboxData({ base64, titulo: t })}
              />
            ))
          )}
        </div>
      </div>

      {planillaEditar && (
        <SheetEditorModal
          planilla={planillaEditar}
          onCerrar={() => setPlanillaEditar(null)}
          onGuardadoExitoso={() => {
            setPlanillaEditar(null);
            onActualizado?.();
          }}
        />
      )}

      {lightboxData && (
        <ImageLightboxModal
          imagenBase64={lightboxData.base64}
          titulo={lightboxData.titulo}
          onCerrar={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}

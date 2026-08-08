// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { obtenerRegistrosVerificados, eliminarPlanillaVerificada } from '../../services/firestoreService';
import { eliminarImagenLocal } from '../../services/localImageStore';
import { SheetEditorModal } from './SheetEditorModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { SheetCard } from './SheetCard';
import { Search, FileSpreadsheet, RefreshCw } from 'lucide-react';

export function DataSheetsList() {
  const [planillas, setPlanillas] = useState<RegistroArmadoDocumento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [planillaEditar, setPlanillaEditar] = useState<RegistroArmadoDocumento | null>(null);
  const [lightboxData, setLightboxData] = useState<{ base64: string; titulo: string } | null>(null);

  const cargarPlanillas = async () => {
    setCargando(true);
    try {
      const data = await obtenerRegistrosVerificados();
      setPlanillas(data);
    } catch (err) {
      console.error('Error al cargar planillas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlanillas();
  }, []);

  const handleEliminar = async (id: string, emp: string) => {
    if (confirm(`¿Estás seguro de eliminar la planilla de "${emp}"?`)) {
      try {
        await eliminarPlanillaVerificada(id);
        await eliminarImagenLocal(id);
        setPlanillas((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  const planillasFiltradas = planillas.filter((p) => {
    const term = busqueda.toLowerCase();
    return (
      p.empleadoHeader?.toLowerCase().includes(term) ||
      p.fechaPrimeraFila?.includes(term) ||
      p.filas?.some((f) => f.empleadoAsignado?.toLowerCase().includes(term) || f.fecha?.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por armador o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={cargarPlanillas}
          disabled={cargando}
          className="flex items-center space-x-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {cargando ? (
        <div className="flex h-48 items-center justify-center space-x-2 text-xs text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>Cargando planillas registradas en Firestore e IndexedDB...</span>
        </div>
      ) : planillasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500 dark:border-gray-800">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">No hay planillas guardadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {planillasFiltradas.map((p) => (
            <SheetCard
              key={p.id}
              p={p}
              onEditar={setPlanillaEditar}
              onEliminar={handleEliminar}
              onVerImagen={(base64, titulo) => setLightboxData({ base64, titulo })}
            />
          ))}
        </div>
      )}

      {planillaEditar && (
        <SheetEditorModal
          planilla={planillaEditar}
          onCerrar={() => setPlanillaEditar(null)}
          onGuardadoExitoso={() => {
            setPlanillaEditar(null);
            cargarPlanillas();
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

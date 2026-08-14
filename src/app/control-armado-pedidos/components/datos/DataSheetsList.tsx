// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { obtenerRegistrosVerificados, eliminarPlanillaVerificada } from '../../services/firestoreService';
import { useArmadoStore } from '../../stores/armadoStore';
import { SheetEditorModal } from './SheetEditorModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { SheetCard } from './SheetCard';
import { BarraResumenDatos } from './BarraResumenDatos';
import { Search, FileSpreadsheet, RefreshCw, ArrowUpDown, X } from 'lucide-react';

type CriterioOrden = 'fecha_planilla' | 'fecha_carga';

export function DataSheetsList() {
  const { busquedaDatos, setBusquedaDatos } = useArmadoStore();
  const [planillas, setPlanillas] = useState<RegistroArmadoDocumento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [criterioOrden, setCriterioOrden] = useState<CriterioOrden>('fecha_carga');
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
        setPlanillas((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  const planillasFiltradas = planillas.filter((p) => {
    const term = busquedaDatos.toLowerCase().trim();
    if (!term) return true;
    return (
      p.empleadoHeader?.toLowerCase().includes(term) ||
      p.fechaPrimeraFila?.includes(term) ||
      p.filas?.some((f) => f.empleadoAsignado?.toLowerCase().includes(term) || f.fecha?.includes(term))
    );
  });

  const planillasProcesadas = [...planillasFiltradas].sort((a, b) => {
    if (criterioOrden === 'fecha_planilla') {
      const fA = a.fechaPrimeraFila || a.fechaPlanilla || a.filas?.[0]?.fecha || '';
      const fB = b.fechaPrimeraFila || b.fechaPlanilla || b.filas?.[0]?.fecha || '';
      return fB.localeCompare(fA);
    } else {
      const tA = new Date(a.verificadoEn || a.creadoEn || 0).getTime();
      const tB = new Date(b.verificadoEn || b.creadoEn || 0).getTime();
      return tB - tA;
    }
  });

  return (
    <div className="space-y-4">
      {/* Panel de Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por armador o fecha..."
            value={busquedaDatos}
            onChange={(e) => setBusquedaDatos(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-9 pr-8 py-2 text-xs text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {busquedaDatos && (
            <button
              onClick={() => setBusquedaDatos('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ordenar por:</span>
            <select
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value as CriterioOrden)}
              className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="fecha_planilla">Fecha inicial de planilla</option>
              <option value="fecha_carga">Fecha de carga</option>
            </select>
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
      </div>

      {/* Barra Delgada de Información Resumida según Filtro */}
      <BarraResumenDatos
        planillasFiltradas={planillasProcesadas}
        totalPlanillasOriginal={planillas.length}
        hayFiltro={busquedaDatos.trim().length > 0}
        cargando={cargando}
      />

      {/* Contenido de Planillas */}
      {cargando ? (
        <div className="flex h-48 items-center justify-center space-x-2 text-xs text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>Cargando planillas registradas en Firestore...</span>
        </div>
      ) : planillasProcesadas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500 dark:border-gray-800">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            {busquedaDatos ? 'No se encontraron planillas coincidentes.' : 'No hay planillas guardadas.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {planillasProcesadas.map((p) => (
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

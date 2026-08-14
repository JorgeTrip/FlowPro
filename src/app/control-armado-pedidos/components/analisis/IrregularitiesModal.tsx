// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { RegistroArmadoDocumento } from '../../types/armado';
import { actualizarFilaEnDocumento } from '../../services/firestoreService';
import { exportarIrregularidadesAXLSX } from '../../utils/metricsCalculator';
import { IrregularityRowCard, IrregularityItem } from './IrregularityRowCard';
import { SheetEditorModal } from '../datos/SheetEditorModal';
import { X, AlertTriangle, FileSpreadsheet, User } from 'lucide-react';

interface IrregularitiesModalProps {
  registros: RegistroArmadoDocumento[];
  empleadoInicial?: string | null;
  onClose: () => void;
  onActualizado: () => void;
}

export function IrregularitiesModal({
  registros,
  empleadoInicial,
  onClose,
  onActualizado,
}: IrregularitiesModalProps) {
  const [filtroEmp, setFiltroEmp] = useState<string>(empleadoInicial || '');
  const [guardando, setGuardando] = useState(false);
  const [planillaEditar, setPlanillaEditar] = useState<RegistroArmadoDocumento | null>(null);

  const items: IrregularityItem[] = [];
  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const esIrregularActiva = !f.accionIrregularidad && Boolean(f.esIrregular && f.notaIrregularidad && f.notaIrregularidad.trim());
      if (esIrregularActiva) {
        const armador = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
        if (!filtroEmp || armador === filtroEmp || reg.empleadoHeader === filtroEmp) {
          items.push({
            docId: reg.id || '',
            filaId: f.id,
            empleadoHeader: reg.empleadoHeader,
            armador,
            fecha: f.fecha,
            horaInicio: f.horaInicio,
            horaFin: f.horaFin,
            cantArticulos: f.cantArticulos,
            notaIrregularidad: f.notaIrregularidad || 'Marca de irregularidad sin detalle',
            nombreArchivo: reg.nombreArchivoOriginal,
          });
        }
      }
    });
  });

  console.log(`[DIAG-MODAL-IRREG] Total irregularidades activas en modal: ${items.length}`, items);

  const handleNormalizar = async (docId: string, filaId: string) => {
    setGuardando(true);
    try {
      await actualizarFilaEnDocumento(docId, filaId, {
        esIrregular: false,
        notaIrregularidad: null,
        accionIrregularidad: undefined,
      });
      onActualizado();
    } catch (err) {
      alert('Error al normalizar la fila: ' + err);
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirEdicionPlanilla = (docId: string) => {
    const regTarget = registros.find((r) => r.id === docId);
    if (regTarget) {
      setPlanillaEditar(regTarget);
    } else {
      alert('No se encontró la planilla correspondiente.');
    }
  };

  const empleadosDisponibles = Array.from(
    new Set(
      registros.flatMap((r) => [
        r.empleadoHeader,
        ...(r.filas?.map((f) => f.empleadoAsignado || f.nuevoEmpleado || r.empleadoHeader) || []),
      ])
    )
  ).sort();

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Revisión y Re-etiquetado de Irregularidades
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Visualización detallada de la línea completa de la planilla original ({items.length} eventos)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportarIrregularidadesAXLSX(registros, filtroEmp || undefined)}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exportar Irregularidades a Excel</span>
              </button>
              <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/40 text-xs">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Filtrar por Armador:</span>
              <select
                value={filtroEmp}
                onChange={(e) => setFiltroEmp(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los armadores</option>
                {empleadosDisponibles.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
            {filtroEmp && (
              <button onClick={() => setFiltroEmp('')} className="text-blue-600 hover:underline dark:text-blue-400">
                Ver todos
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay irregularidades activas registradas {filtroEmp ? `para ${filtroEmp}` : 'en el período seleccionado'}.
              </div>
            ) : (
              items.map((item) => (
                <IrregularityRowCard
                  key={`${item.docId}-${item.filaId}`}
                  item={item}
                  guardando={guardando}
                  onEditarPlanilla={handleAbrirEdicionPlanilla}
                  onNormalizar={handleNormalizar}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {planillaEditar && (
        <SheetEditorModal
          planilla={planillaEditar}
          onCerrar={() => setPlanillaEditar(null)}
          onGuardadoExitoso={() => {
            setPlanillaEditar(null);
            onActualizado();
          }}
        />
      )}
    </>
  );
}

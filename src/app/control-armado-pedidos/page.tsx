// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ModuleLayout } from '@/app/components/layout/ModuleLayout';
import { useArmadoStore } from './stores/armadoStore';
import { BatchDropzone } from './components/carga/BatchDropzone';
import { PendingQueueList } from './components/carga/PendingQueueList';
import { ModalVerificacionPlanilla } from './components/carga/ModalVerificacionPlanilla';
import { DatabaseSyncFooterBar } from './components/carga/DatabaseSyncFooterBar';
import { DataSheetsList } from './components/datos/DataSheetsList';
import { DashboardFilters } from './components/analisis/DashboardFilters';
import { KPICards } from './components/analisis/KPICards';
import { PerformanceCharts } from './components/analisis/PerformanceCharts';
import { AnalyticsTable } from './components/analisis/AnalyticsTable';
import {
  obtenerRegistrosVerificados,
  suscribirPlanillasPendientesFirestore,
} from './services/firestoreService';
import { RegistroArmadoDocumento, FiltrosAnalisis } from './types/armado';
import { calcularMetricasGlobales, calcularRendimientoPorEmpleado } from './utils/metricsCalculator';
import { UploadCloud, BarChart3, AlertCircle, Database } from 'lucide-react';
import { ScanProgressWidget } from './components/carga/ScanProgressWidget';
import { GeminiQuotaWidget } from './components/carga/GeminiQuotaWidget';
import { ExternalJsonImporter } from './components/carga/ExternalJsonImporter';
import { IrregularitiesModal } from './components/analisis/IrregularitiesModal';

export default function ControlArmadoPedidosPage() {
  const { pestanaActiva, setPestanaActiva, alertaDuplicado, errorScan, itemsPendientes } = useArmadoStore();
  const [registrosVerificados, setRegistrosVerificados] = useState<RegistroArmadoDocumento[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAnalisis>({ rango: 'semana' });
  const [isMounted, setIsMounted] = useState(false);
  const [modalIrregularidadesAbierta, setModalIrregularidadesAbierta] = useState(false);
  const [empFiltroModal, setEmpFiltroModal] = useState<string | null>(null);

  const cargarDatosAnalisis = useCallback(() => {
    if (pestanaActiva === 'analisis') {
      obtenerRegistrosVerificados(filtros).then((data) => setRegistrosVerificados(data));
    }
  }, [pestanaActiva, filtros]);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = suscribirPlanillasPendientesFirestore((pendientesFs) => {
      useArmadoStore.getState().setItemsPendientes(pendientesFs);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isMounted) cargarDatosAnalisis();
  }, [isMounted, cargarDatosAnalisis]);

  const handleAbrirIrregularidades = (emp?: string) => {
    setEmpFiltroModal(emp || null);
    setModalIrregularidadesAbierta(true);
  };

  const metricas = calcularMetricasGlobales(registrosVerificados);
  const rendimiento = calcularRendimientoPorEmpleado(registrosVerificados);
  const empleadosList = Array.from(new Set(rendimiento.map((r) => r.empleado)));

  if (!isMounted) {
    return (
      <ModuleLayout
        titulo="Control de Armado de Pedidos"
        descripcion="Escaneo de planillas mejorado con IA (Gemini Vision OCR), verificación lado a lado, datos guardados y métricas."
        breadcrumbs={[{ nombre: 'Dashboard', href: '/' }, { nombre: 'Control de Armado' }]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      titulo="Control de Armado de Pedidos"
      descripcion="Escaneo de planillas mejorado con IA (Gemini Vision OCR), verificación lado a lado, datos guardados y métricas."
      breadcrumbs={[{ nombre: 'Dashboard', href: '/' }, { nombre: 'Control de Armado' }]}
    >
      <div className="space-y-6">
        {modalIrregularidadesAbierta && (
          <IrregularitiesModal
            registros={registrosVerificados}
            empleadoInicial={empFiltroModal}
            onClose={() => setModalIrregularidadesAbierta(false)}
            onActualizado={cargarDatosAnalisis}
          />
        )}

        <ModalVerificacionPlanilla />
        <ScanProgressWidget />

        {errorScan && (
          <div className="flex items-center space-x-2 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 shadow-md dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorScan}</span>
          </div>
        )}

        {alertaDuplicado && (
          <div className="flex items-center space-x-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-800 shadow-md dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{alertaDuplicado}</span>
          </div>
        )}

        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setPestanaActiva('carga')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              pestanaActiva === 'carga'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Carga y Verificación</span>
            {itemsPendientes.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {itemsPendientes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setPestanaActiva('datos')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              pestanaActiva === 'datos'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Datos</span>
          </button>

          <button
            onClick={() => setPestanaActiva('analisis')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              pestanaActiva === 'analisis'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Análisis y Métricas</span>
          </button>
        </div>

        {pestanaActiva === 'carga' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="flex-1">
                  <BatchDropzone />
                </div>
                <GeminiQuotaWidget />
              </div>
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex-1">
                  <ExternalJsonImporter />
                </div>
              </div>
            </div>
            <PendingQueueList />
            <DatabaseSyncFooterBar />
          </div>
        )}

        {pestanaActiva === 'datos' && <DataSheetsList />}

        {pestanaActiva === 'analisis' && (
          <div className="space-y-6">
            <DashboardFilters
              filtros={filtros}
              empleadosDisponibles={empleadosList}
              onCambiarFiltros={setFiltros}
            />
            <KPICards metricas={metricas} />
            <PerformanceCharts
              rendimiento={rendimiento}
              promedioEquipo={metricas.velocidadPromedioEq}
              onVerIrregularidades={handleAbrirIrregularidades}
            />
            <AnalyticsTable rendimiento={rendimiento} registros={registrosVerificados} />
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

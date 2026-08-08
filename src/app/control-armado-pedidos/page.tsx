// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useEffect, useState } from 'react';
import { ModuleLayout } from '@/app/components/layout/ModuleLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useArmadoStore } from './stores/armadoStore';
import { BatchDropzone } from './components/carga/BatchDropzone';
import { PendingQueueList } from './components/carga/PendingQueueList';
import { VerificationSideBySide } from './components/carga/VerificationSideBySide';
import { DatabaseSyncFooterBar } from './components/carga/DatabaseSyncFooterBar';
import { DataSheetsList } from './components/datos/DataSheetsList';
import { DashboardFilters } from './components/analisis/DashboardFilters';
import { KPICards } from './components/analisis/KPICards';
import { PerformanceCharts } from './components/analisis/PerformanceCharts';
import { AnalyticsTable } from './components/analisis/AnalyticsTable';
import { obtenerRegistrosVerificados } from './services/firestoreService';
import { RegistroArmadoDocumento, FiltrosAnalisis } from './types/armado';
import { calcularMetricasGlobales, calcularRendimientoPorEmpleado } from './utils/metricsCalculator';
import { UploadCloud, BarChart3, AlertCircle, Database } from 'lucide-react';

export default function ControlArmadoPedidosPage() {
  const { pestanaActiva, setPestanaActiva, alertaDuplicado, errorScan, itemsPendientes } = useArmadoStore();
  const [registrosVerificados, setRegistrosVerificados] = useState<RegistroArmadoDocumento[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAnalisis>({ rango: 'semana' });
  const [cargandoDatos, setCargandoDatos] = useState(false);

  useEffect(() => {
    if (pestanaActiva === 'analisis') {
      setCargandoDatos(true);
      obtenerRegistrosVerificados(filtros)
        .then((data) => setRegistrosVerificados(data))
        .finally(() => setCargandoDatos(false));
    }
  }, [pestanaActiva, filtros]);

  const metricas = calcularMetricasGlobales(registrosVerificados);
  const rendimiento = calcularRendimientoPorEmpleado(registrosVerificados);
  const empleadosList = Array.from(new Set(rendimiento.map((r) => r.empleado)));

  return (
    <AuthGuard>
      <ModuleLayout
        titulo="Control de Armado de Pedidos"
        descripcion="Escaneo de planillas mejorado con inteligencia artificial (Gemini Vision OCR), verificación lado a lado, gestión de datos guardados y análisis de productividad."
        breadcrumbs={[{ nombre: 'Dashboard', href: '/' }, { nombre: 'Control de Armado' }]}
      >
        <div className="space-y-6">
          {/* Alerta de Error de Escaneo */}
          {errorScan && (
            <div className="flex items-center space-x-2 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 shadow-md dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <span>{errorScan}</span>
            </div>
          )}

          {/* Alerta de Duplicados en Pantalla */}
          {alertaDuplicado && (
            <div className="flex items-center space-x-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-800 shadow-md dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <span>{alertaDuplicado}</span>
            </div>
          )}

          {/* Navegación por 3 Pestañas: Carga, Datos, Análisis */}
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

          {/* Contenido Pestaña 1: Carga y Verificación */}
          {pestanaActiva === 'carga' && (
            <div className="space-y-6">
              <BatchDropzone />
              <PendingQueueList />
              <VerificationSideBySide />
              <DatabaseSyncFooterBar />
            </div>
          )}

          {/* Contenido Pestaña 2: Datos Guardados en Firestore */}
          {pestanaActiva === 'datos' && <DataSheetsList />}

          {/* Contenido Pestaña 3: Análisis y Métricas */}
          {pestanaActiva === 'analisis' && (
            <div className="space-y-6">
              <DashboardFilters
                filtros={filtros}
                empleadosDisponibles={empleadosList}
                onCambiarFiltros={setFiltros}
              />
              <KPICards metricas={metricas} />
              <PerformanceCharts rendimiento={rendimiento} promedioEquipo={metricas.velocidadPromedioEq} />
              <AnalyticsTable rendimiento={rendimiento} registros={registrosVerificados} />
            </div>
          )}
        </div>
      </ModuleLayout>
    </AuthGuard>
  );
}

// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useReporteVentasStore, ExcelRow } from '@/app/stores/reporteVentasStore';
import { FileUpload, ProcessedExcelData } from '@/app/components/shared/FileUpload';

export function UploadStep() {
  const {
    ventasFile,
    nominaFile,
    setVentasFile,
    setVentasData,
    setNominaFile,
    setNominaData,
    setIsGenerating,
    setError,
    setStep,
  } = useReporteVentasStore();

  // Callback al cargar el archivo de ventas
  const handleVentasFileLoad = (file: File, { data, columns, previewData }: ProcessedExcelData<ExcelRow>) => {
    setVentasFile(file);
    setVentasData(data, columns, previewData);
  };

  // Callback al cargar la nómina de clientes
  const handleNominaFileLoad = (file: File, { data, columns, previewData }: ProcessedExcelData<ExcelRow>) => {
    setNominaFile(file);
    setNominaData(data, columns, previewData);
  };

  // Solo el archivo de ventas es obligatorio, la nómina es opcional
  const handleNextStep = () => {
    if (ventasFile) {
      setStep(2);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-8">
        <FileUpload<ExcelRow>
          title="1. Cargar Archivo de Ventas"
          description="Planilla de facturación con el detalle de ventas del período."
          file={ventasFile}
          onFileLoad={handleVentasFileLoad}
          setIsLoading={setIsGenerating}
          setError={setError}
        />

        <FileUpload<ExcelRow>
          title="2. Cargar Nómina de Clientes"
          description="Planilla con la asignación de vendedores por cliente. Se usa para reasignar ventas al vendedor real."
          file={nominaFile}
          onFileLoad={handleNominaFileLoad}
          setIsLoading={setIsGenerating}
          setError={setError}
        />
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextStep}
          disabled={!ventasFile}
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

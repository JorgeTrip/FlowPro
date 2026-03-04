// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { CellValue } from 'read-excel-file';
import { generarReporte, ReporteResultados } from '@/app/lib/reportGenerator';
import { Venta } from '@/app/reporte-de-ventas/lib/types';

export type { CellValue };

export interface ExcelRow {
  [key: string]: CellValue;
}

// Mapeo de columnas de la nómina de clientes
export interface NominaMapeo {
  RazonSocial: string;
  Vendedor: string;
}

// Configuración específica para el reporte de ventas
interface Configuracion {
  mapeo: {
    [key in keyof Venta]?: string;
  };
  nominaMapeo?: NominaMapeo;
}

export interface ReporteVentasState {
  // State - Archivo de ventas
  step: number;
  ventasFile: File | null;
  ventasData: ExcelRow[];
  ventasPreviewData: ExcelRow[];
  ventasColumnas: string[];
  configuracion: Configuracion | null;
  resultados: ReporteResultados | null;
  isGenerating: boolean;
  error: string | null;

  // State - Nómina de clientes (planilla de asignación de vendedores)
  nominaFile: File | null;
  nominaData: ExcelRow[];
  nominaPreviewData: ExcelRow[];
  nominaColumnas: string[];

  // Actions
  setStep: (step: number) => void;
  setVentasFile: (file: File | null) => void;
  setVentasData: (data: ExcelRow[], columnas: string[], previewData: ExcelRow[]) => void;
  setNominaFile: (file: File | null) => void;
  setNominaData: (data: ExcelRow[], columnas: string[], previewData: ExcelRow[]) => void;
  setConfiguracion: (configuracion: Configuracion) => void;
  setNominaMapeo: (nominaMapeo: NominaMapeo) => void;
  setResultados: (resultados: ReporteResultados | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  generarReporte: () => void;
  reset: () => void;
}

const initialState: Omit<ReporteVentasState, 'setStep' | 'setVentasFile' | 'setVentasData' | 'setNominaFile' | 'setNominaData' | 'setConfiguracion' | 'setNominaMapeo' | 'setResultados' | 'setIsGenerating' | 'setError' | 'generarReporte' | 'reset'> = {
  step: 1,
  ventasFile: null,
  ventasData: [],
  ventasPreviewData: [],
  ventasColumnas: [],
  configuracion: null,
  resultados: null,
  isGenerating: false,
  error: null,
  // Nómina de clientes
  nominaFile: null,
  nominaData: [],
  nominaPreviewData: [],
  nominaColumnas: [],
};

export const useReporteVentasStore = create<ReporteVentasState>()((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setVentasFile: (file) => set({ ventasFile: file, resultados: null, step: 1 }),
  setVentasData: (data, columnas, previewData) => set({ ventasData: data, ventasColumnas: columnas, ventasPreviewData: previewData }),
  setNominaFile: (file) => set({ nominaFile: file }),
  setNominaData: (data, columnas, previewData) => set({ nominaData: data, nominaColumnas: columnas, nominaPreviewData: previewData }),
  setConfiguracion: (configuracion) => set({ configuracion }),
  setNominaMapeo: (nominaMapeo) => set((state) => ({ configuracion: { ...state.configuracion!, nominaMapeo } })),
  setResultados: (resultados) => set({ resultados }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
  generarReporte: () => {
    const { ventasData, configuracion, nominaData } = get();
    const nominaMapeo = configuracion?.nominaMapeo;
    if (!ventasData.length || !configuracion?.mapeo) {
      set({ error: 'No hay datos o configuración para generar el reporte.' });
      return;
    }

    set({ isGenerating: true, error: null });

    // Simula un pequeño retraso para que la UI de carga sea visible
    setTimeout(() => {
      try {
        const mapeo = configuracion.mapeo;
        const ventasProcesadas: Venta[] = ventasData.map((row: ExcelRow) => {
          // Fix para descripción: buscar tanto con tilde como sin tilde
          let descripcion = String(row[mapeo.Descripcion || ''] || '');
          if (!descripcion && mapeo.Descripcion === 'Descripción') {
            descripcion = String(row['Descripcion'] || ''); // Sin tilde como fallback
          }

          return {
            Periodo: String(row[mapeo.Periodo || ''] || ''),
            Fecha: String(row[mapeo.Fecha || ''] || ''),
            TipoComprobante: String(row[mapeo.TipoComprobante || ''] || ''),
            NroComprobante: String(row[mapeo.NroComprobante || ''] || ''),
            ReferenciaVendedor: String(row[mapeo.ReferenciaVendedor || ''] || ''),
            RazonSocial: String(row[mapeo.RazonSocial || ''] || ''),
            Cliente: String(row[mapeo.Cliente || ''] || ''),
            Direccion: String(row[mapeo.Direccion || ''] || ''),
            Articulo: String(row[mapeo.Articulo || ''] || ''),
            Descripcion: descripcion,
            Cantidad: Number(row[mapeo.Cantidad || '']) || 0,
            PrecioUnitario: Number(row[mapeo.PrecioUnitario || '']) || 0,
            PrecioTotal: Number(row[mapeo.PrecioTotal || '']) || 0,
            Total: Number(row[mapeo.Total || '']) || 0,
            TotalCIVA: Number(row[mapeo.TotalCIVA || '']) || 0,
            DirectoIndirecto: String(row[mapeo.DirectoIndirecto || ''] || ''),
            DescRubro: String(row[mapeo.DescRubro || ''] || ''),
            DescripcionZona: String(row[mapeo.DescripcionZona || ''] || ''),
          };
        });

        // DEBUG: Estado de la configuración de nómina
        console.log('🔍 [STORE DEBUG] nominaData.length:', nominaData.length);
        console.log('🔍 [STORE DEBUG] nominaMapeo:', nominaMapeo);
        console.log('🔍 [STORE DEBUG] configuracion.nominaMapeo:', configuracion?.nominaMapeo);
        if (nominaData.length > 0) {
          console.log('🔍 [STORE DEBUG] Primera fila nómina keys:', Object.keys(nominaData[0]));
          console.log('🔍 [STORE DEBUG] Primera fila nómina:', nominaData[0]);
        }

        // Construir mapa cliente → vendedor desde la nómina de clientes
        // Se usa para reasignar ventas que figuran como "Hierbas del Oasis" al vendedor real
        let clienteVendorMap: Map<string, string> | undefined;
        if (nominaData.length > 0 && nominaMapeo?.RazonSocial && nominaMapeo?.Vendedor) {
          clienteVendorMap = new Map<string, string>();
          const colRazonSocial = nominaMapeo.RazonSocial;
          const colVendedor = nominaMapeo.Vendedor;
          console.log(`🔍 [STORE DEBUG] Buscando columnas: RazonSocial="${colRazonSocial}", Vendedor="${colVendedor}"`);
          nominaData.forEach((row: ExcelRow) => {
            // Usamos las columnas mapeadas por el usuario en la UI
            // El cruce se hace por Razón Social, que coincide con v.Cliente en las ventas
            const razonSocial = String(row[colRazonSocial] || '').trim();
            const vendedor = String(row[colVendedor] || '').trim();
            if (razonSocial && vendedor) {
              clienteVendorMap!.set(razonSocial, vendedor);
            }
          });
          console.log(`📋 Nómina de clientes: ${clienteVendorMap.size} clientes con vendedor asignado (columnas: ${colRazonSocial} → ${colVendedor})`);
        } else {
          console.warn('⚠️ [STORE DEBUG] NO se construyó clienteVendorMap. Condiciones:',
            { nominaDataLength: nominaData.length, nominaMapeoRazonSocial: nominaMapeo?.RazonSocial, nominaMapeoVendedor: nominaMapeo?.Vendedor });
        }

        const nuevosResultados = generarReporte(ventasProcesadas, clienteVendorMap);
        set({ resultados: nuevosResultados, isGenerating: false, step: 3 });
      } catch (err) {
        console.error('Error durante la generación del reporte:', err);
        set({ error: err instanceof Error ? err.message : 'Ocurrió un error al generar el reporte.', isGenerating: false });
      }
    }, 500); // 500ms de retraso
  },
  reset: () => set(initialState),
}));

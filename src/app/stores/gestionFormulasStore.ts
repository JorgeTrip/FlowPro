// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  ConfiguracionMapeoFormulas,
} from '@/app/gestion-formulas/lib/types';
import { ResultadoMRP } from '@/app/gestion-formulas/lib/motorMRP';

/**
 * ==========================================
 * SECCIÓN 1: INTERFAZ DEL ESTADO Y ACCIONES
 * ==========================================
 */

export interface GestionFormulasState {
  // --- Estados de Datos de Negocio Persistidos ---
  productos: Producto[];
  formulas: Formula[];
  stocks: StockPorDeposito[];
  consumos: ConsumoMensual[];

  // --- Estados Crudos de Importación (Temporales) ---
  archivoProductos: File | null;
  archivoFormulas: File | null;
  archivoStock: File | null;
  archivoConsumo: File | null;
  datosCrudosProductos: any[];
  datosCrudosFormulas: any[];
  datosCrudosStock: any[];
  datosCrudosConsumo: any[];
  columnasProductos: string[];
  columnasFormulas: string[];
  columnasStock: string[];
  columnasConsumo: string[];
  previewProductos: any[];
  previewFormulas: any[];
  previewStock: any[];
  previewConsumo: any[];

  // --- Estados de Configuración y Auditoría ---
  step: number;
  configuracionMapeo: ConfiguracionMapeoFormulas;
  isLoading: boolean;
  error: string | null;
  /** Agrupa las recetas importadas clasificadas tras la comparación inteligente */
  formulasClasificadas: { nueva: Formula[]; modificada: Formula[]; sin_cambios: Formula[] } | null;

  // --- Estados de Cálculo MRP ---
  resultadosMRP: ResultadoMRP[] | null;
  cargandoCalculo: boolean;

  // --- Acciones de Configuración e Importación ---
  setArchivoProductos: (file: File | null) => void;
  setArchivoFormulas: (file: File | null) => void;
  setArchivoStock: (file: File | null) => void;
  setArchivoConsumo: (file: File | null) => void;
  setDatosCrudosProductos: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosFormulas: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosStock: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosConsumo: (data: any[], cols: string[], preview: any[]) => void;
  setStep: (step: number) => void;
  setProductos: (productos: Producto[]) => void;
  setFormulas: (formulas: Formula[]) => void;
  setStocks: (stocks: StockPorDeposito[]) => void;
  setConsumos: (consumos: ConsumoMensual[]) => void;
  setConfiguracionMapeo: (mapeo: Partial<ConfiguracionMapeoFormulas>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFormulasClasificadas: (clasificadas: { nueva: Formula[]; modificada: Formula[]; sin_cambios: Formula[] } | null) => void;

  // --- Acciones de Negocio (MRP e Historial) ---
  ejecutarCalculoMRP: (meses?: number) => Promise<void>;
  guardarImportacionConfirmada: () => void;
  limpiarDatos: () => void;
  reset: () => void;

  // --- Google Drive Links ---
  urlGoogleDriveFormulas: string | null;
  urlGoogleDriveStock: string | null;
  urlGoogleDriveRotacion: string | null;
  setUrlGoogleDriveFormulas: (url: string | null) => void;
  setUrlGoogleDriveStock: (url: string | null) => void;
  setUrlGoogleDriveRotacion: (url: string | null) => void;
}

/**
 * ==========================================
 * SECCIÓN 2: ESTADO INICIAL
 * ==========================================
 */

const estadoInicial = {
  productos: [],
  formulas: [],
  stocks: [],
  consumos: [],

  archivoProductos: null,
  archivoFormulas: null,
  archivoStock: null,
  archivoConsumo: null,
  datosCrudosProductos: [],
  datosCrudosFormulas: [],
  datosCrudosStock: [],
  datosCrudosConsumo: [],
  columnasProductos: [],
  columnasFormulas: [],
  columnasStock: [],
  columnasConsumo: [],
  previewProductos: [],
  previewFormulas: [],
  previewStock: [],
  previewConsumo: [],

  step: 1,
  configuracionMapeo: {
    productos: null,
    formulas: null,
    stock: null,
    consumo: null,
  },
  isLoading: false,
  error: null,
  formulasClasificadas: null,

  resultadosMRP: null,
  cargandoCalculo: false,
  urlGoogleDriveFormulas: null,
  urlGoogleDriveStock: null,
  urlGoogleDriveRotacion: null,
};

/**
 * ==========================================
 * SECCIÓN 3: INICIALIZACIÓN DEL STORE CON PERSISTENCIA
 * ==========================================
 */

export const useGestionFormulasStore = create<GestionFormulasState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,

      setArchivoProductos: (archivoProductos) => set({ archivoProductos }),
      setArchivoFormulas: (archivoFormulas) => set({ archivoFormulas }),
      setArchivoStock: (archivoStock) => set({ archivoStock }),
      setArchivoConsumo: (archivoConsumo) => set({ archivoConsumo }),
      setDatosCrudosProductos: (datosCrudosProductos, columnasProductos, previewProductos) => set({ datosCrudosProductos, columnasProductos, previewProductos }),
      setDatosCrudosFormulas: (datosCrudosFormulas, columnasFormulas, previewFormulas) => set({ datosCrudosFormulas, columnasFormulas, previewFormulas }),
      setDatosCrudosStock: (datosCrudosStock, columnasStock, previewStock) => set({ datosCrudosStock, columnasStock, previewStock }),
      setDatosCrudosConsumo: (datosCrudosConsumo, columnasConsumo, previewConsumo) => set({ datosCrudosConsumo, columnasConsumo, previewConsumo }),
      setStep: (step) => set({ step }),
      setProductos: (productos) => set({ productos }),
      setFormulas: (formulas) => set({ formulas }),
      setStocks: (stocks) => set({ stocks }),
      setConsumos: (consumos) => set({ consumos }),
      setConfiguracionMapeo: (mapeo) => set((s) => ({ configuracionMapeo: { ...s.configuracionMapeo, ...mapeo } })),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFormulasClasificadas: (formulasClasificadas) => set({ formulasClasificadas }),
      setUrlGoogleDriveFormulas: (urlGoogleDriveFormulas) => set({ urlGoogleDriveFormulas }),
      setUrlGoogleDriveStock: (urlGoogleDriveStock) => set({ urlGoogleDriveStock }),
      setUrlGoogleDriveRotacion: (urlGoogleDriveRotacion) => set({ urlGoogleDriveRotacion }),

      ejecutarCalculoMRP: async (meses = 3) => {
        set({ cargandoCalculo: true, error: null });
        try {
          const { productos, formulas, stocks, consumos } = get();
          // Retraso elegante para transmitir robustez (Triada de Jorge)
          await new Promise((resolve) => setTimeout(resolve, 850));
          const { calcularRequerimientosMRP } = await import('@/app/gestion-formulas/lib/motorMRP');
          const resultados = calcularRequerimientosMRP(productos, formulas, stocks, consumos, meses);
          set({ resultadosMRP: resultados, cargandoCalculo: false });
        } catch (err: any) {
          set({ error: err.message || 'Error al calcular MRP.', cargandoCalculo: false });
        }
      },

      guardarImportacionConfirmada: () => {
        const { formulasClasificadas, formulas } = get();
        if (!formulasClasificadas) return;

        // 1. Obtener los códigos de las recetas modificadas para marcar sus versiones previas
        const codigosModificados = new Set(formulasClasificadas.modificada.map((f) => f.codigoProducto));

        // 2. Marcar las versiones previas como 'obsoletas'
        const formulasActualizadas = formulas.map((f) =>
          codigosModificados.has(f.codigoProducto) && f.estado === 'activa'
            ? { ...f, estado: 'obsoleta' as const }
            : f
        );

        // 3. Volcar todo al store (se persistirá en IndexedDB de inmediato)
        set({
          formulas: [...formulasActualizadas, ...formulasClasificadas.nueva, ...formulasClasificadas.modificada],
          formulasClasificadas: null,
          step: 3,
        });
      },

      limpiarDatos: () =>
        set({
          productos: [],
          formulas: [],
          stocks: [],
          consumos: [],
          resultadosMRP: null,
          archivoProductos: null,
          archivoFormulas: null,
          archivoStock: null,
          archivoConsumo: null,
          datosCrudosProductos: [],
          datosCrudosFormulas: [],
          datosCrudosStock: [],
          datosCrudosConsumo: [],
        }),
      reset: () => set(estadoInicial),
    }),
    {
      name: 'flowpro-gestion-formulas-store',
      storage: createJSONStorage(() => indexedDBStorage),
      // Solo persistimos datos útiles y el paso final
      partialize: (state) => ({
        productos: state.productos,
        formulas: state.formulas,
        stocks: state.stocks,
        consumos: state.consumos,
        step: state.step,
        configuracionMapeo: state.configuracionMapeo,
        resultadosMRP: state.resultadosMRP,
        urlGoogleDriveFormulas: state.urlGoogleDriveFormulas,
        urlGoogleDriveStock: state.urlGoogleDriveStock,
        urlGoogleDriveRotacion: state.urlGoogleDriveRotacion,
      }),
    }
  )
);

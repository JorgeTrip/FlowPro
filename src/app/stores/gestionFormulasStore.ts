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
  ProductoTerminadoMaestro,
} from '@/app/gestion-formulas/lib/types';
import { ResultadosMRPFinal } from '@/app/gestion-formulas/lib/types';

export interface GestionFormulasState {
  productos: Producto[];
  formulas: Formula[];
  stocks: StockPorDeposito[];
  consumos: ConsumoMensual[];
  stockPT: ProductoTerminadoMaestro[];

  archivoProductos: File | null;
  archivoFormulas: File | null;
  archivoStock: File | null;
  archivoConsumo: File | null;
  archivoStockPT: File | null;

  datosCrudosProductos: any[];
  datosCrudosFormulas: any[];
  datosCrudosStock: any[];
  datosCrudosConsumo: any[];
  datosCrudosStockPT: any[];

  columnasProductos: string[];
  columnasFormulas: string[];
  columnasStock: string[];
  columnasConsumo: string[];
  columnasStockPT: string[];

  previewProductos: any[];
  previewFormulas: any[];
  previewStock: any[];
  previewConsumo: any[];
  previewStockPT: any[];

  step: number;
  pestañaActiva: 'propios' | 'tercerizados';
  configuracionMapeo: ConfiguracionMapeoFormulas;
  isLoading: boolean;
  error: string | null;
  formulasClasificadas: { nueva: Formula[]; modificada: Formula[]; sin_cambios: Formula[] } | null;

  resultadosMRP: ResultadosMRPFinal | null;
  cargandoCalculo: boolean;

  setArchivoProductos: (file: File | null) => void;
  setArchivoFormulas: (file: File | null) => void;
  setArchivoStock: (file: File | null) => void;
  setArchivoConsumo: (file: File | null) => void;
  setArchivoStockPT: (file: File | null) => void;

  setDatosCrudosProductos: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosFormulas: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosStock: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosConsumo: (data: any[], cols: string[], preview: any[]) => void;
  setDatosCrudosStockPT: (data: any[], cols: string[], preview: any[]) => void;

  setStep: (step: number) => void;
  setPestañaActiva: (pest: 'propios' | 'tercerizados') => void;
  setProductos: (productos: Producto[]) => void;
  setFormulas: (formulas: Formula[]) => void;
  setStocks: (stocks: StockPorDeposito[]) => void;
  setConsumos: (consumos: ConsumoMensual[]) => void;
  setStockPT: (stockPT: ProductoTerminadoMaestro[]) => void;
  setConfiguracionMapeo: (mapeo: Partial<ConfiguracionMapeoFormulas>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFormulasClasificadas: (clasificadas: any) => void;

  ejecutarCalculoMRP: (mesesRotacion?: number) => Promise<void>;
  guardarImportacionConfirmada: () => void;
  limpiarDatos: () => void;
  reset: () => void;

  urlGoogleDriveFormulas: string | null;
  urlGoogleDriveStock: string | null;
  setUrlGoogleDriveFormulas: (url: string | null) => void;
  setUrlGoogleDriveStock: (url: string | null) => void;
}

const estadoInicial = {
  productos: [], formulas: [], stocks: [], consumos: [], stockPT: [],
  archivoProductos: null, archivoFormulas: null, archivoStock: null, archivoConsumo: null, archivoStockPT: null,
  datosCrudosProductos: [], datosCrudosFormulas: [], datosCrudosStock: [], datosCrudosConsumo: [], datosCrudosStockPT: [],
  columnasProductos: [], columnasFormulas: [], columnasStock: [], columnasConsumo: [], columnasStockPT: [],
  previewProductos: [], previewFormulas: [], previewStock: [], previewConsumo: [], previewStockPT: [],
  step: 1, pestañaActiva: 'propios' as const,
  configuracionMapeo: { productos: null, formulas: null, stock: null, consumo: null, stockPT: null },
  isLoading: false, error: null, formulasClasificadas: null,
  resultadosMRP: null, cargandoCalculo: false,
  urlGoogleDriveFormulas: null, urlGoogleDriveStock: null,
};

export const useGestionFormulasStore = create<GestionFormulasState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,
      setArchivoProductos: (archivoProductos) => set({ archivoProductos }),
      setArchivoFormulas: (archivoFormulas) => set({ archivoFormulas }),
      setArchivoStock: (archivoStock) => set({ archivoStock }),
      setArchivoConsumo: (archivoConsumo) => set({ archivoConsumo }),
      setArchivoStockPT: (archivoStockPT) => set({ archivoStockPT }),
      setDatosCrudosProductos: (datosCrudosProductos, columnasProductos, previewProductos) => set({ datosCrudosProductos, columnasProductos, previewProductos }),
      setDatosCrudosFormulas: (datosCrudosFormulas, columnasFormulas, previewFormulas) => set({ datosCrudosFormulas, columnasFormulas, previewFormulas }),
      setDatosCrudosStock: (datosCrudosStock, columnasStock, previewStock) => set({ datosCrudosStock, columnasStock, previewStock }),
      setDatosCrudosConsumo: (datosCrudosConsumo, columnasConsumo, previewConsumo) => set({ datosCrudosConsumo, columnasConsumo, previewConsumo }),
      setDatosCrudosStockPT: (datosCrudosStockPT, columnasStockPT, previewStockPT) => set({ datosCrudosStockPT, columnasStockPT, previewStockPT }),
      setStep: (step) => set({ step }),
      setPestañaActiva: (pestañaActiva) => set({ pestañaActiva }),
      setProductos: (productos) => set({ productos }),
      setFormulas: (formulas) => set({ formulas }),
      setStocks: (stocks) => set({ stocks }),
      setConsumos: (consumos) => set({ consumos }),
      setStockPT: (stockPT) => set({ stockPT }),
      setConfiguracionMapeo: (mapeo) => set((s) => ({ configuracionMapeo: { ...s.configuracionMapeo, ...mapeo } })),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFormulasClasificadas: (formulasClasificadas) => set({ formulasClasificadas }),
      setUrlGoogleDriveFormulas: (urlGoogleDriveFormulas) => set({ urlGoogleDriveFormulas }),
      setUrlGoogleDriveStock: (urlGoogleDriveStock) => set({ urlGoogleDriveStock }),

      ejecutarCalculoMRP: async (mesesRotacion = 1) => {
        set({ cargandoCalculo: true, error: null });
        try {
          const { productos, formulas, stocks, consumos, stockPT } = get();
          const { usePrefijosStore } = await import('@/app/stores/prefijosStore');
          const reglasPrefijos = usePrefijosStore.getState().reglas || [];

          await new Promise((resolve) => setTimeout(resolve, 850));
          const { calcularRequerimientosMRP } = await import('@/app/gestion-formulas/lib/motorMRP');
          const resultados = calcularRequerimientosMRP(
            productos,
            formulas,
            stocks,
            consumos,
            stockPT,
            mesesRotacion,
            reglasPrefijos
          );
          set({ resultadosMRP: resultados, cargandoCalculo: false });
        } catch (err: any) {
          set({ error: err.message || 'Error al calcular MRP.', cargandoCalculo: false });
        }
      },

      guardarImportacionConfirmada: () => {
        const { formulasClasificadas, formulas } = get();
        if (!formulasClasificadas) return;
        const codigosModificados = new Set(formulasClasificadas.modificada.map((f) => f.codigoProducto));
        const formulasActualizadas = formulas.map((f) =>
          codigosModificados.has(f.codigoProducto) && f.estado === 'activa'
            ? { ...f, estado: 'obsoleta' as const }
            : f
        );
        set({
          formulas: [...formulasActualizadas, ...formulasClasificadas.nueva, ...formulasClasificadas.modificada],
          formulasClasificadas: null,
          step: 3,
        });
      },

      limpiarDatos: () => set((s) => ({
        ...estadoInicial,
        formulas: s.formulas,
        productos: s.productos,
        urlGoogleDriveFormulas: s.urlGoogleDriveFormulas,
        urlGoogleDriveStock: s.urlGoogleDriveStock,
      })),
      reset: () => set(estadoInicial),
    }),
    {
      name: 'flowpro-gestion-formulas-store',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        productos: state.productos,
        formulas: state.formulas,
        stocks: state.stocks,
        consumos: state.consumos,
        stockPT: state.stockPT,
        step: state.step,
        configuracionMapeo: state.configuracionMapeo,
        resultadosMRP: state.resultadosMRP,
        urlGoogleDriveFormulas: state.urlGoogleDriveFormulas,
        urlGoogleDriveStock: state.urlGoogleDriveStock,
      }),
    }
  )
);

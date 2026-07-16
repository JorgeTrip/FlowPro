// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';

interface PrefijosState {
  reglas: ReglaPrefijo[];
  agregarRegla: (regla: Omit<ReglaPrefijo, 'id'>) => void;
  eliminarRegla: (id: string) => void;
  modificarRegla: (id: string, updates: Partial<ReglaPrefijo>) => void;
  importarReglas: (reglas: ReglaPrefijo[]) => { exito: boolean; mensaje: string };
  limpiarReglas: () => void;
  reset: () => void;
}

const reglasSemilla: ReglaPrefijo[] = [
  {
    id: 'semilla-1',
    prefijo: '01ACE',
    linea: 'Aceites esenciales',
    sitioFabricacion: 'CABA',
    descripcion: 'Prefijo inicial de ejemplo para la línea de aceites esenciales.'
  }
];

export const usePrefijosStore = create<PrefijosState>()(
  persist(
    (set) => ({
      reglas: reglasSemilla,

      agregarRegla: (nueva) => {
        const id = `prefijo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          reglas: [...state.reglas, { ...nueva, id }]
        }));
      },

      eliminarRegla: (id) => {
        set((state) => ({
          reglas: state.reglas.filter((r) => r.id !== id)
        }));
      },

      modificarRegla: (id, updates) => {
        set((state) => ({
          reglas: state.reglas.map((r) => (r.id === id ? { ...r, ...updates } : r))
        }));
      },

      importarReglas: (nuevasReglas) => {
        if (!Array.isArray(nuevasReglas)) {
          return { exito: false, mensaje: 'El archivo no contiene un formato de lista válido.' };
        }

        // Validación de estructura
        const reglasValidadas: ReglaPrefijo[] = [];
        for (const item of nuevasReglas) {
          if (!item.prefijo || !item.linea || !item.sitioFabricacion) {
            return { exito: false, mensaje: 'Una o más reglas no contienen los campos obligatorios (prefijo, linea, sitioFabricacion).' };
          }
          const sitioValido = ['CABA', 'ENTRE RIOS', 'CABA + ENTRE RIOS', 'TERC. CABA', 'TERC. ENTRE RIOS', 'TERC. CON PROV. MP'].includes(item.sitioFabricacion);
          if (!sitioValido) {
            return { exito: false, mensaje: `Sitio de fabricación inválido: "${item.sitioFabricacion}". Valores válidos: CABA, ENTRE RIOS, CABA + ENTRE RIOS, TERC. CABA, TERC. ENTRE RIOS, TERC. CON PROV. MP.` };
          }

          reglasValidadas.push({
            id: item.id || `prefijo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            prefijo: String(item.prefijo).trim(),
            linea: String(item.linea).trim(),
            sitioFabricacion: item.sitioFabricacion,
            descripcion: item.descripcion ? String(item.descripcion).trim() : undefined
          });
        }

        set({ reglas: reglasValidadas });
        return { exito: true, mensaje: `Se importaron ${reglasValidadas.length} reglas correctamente.` };
      },

      reset: () => set({ reglas: reglasSemilla }),
      limpiarReglas: () => set({ reglas: [] })
    }),
    {
      name: 'flowpro-prefijos-store',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        reglas: state.reglas
      })
    }
  )
);

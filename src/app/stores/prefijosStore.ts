// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';
import type { ReglaPrefijo } from '@/features/prefijos/types/prefijos';
import {
  normalizarSitioFabricacion,
  validarReglaPrefijo,
} from '@/features/prefijos/services/normalizadorPrefijos';
import {
  suscribirPrefijosFirestore,
  guardarReglaFirestore,
  eliminarReglaFirestore,
  limpiarColeccionFirestore,
  importarLoteFirestore,
  migrarReglasLocalesAFirestore,
} from '@/features/prefijos/services/servicioPrefijosFirestore';

export interface PrefijosState {
  reglas: ReglaPrefijo[];
  cargandoNube: boolean;
  errorNube: string | null;
  iniciarSuscripcionNube: (emailUsuario?: string) => () => void;
  agregarRegla: (regla: Omit<ReglaPrefijo, 'id'>, emailUsuario?: string) => void;
  eliminarRegla: (id: string) => void;
  modificarRegla: (id: string, updates: Partial<ReglaPrefijo>, emailUsuario?: string) => void;
  importarReglas: (reglas: any[], emailUsuario?: string) => { exito: boolean; mensaje: string };
  limpiarReglas: () => void;
  reset: () => void;
}

const reglasSemilla: ReglaPrefijo[] = [
  {
    id: 'semilla-1',
    prefijo: '01ACE',
    linea: 'Aceites esenciales',
    sitioFabricacion: 'CABA',
    descripcion: 'Prefijo inicial de ejemplo para la línea de aceites esenciales.',
  },
];

let desuscribirNubeActiva: (() => void) | null = null;

export const usePrefijosStore = create<PrefijosState>()(
  persist(
    (set, get) => ({
      reglas: reglasSemilla,
      cargandoNube: false,
      errorNube: null,

      iniciarSuscripcionNube: (emailUsuario?: string) => {
        if (typeof window === 'undefined') return () => {};
        if (desuscribirNubeActiva) return desuscribirNubeActiva;

        set({ cargandoNube: true, errorNube: null });

        const unsubscribe = suscribirPrefijosFirestore(
          async (reglasNube) => {
            if (reglasNube.length === 0) {
              const locales = get().reglas.length > 0 ? get().reglas : reglasSemilla;
              await migrarReglasLocalesAFirestore(locales, emailUsuario);
              set({ reglas: locales, cargandoNube: false });
            } else {
              set({ reglas: reglasNube, cargandoNube: false });
            }
          },
          (error) => {
            set({ errorNube: error.message, cargandoNube: false });
          }
        );

        desuscribirNubeActiva = () => {
          unsubscribe();
          desuscribirNubeActiva = null;
        };

        return desuscribirNubeActiva;
      },

      agregarRegla: (nueva, emailUsuario) => {
        const id = `prefijo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const reglaCompleta: ReglaPrefijo = { ...nueva, id };

        set((state) => ({ reglas: [...state.reglas, reglaCompleta] }));
        guardarReglaFirestore(reglaCompleta, emailUsuario).catch((err) =>
          console.error('[PrefijosStore] Error al guardar en Firestore:', err)
        );
      },

      eliminarRegla: (id) => {
        set((state) => ({ reglas: state.reglas.filter((r) => r.id !== id) }));
        eliminarReglaFirestore(id).catch((err) =>
          console.error('[PrefijosStore] Error al eliminar en Firestore:', err)
        );
      },

      modificarRegla: (id, updates, emailUsuario) => {
        let reglaModificada: ReglaPrefijo | undefined;
        set((state) => {
          const nuevas = state.reglas.map((r) => {
            if (r.id === id) {
              reglaModificada = { ...r, ...updates };
              return reglaModificada;
            }
            return r;
          });
          return { reglas: nuevas };
        });

        if (reglaModificada) {
          guardarReglaFirestore(reglaModificada, emailUsuario).catch((err) =>
            console.error('[PrefijosStore] Error al actualizar en Firestore:', err)
          );
        }
      },

      importarReglas: (nuevasReglas, emailUsuario) => {
        if (!Array.isArray(nuevasReglas)) {
          return { exito: false, mensaje: 'El archivo no contiene un formato de lista válido.' };
        }

        const reglasValidadas: ReglaPrefijo[] = [];
        for (const item of nuevasReglas) {
          const validacion = validarReglaPrefijo(item);
          if (!validacion.valida) {
            return { exito: false, mensaje: validacion.error || 'Regla inválida.' };
          }
          const sitio = normalizarSitioFabricacion(item.sitioFabricacion)!;
          reglasValidadas.push({
            id: item.id || `prefijo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            prefijo: String(item.prefijo).trim().toUpperCase(),
            linea: String(item.linea).trim(),
            sitioFabricacion: sitio,
            descripcion: item.descripcion ? String(item.descripcion).trim() : undefined,
          });
        }

        set({ reglas: reglasValidadas });
        importarLoteFirestore(reglasValidadas, emailUsuario).catch((err) =>
          console.error('[PrefijosStore] Error al importar lote en Firestore:', err)
        );

        return { exito: true, mensaje: `Se importaron ${reglasValidadas.length} reglas correctamente.` };
      },

      reset: () => set({ reglas: reglasSemilla }),

      limpiarReglas: () => {
        set({ reglas: [] });
        limpiarColeccionFirestore().catch((err) =>
          console.error('[PrefijosStore] Error al limpiar en Firestore:', err)
        );
      },
    }),
    {
      name: 'flowpro-prefijos-store',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        reglas: state.reglas,
      }),
    }
  )
);

// Inicialización transparente de la suscripción reactiva en el cliente
if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePrefijosStore.getState().iniciarSuscripcionNube();
  }, 100);
}


// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const LIMITE_RPM_GRATIS = 15; // Requests Per Minute (Google AI Studio Tier Gratis)
export const LIMITE_RPD_GRATIS = 1500; // Requests Per Day (Google AI Studio Tier Gratis)

interface GeminiQuotaState {
  peticionesHoy: number;
  fechaHoyStr: string;
  timestampsMinuto: number[]; // Timestamps de peticiones realizadas en los últimos 60 segundos

  // Acciones
  registrarPeticion: () => void;
  limpiarMinuto: () => void;
  resetearContadores: () => void;
}

export const useGeminiQuotaStore = create<GeminiQuotaState>()(
  persist(
    (set, get) => ({
      peticionesHoy: 0,
      fechaHoyStr: new Date().toISOString().split('T')[0],
      timestampsMinuto: [],

      registrarPeticion: () => {
        const ahora = Date.now();
        const hoyStr = new Date().toISOString().split('T')[0];

        let { peticionesHoy, fechaHoyStr, timestampsMinuto } = get();

        // 1. Resetear contador si cambió el día
        if (fechaHoyStr !== hoyStr) {
          peticionesHoy = 0;
          fechaHoyStr = hoyStr;
        }

        // 2. Filtrar peticiones del último minuto (60,000 ms)
        const ventanaMinuto = timestampsMinuto.filter((ts) => ahora - ts < 60000);
        ventanaMinuto.push(ahora);

        set({
          peticionesHoy: peticionesHoy + 1,
          fechaHoyStr: hoyStr,
          timestampsMinuto: ventanaMinuto,
        });
      },

      limpiarMinuto: () => {
        const ahora = Date.now();
        const { timestampsMinuto } = get();
        const ventanaMinuto = timestampsMinuto.filter((ts) => ahora - ts < 60000);
        set({ timestampsMinuto: ventanaMinuto });
      },

      resetearContadores: () => {
        set({
          peticionesHoy: 0,
          fechaHoyStr: new Date().toISOString().split('T')[0],
          timestampsMinuto: [],
        });
      },
    }),
    {
      name: 'flowpro-gemini-quota-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

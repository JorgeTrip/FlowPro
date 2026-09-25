// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import {
  guardarEnlacesUsuarioFirestore,
  obtenerEnlacesUsuarioFirestore,
} from '../services/servicioEnlacesFirebase';

/**
 * Hook para sincronizar automáticamente los enlaces de Google Drive
 * con la cuenta de usuario autenticado en Firestore (usuarios/{uid}).
 */
export function useSincronizacionEnlacesUsuario() {
  const user = useAuthStore((state) => state.user);
  const store = useGestionFormulasStore();
  const [cargandoEnlaces, setCargandoEnlaces] = useState(false);
  const [guardadoEnNube, setGuardadoEnNube] = useState(false);

  // Cargar enlaces al autenticarse o cambiar de usuario
  useEffect(() => {
    let cancelado = false;

    async function cargarDesdeFirestore() {
      if (!user?.uid) return;
      setCargandoEnlaces(true);

      try {
        const enlacesFs = await obtenerEnlacesUsuarioFirestore(user.uid);
        if (cancelado) return;

        if (enlacesFs) {
          // Si Firestore tiene enlaces guardados, sincronizar con el store local
          if (enlacesFs.formulas && enlacesFs.formulas !== store.urlGoogleDriveFormulas) {
            store.setUrlGoogleDriveFormulas(enlacesFs.formulas);
          }
          if (enlacesFs.stock && enlacesFs.stock !== store.urlGoogleDriveStock) {
            store.setUrlGoogleDriveStock(enlacesFs.stock);
          }
          if (enlacesFs.pedidosCompra && enlacesFs.pedidosCompra !== store.urlGoogleDrivePedidosCompra) {
            store.setUrlGoogleDrivePedidosCompra(enlacesFs.pedidosCompra);
          }
          setGuardadoEnNube(true);
        } else {
          // Si el usuario no tiene enlaces en Firestore pero sí en memoria local, respaldarlos
          const hayLocales =
            store.urlGoogleDriveFormulas ||
            store.urlGoogleDriveStock ||
            store.urlGoogleDrivePedidosCompra;

          if (hayLocales) {
            await guardarEnlacesUsuarioFirestore(user.uid, {
              formulas: store.urlGoogleDriveFormulas,
              stock: store.urlGoogleDriveStock,
              pedidosCompra: store.urlGoogleDrivePedidosCompra,
            });
            setGuardadoEnNube(true);
          }
        }
      } catch (err) {
        console.warn('[useSincronizacionEnlacesUsuario] Error al sincronizar:', err);
      } finally {
        if (!cancelado) setCargandoEnlaces(false);
      }
    }

    cargarDesdeFirestore();

    return () => {
      cancelado = true;
    };
  }, [user?.uid]);

  const guardarEnlace = useCallback(
    async (tipo: 'formulas' | 'stock' | 'pedidosCompra', url: string | null) => {
      if (tipo === 'formulas') store.setUrlGoogleDriveFormulas(url);
      if (tipo === 'stock') store.setUrlGoogleDriveStock(url);
      if (tipo === 'pedidosCompra') store.setUrlGoogleDrivePedidosCompra(url);

      if (user?.uid) {
        setGuardadoEnNube(false);
        try {
          await guardarEnlacesUsuarioFirestore(user.uid, {
            formulas: tipo === 'formulas' ? url : store.urlGoogleDriveFormulas,
            stock: tipo === 'stock' ? url : store.urlGoogleDriveStock,
            pedidosCompra: tipo === 'pedidosCompra' ? url : store.urlGoogleDrivePedidosCompra,
          });
          setGuardadoEnNube(true);
        } catch (err) {
          console.warn('[useSincronizacionEnlacesUsuario] Error al guardar enlace:', err);
        }
      }
    },
    [user?.uid, store]
  );

  const borrarEnlace = useCallback(
    async (tipo: 'formulas' | 'stock' | 'pedidosCompra') => {
      await guardarEnlace(tipo, null);
    },
    [guardarEnlace]
  );

  return {
    usuarioAutenticado: !!user?.uid,
    usuarioEmail: user?.email,
    cargandoEnlaces,
    guardadoEnNube,
    guardarEnlace,
    borrarEnlace,
  };
}

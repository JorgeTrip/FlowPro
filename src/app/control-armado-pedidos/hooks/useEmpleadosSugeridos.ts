// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useEffect, useState } from 'react';
import { useArmadoStore } from '../stores/armadoStore';
import { obtenerRegistrosVerificados } from '../services/firestoreService';

export function useEmpleadosSugeridos(): string[] {
  const { itemsPendientes } = useArmadoStore();
  const [empleados, setEmpleados] = useState<string[]>([]);

  useEffect(() => {
    let activo = true;

    async function cargarEmpleados() {
      try {
        const registrosFirestore = await obtenerRegistrosVerificados();
        const setNombres = new Set<string>();

        // 1. Extraer nombres de cabecera e impresos de Firestore
        registrosFirestore.forEach((doc) => {
          if (doc.empleadoHeader && doc.empleadoHeader !== 'Empleado Desconocido') {
            setNombres.add(doc.empleadoHeader.trim().toUpperCase());
          }
          doc.filas?.forEach((f) => {
            if (f.empleadoAsignado && f.empleadoAsignado !== 'Empleado Desconocido') {
              setNombres.add(f.empleadoAsignado.trim().toUpperCase());
            }
            if (f.nuevoEmpleado) {
              setNombres.add(f.nuevoEmpleado.trim().toUpperCase());
            }
          });
        });

        // 2. Extraer nombres de la cola de pendientes actual
        itemsPendientes.forEach((item) => {
          if (item.empleadoHeader && item.empleadoHeader !== 'Empleado Desconocido') {
            setNombres.add(item.empleadoHeader.trim().toUpperCase());
          }
          item.filas?.forEach((f) => {
            if (f.empleadoAsignado && f.empleadoAsignado !== 'Empleado Desconocido') {
              setNombres.add(f.empleadoAsignado.trim().toUpperCase());
            }
            if (f.nuevoEmpleado) {
              setNombres.add(f.nuevoEmpleado.trim().toUpperCase());
            }
          });
        });

        const listaOrdenada = Array.from(setNombres).sort((a, b) => a.localeCompare(b));
        if (activo) {
          setEmpleados(listaOrdenada);
        }
      } catch (err) {
        console.warn('Error al cargar lista de empleados sugeridos:', err);
      }
    }

    cargarEmpleados();

    return () => {
      activo = false;
    };
  }, [itemsPendientes]);

  return empleados;
}

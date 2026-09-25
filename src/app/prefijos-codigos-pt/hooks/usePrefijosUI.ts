// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useMemo, useEffect } from 'react';
import { usePrefijosStore } from '@/app/stores/prefijosStore';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';
import { auth } from '@/lib/firebase';
import {
  exportarPrefijosJSON,
  exportarPrefijosExcel,
  exportarPrefijosCSV,
} from '../services/exportadorPrefijos';
import { parsearArchivoReglasPrefijo } from '../services/importadorPrefijos';

export function usePrefijosUI() {
  const {
    reglas,
    cargandoNube,
    errorNube,
    iniciarSuscripcionNube,
    agregarRegla,
    eliminarRegla,
    modificarRegla,
    importarReglas,
    limpiarReglas,
  } = usePrefijosStore();

  const [montado, setMontado] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaPrefijo | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Inicia la suscripción reactiva a Firestore al montar la vista de manera segura
  useEffect(() => {
    setMontado(true);
    const emailUsuario = auth.currentUser?.email || undefined;
    const desuscribir = iniciarSuscripcionNube(emailUsuario);
    return () => {
      desuscribir();
    };
  }, [iniciarSuscripcionNube]);

  const mostrarMensaje = (tipo: 'exito' | 'error', texto: string) => {
    setMensajeNotificacion({ tipo, texto });
    setTimeout(() => setMensajeNotificacion(null), 4000);
  };

  const reglasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return reglas;
    const termino = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return reglas.filter((r) => {
      const prefijo = r.prefijo.toLowerCase();
      const linea = r.linea.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const desc = (r.descripcion || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return prefijo.includes(termino) || linea.includes(termino) || desc.includes(termino);
    });
  }, [reglas, busqueda]);

  const abrirModalCrear = () => { setReglaEnEdicion(null); setModalAbierto(true); };
  const abrirModalEditar = (regla: ReglaPrefijo) => { setReglaEnEdicion(regla); setModalAbierto(true); };
  const cerrarModal = () => { setReglaEnEdicion(null); setModalAbierto(false); };

  const guardarRegla = async (datos: Omit<ReglaPrefijo, 'id'>) => {
    setProcesando(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      if (reglaEnEdicion) {
        modificarRegla(reglaEnEdicion.id, datos);
        mostrarMensaje('exito', 'Se actualizó la regla de prefijo correctamente.');
      } else {
        const existe = reglas.some((r) => r.prefijo.toUpperCase() === datos.prefijo.trim().toUpperCase());
        if (existe) {
          mostrarMensaje('error', `El prefijo "${datos.prefijo}" ya está registrado.`);
          setProcesando(false);
          return;
        }
        agregarRegla(datos);
        mostrarMensaje('exito', 'Se agregó la nueva regla de prefijo correctamente.');
      }
      cerrarModal();
    } catch {
      mostrarMensaje('error', 'Ocurrió un error al guardar la regla.');
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminar = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta regla?')) return;
    setProcesando(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      eliminarRegla(id);
      mostrarMensaje('exito', 'Se eliminó la regla de prefijo con éxito.');
    } catch {
      mostrarMensaje('error', 'No se pudo eliminar la regla.');
    } finally {
      setProcesando(false);
    }
  };

  const exportarAJSON = () => {
    try {
      exportarPrefijosJSON(reglas);
      mostrarMensaje('exito', 'Configuración exportada a JSON correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar la configuración.');
    }
  };

  const exportarAExcel = async () => {
    try {
      await exportarPrefijosExcel(reglas);
      mostrarMensaje('exito', 'Configuración exportada a Excel correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar a Excel.');
    }
  };

  const exportarACSV = () => {
    try {
      exportarPrefijosCSV(reglas);
      mostrarMensaje('exito', 'Configuración exportada a CSV correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar a CSV.');
    }
  };

  const importarDesdeArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const contenido = await parsearArchivoReglasPrefijo(file);
      const resultado = importarReglas(contenido);
      if (resultado.exito) {
        mostrarMensaje('exito', resultado.mensaje);
      } else {
        mostrarMensaje('error', resultado.mensaje);
      }
    } catch (err: any) {
      mostrarMensaje('error', err?.message || 'Error al procesar el archivo.');
    } finally {
      setProcesando(false);
      e.target.value = '';
    }
  };

  const confirmarBorrarTodo = async () => {
    if (!window.confirm('¿Está seguro de que desea borrar TODAS las reglas de prefijos? Esta acción no se puede deshacer.')) return;
    setProcesando(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      limpiarReglas();
      mostrarMensaje('exito', 'Se borraron todas las reglas de prefijos correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al borrar las reglas.');
    } finally {
      setProcesando(false);
    }
  };

  return {
    montado,
    busqueda,
    setBusqueda,
    reglasFiltradas,
    cargandoNube,
    errorNube,
    modalAbierto,
    reglaEnEdicion,
    procesando,
    mensajeNotificacion,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarRegla,
    confirmarEliminar,
    confirmarBorrarTodo,
    exportarAJSON,
    exportarAExcel,
    exportarAHTMLCSV: exportarACSV,
    exportarACSV,
    importarDesdeArchivo,
  };
}

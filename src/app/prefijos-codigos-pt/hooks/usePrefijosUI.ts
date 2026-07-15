// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useMemo } from 'react';
import { usePrefijosStore } from '@/app/stores/prefijosStore';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';

export function usePrefijosUI() {
  const { reglas, agregarRegla, eliminarRegla, modificarRegla, importarReglas } = usePrefijosStore();
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaPrefijo | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

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

  const abrirModalCrear = () => {
    setReglaEnEdicion(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (regla: ReglaPrefijo) => {
    setReglaEnEdicion(regla);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setReglaEnEdicion(null);
    setModalAbierto(false);
  };

  const guardarRegla = async (datos: Omit<ReglaPrefijo, 'id'>) => {
    setProcesando(true);
    // Ilusión de progreso: retardo artificial de 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (reglaEnEdicion) {
        modificarRegla(reglaEnEdicion.id, datos);
        mostrarMensaje('exito', 'Se actualizó la regla de prefijo correctamente.');
      } else {
        // Verificar si el prefijo ya existe
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
      const blob = new Blob([JSON.stringify(reglas, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      mostrarMensaje('exito', 'Configuración exportada correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar la configuración.');
    }
  };

  const importarDesdeJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesando(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      // Ilusión de progreso: retardo de 1000ms
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const contenido = JSON.parse(event.target?.result as string);
        const resultado = importarReglas(contenido);
        if (resultado.exito) {
          mostrarMensaje('exito', resultado.mensaje);
        } else {
          mostrarMensaje('error', resultado.mensaje);
        }
      } catch {
        mostrarMensaje('error', 'El archivo no contiene un formato JSON válido.');
      } finally {
        setProcesando(false);
        // Limpiar el valor del input file para poder importar el mismo archivo de nuevo
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return {
    busqueda,
    setBusqueda,
    reglasFiltradas,
    modalAbierto,
    reglaEnEdicion,
    procesando,
    mensajeNotificacion,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarRegla,
    confirmarEliminar,
    exportarAJSON,
    importarDesdeJSON
  };
}

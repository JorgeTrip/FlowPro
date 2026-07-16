// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useMemo } from 'react';
import { usePrefijosStore } from '@/app/stores/prefijosStore';
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export function usePrefijosUI() {
  const { reglas, agregarRegla, eliminarRegla, modificarRegla, importarReglas, limpiarReglas } = usePrefijosStore();
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
      mostrarMensaje('exito', 'Configuración exportada a JSON correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar la configuración.');
    }
  };

  const exportarAExcel = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Prefijos');
      
      // Configurar columnas
      ws.columns = [
        { header: 'Prefijo', key: 'prefijo', width: 15 },
        { header: 'Línea', key: 'linea', width: 25 },
        { header: 'Sitio de Fabricación', key: 'sitioFabricacion', width: 25 },
        { header: 'Descripción', key: 'descripcion', width: 35 }
      ];

      // Formatear cabecera
      const headerRow = ws.getRow(1);
      headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' } // Azul oscuro corporativo
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar filas
      reglas.forEach((r) => {
        ws.addRow({
          prefijo: r.prefijo,
          linea: r.linea,
          sitioFabricacion: r.sitioFabricacion,
          descripcion: r.descripcion || ''
        });
      });

      // Alinear celdas
      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(3).alignment = { horizontal: 'center' };
        row.font = { name: 'Arial', size: 9 };
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.xlsx`);
      mostrarMensaje('exito', 'Configuración exportada a Excel correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar a Excel.');
    }
  };

  const exportarACSV = () => {
    try {
      const cabeceras = ['Prefijo', 'Línea', 'Sitio de Fabricación', 'Descripción'];
      const filas = reglas.map((r) => [
        `"${(r.prefijo || '').replace(/"/g, '""')}"`,
        `"${(r.linea || '').replace(/"/g, '""')}"`,
        `"${(r.sitioFabricacion || '').replace(/"/g, '""')}"`,
        `"${(r.descripcion || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = "\ufeff" + [cabeceras.join(','), ...filas.map((f) => f.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.csv`);
      mostrarMensaje('exito', 'Configuración exportada a CSV correctamente.');
    } catch {
      mostrarMensaje('error', 'Error al exportar a CSV.');
    }
  };

  const importarDesdeArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nombreArchivo = file.name.toLowerCase();
    setProcesando(true);
    // Ilusión de progreso: retardo de 1000ms
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      let contenido: any[] = [];

      if (nombreArchivo.endsWith('.json')) {
        const text = await file.text();
        contenido = JSON.parse(text);
      } else if (nombreArchivo.endsWith('.xlsx')) {
        const arrayBuffer = await file.arrayBuffer();
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(arrayBuffer);
        const ws = wb.worksheets[0];
        ws.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Saltarse cabecera
          const prefijo = row.getCell(1).value?.toString();
          const linea = row.getCell(2).value?.toString();
          const sitioFabricacion = row.getCell(3).value?.toString();
          const descripcion = row.getCell(4).value?.toString();
          if (prefijo && linea && sitioFabricacion) {
            contenido.push({
              prefijo: prefijo.trim(),
              linea: linea.trim(),
              sitioFabricacion: sitioFabricacion.trim().toUpperCase(),
              descripcion: descripcion ? descripcion.trim() : undefined
            });
          }
        });
      } else if (nombreArchivo.endsWith('.csv')) {
        const text = await file.text();
        const lineas = text.split(/\r?\n/);
        for (let i = 1; i < lineas.length; i++) {
          const lineaStr = lineas[i].trim();
          if (!lineaStr) continue;
          
          // Parsear respetando comillas
          const celdas: string[] = [];
          let dentroDeComillas = false;
          let celdaActual = '';
          for (let j = 0; j < lineaStr.length; j++) {
            const char = lineaStr[j];
            if (char === '"') {
              dentroDeComillas = !dentroDeComillas;
            } else if (char === ',' && !dentroDeComillas) {
              celdas.push(celdaActual.trim());
              celdaActual = '';
            } else {
              celdaActual += char;
            }
          }
          celdas.push(celdaActual.trim());

          const [prefijo, linea, sitioFabricacion, descripcion] = celdas;
          if (prefijo && linea && sitioFabricacion) {
            contenido.push({
              prefijo: prefijo.replace(/^"(.*)"$/, '$1').trim(),
              linea: linea.replace(/^"(.*)"$/, '$1').trim(),
              sitioFabricacion: sitioFabricacion.replace(/^"(.*)"$/, '$1').trim().toUpperCase(),
              descripcion: descripcion ? descripcion.replace(/^"(.*)"$/, '$1').trim() : undefined
            });
          }
        }
      } else {
        mostrarMensaje('error', 'Formato de archivo no soportado. Use .json, .csv o .xlsx');
        setProcesando(false);
        return;
      }

      const resultado = importarReglas(contenido);
      if (resultado.exito) {
        mostrarMensaje('exito', resultado.mensaje);
      } else {
        mostrarMensaje('error', resultado.mensaje);
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('error', 'Error al procesar el archivo.');
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
    confirmarBorrarTodo,
    exportarAJSON,
    exportarAExcel,
    exportarAHTMLCSV: exportarACSV, // alias para retrocompatibilidad
    exportarACSV,
    importarDesdeArchivo
  };
}

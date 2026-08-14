// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState } from 'react';
import { RegistroArmadoDocumento, FilaArmado } from '../types/armado';
import { guardarPlanillaVerificada } from '../services/firestoreService';
import { optimizarImagenBase64 } from '../utils/imageUtils';

interface UseSheetEditorProps {
  planilla: RegistroArmadoDocumento;
  onGuardadoExitoso: () => void;
}

export function useSheetEditor({ planilla, onGuardadoExitoso }: UseSheetEditorProps) {
  const [empleadoHeader, setEmpleadoHeader] = useState(planilla.empleadoHeader);
  const [filas, setFilas] = useState<FilaArmado[]>(planilla.filas || []);
  const [guardando, setGuardando] = useState(false);
  const [imagenBase64, setImagenBase64] = useState<string | null>(planilla.imagenBase64 || null);
  const [modoCambiarImagen, setModoCambiarImagen] = useState(false);

  const handleEnterBlur = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  const handleCambiarEmpleadoCabecera = (nuevoEmpleado: string) => {
    const empUpper = nuevoEmpleado.toUpperCase();
    setEmpleadoHeader(empUpper);
    setFilas((prev) =>
      prev.map((f) =>
        f.accionIrregularidad === 'asignar_nuevo' && f.nuevoEmpleado
          ? f
          : { ...f, empleadoAsignado: empUpper }
      )
    );
  };

  const handleActualizarFila = (id: string, updates: Partial<FilaArmado>) => {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleAgregarFila = () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const nueva: FilaArmado = {
      id: `fila-nueva-${Date.now()}`,
      fecha: filas[0]?.fecha || hoyStr,
      horaInicio: '08:00',
      horaFin: '09:00',
      cantArticulos: 0,
      notaIrregularidad: null,
      esIrregular: false,
      empleadoAsignado: empleadoHeader,
    };
    setFilas((prev) => [...prev, nueva]);
  };

  const handleEliminarFila = (id: string) => setFilas((prev) => prev.filter((f) => f.id !== id));

  const handleSubirNuevaImagen = async (file: File) => {
    try {
      const webp = await optimizarImagenBase64(file);
      setImagenBase64(webp);
      setModoCambiarImagen(false);
    } catch (e: any) {
      alert('Error al optimizar imagen: ' + e.message);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await guardarPlanillaVerificada({
        ...planilla,
        empleadoHeader,
        filas,
        imagenBase64: imagenBase64 || undefined,
        fechaPrimeraFila: filas[0]?.fecha || planilla.fechaPrimeraFila,
        horaInicioPrimeraFila: filas[0]?.horaInicio || planilla.horaInicioPrimeraFila,
      });
      onGuardadoExitoso();
    } catch (err: any) {
      alert(`Error al guardar cambios: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return {
    empleadoHeader,
    filas,
    guardando,
    imagenBase64,
    setImagenBase64,
    modoCambiarImagen,
    setModoCambiarImagen,
    handleEnterBlur,
    handleCambiarEmpleadoCabecera,
    handleActualizarFila,
    handleAgregarFila,
    handleEliminarFila,
    handleSubirNuevaImagen,
    handleGuardar,
  };
}

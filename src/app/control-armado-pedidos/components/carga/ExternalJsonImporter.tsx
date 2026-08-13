// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { FileJson, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { guardarPlanillaPendienteFirestore } from '../../services/firestoreService';

export function ExternalJsonImporter() {
  const [jsonText, setJsonText] = useState('');
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);

  const handleImportarJSON = async () => {
    setErrorParse(null);
    setExitoMensaje(null);

    if (!jsonText.trim()) {
      setErrorParse('Por favor, pega el contenido JSON antes de importar.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const planillas: any[] = Array.isArray(parsed) ? parsed : [parsed];
      if (planillas.length === 0) throw new Error('El JSON no contiene ningún registro de planilla válido.');

      const hoyStr = new Date().toISOString().split('T')[0];
      let cantCargadas = 0;

      for (let idxP = 0; idxP < planillas.length; idxP++) {
        const p = planillas[idxP];
        const empHeader = p.empleadoHeader || p.empleado || 'Empleado Externo';
        const filasRaw = Array.isArray(p.filas) ? p.filas : Array.isArray(p.registros) ? p.registros : [];

        const filasProcesadas: FilaArmado[] = filasRaw.map((f: any, idxF: number) => ({
          id: f.id || `ext-f-${idxP}-${idxF}-${Date.now()}`,
          fecha: f.fecha || hoyStr,
          horaInicio: f.horaInicio || '',
          horaFin: f.horaFin || '',
          cantArticulos: Number(f.cantArticulos) || 0,
          notaIrregularidad: f.notaIrregularidad || null,
          esIrregular: Boolean(f.esIrregular),
          empleadoAsignado: empHeader,
        }));

        const primeraFilaHora = filasProcesadas[0]?.horaInicio || '00:00';
        const primeraFilaFecha = filasProcesadas[0]?.fecha || hoyStr;

        const itemPendiente: RegistroArmadoDocumento = {
          id: `ext-${Date.now()}-${idxP}-${Math.random().toString(36).substring(2, 6)}`,
          empleadoHeader: empHeader,
          fechaPrimeraFila: primeraFilaFecha,
          horaInicioPrimeraFila: primeraFilaHora,
          estado: 'pendiente_verificacion',
          imagenBase64: '',
          nombreArchivoOriginal: `Importación Externa (JSON #${idxP + 1})`,
          creadoEn: new Date().toISOString(),
          filas: filasProcesadas,
        };

        const idReal = await guardarPlanillaPendienteFirestore(itemPendiente);
        if (!idReal) {
          useArmadoStore.getState().agregarItemPendiente(itemPendiente);
        }
        cantCargadas++;
      }

      setJsonText('');
      setExitoMensaje(`✨ Se cargaron exitosamente ${cantCargadas} planilla(s) externa(s) a la cola de verificación.`);
      setTimeout(() => setExitoMensaje(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorParse(err.message || 'El texto ingresado no es un formato JSON válido.');
    }
  };

  return (
    <div className="flex h-full min-h-[265px] flex-col justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-xl dark:border-purple-900/40 dark:bg-[#1C1C1E]">
      <div>
        <div className="flex items-center justify-between border-b border-purple-100 pb-3 dark:border-purple-900/40">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Importación Externa de JSON</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Pega estructuras exportadas de otras instancias</p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Pega aquí el código JSON (ej. [{"empleadoHeader": "Juan", "filas": [...]}, ...])'
            className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 font-mono text-xs text-gray-800 focus:border-purple-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
          />
        </div>

        {errorParse && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorParse}</span>
          </div>
        )}

        {exitoMensaje && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{exitoMensaje}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleImportarJSON}
        className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-purple-700 active:scale-[0.99] dark:bg-purple-600 dark:hover:bg-purple-500"
      >
        <Upload className="h-4 w-4" />
        <span>Importar a Cola de Verificación</span>
      </button>
    </div>
  );
}

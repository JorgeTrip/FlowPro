// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { RegistroArmadoDocumento, FilaArmado } from '../../types/armado';
import { guardarPlanillaPendienteFirestore } from '../../services/firestoreService';
import { procesarFechasPlanilla } from '../../utils/fechaUtils';
import { PROMPT_IA_EXTERNA } from '../../utils/promptsImportacion';
import { FileJson, Upload, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

/**
 * Componente que permite importar planillas a la cola de verificación a partir
 * de un código JSON estructurado emitido por un modelo de IA externo.
 * Incluye utilidad para copiar el prompt optimizado con un solo clic.
 */
export function ExternalJsonImporter() {
  const [jsonText, setJsonText] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);

  const handleCopiarPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_IA_EXTERNA);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Error al copiar el prompt al portapapeles:', err);
    }
  };

  const handleImportarJSON = async () => {
    setErrorParse(null);
    setExitoMensaje(null);

    if (!jsonText.trim()) {
      setErrorParse('Por favor, pega el contenido JSON antes de importar.');
      return;
    }

    try {
      // Se limpian posibles bloques de formato Markdown generados por la IA
      let textoLimpio = jsonText.trim();
      if (textoLimpio.startsWith('```')) {
        textoLimpio = textoLimpio.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      const parsed = JSON.parse(textoLimpio);
      let listaPlanillas: any[] = [];

      if (Array.isArray(parsed)) {
        listaPlanillas = parsed;
      } else if (Array.isArray(parsed.planillas)) {
        listaPlanillas = parsed.planillas;
      } else if (parsed.filas || parsed.registros) {
        listaPlanillas = [parsed];
      } else {
        throw new Error('El JSON no contiene una lista válida con "planillas" o "filas".');
      }

      if (listaPlanillas.length === 0) {
        throw new Error('El JSON no contiene ningún registro de planilla.');
      }

      const hoyStr = new Date().toISOString().split('T')[0];
      let cantCargadas = 0;

      for (let idxP = 0; idxP < listaPlanillas.length; idxP++) {
        const p = listaPlanillas[idxP];
        const empHeader = (p.empleadoHeader || p.empleado || 'Empleado Externo').toUpperCase();
        const filasRaw = Array.isArray(p.filas) ? p.filas : Array.isArray(p.registros) ? p.registros : [];

        const filasProcesadas: FilaArmado[] = procesarFechasPlanilla(filasRaw, hoyStr).map((f: any, idxF: number) => ({
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
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Pega estructuras generadas por IA externa</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleCopiarPrompt}
              className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-all shrink-0 ${
                copiado
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
              }`}
              title="Copiar prompt al portapapeles para usar en Gemini, ChatGPT o Claude"
            >
              {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiado ? '¡Copiado!' : 'Copiar Prompt IA'}</span>
            </button>

            <a
              href="https://gemini.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 p-1.5 text-purple-600 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400 transition-all"
              title="Abrir Gemini Web en una nueva pestaña"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-3">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Pega aquí el código JSON (ej. {"planillas": [...]})'
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

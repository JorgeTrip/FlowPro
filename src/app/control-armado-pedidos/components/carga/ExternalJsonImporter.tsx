// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useArmadoStore } from '../../stores/armadoStore';
import { FilaArmado, RegistroArmadoDocumento } from '../../types/armado';
import { procesarFechasPlanilla } from '../../utils/fechaUtils';
import { guardarPlanillaPendienteFirestore } from '../../services/firestoreService';
import { FileJson, Sparkles, Copy, ExternalLink, Check, AlertCircle } from 'lucide-react';

const PROMPT_IA_EXTERNA = `Sos un sistema OCR experto de alta precisión especializado en leer planillas de "CONTROL DE ARMADO DE PEDIDOS".
ESTRUCTURA GEOMÉTRICA DE LA PLANILLA EN PAPEL:
- El encabezado contiene "CONTROL DE ARMADO DE PEDIDOS" y el campo "EMPLEADO: [NOMBRE]".
- La grilla impresa puede contener una cantidad variable de filas de datos según el formato de cada planilla.

Analizá la(s) foto(s) de planilla(s) adjunta(s) recorriendo TODOS los renglones escritos. Si hay varias planillas en las fotos, sepáralas en una lista.

INSTRUCCIÓN DE FORMATO OBLIGATORIA:
Entregá la respuesta ÚNICAMENTE dentro de un bloque de código Markdown (\`\`\`json ... \`\`\`) listo para copiar con un solo clic mediante el botón de copiar código de tu interfaz. NO agregues saludos, introducciones ni explicaciones fuera del bloque de código.

Estructura JSON estricta:
{
  "planillas": [
    {
      "empleadoHeader": "Nombre de empleado en el encabezado superior (ej: GABRIEL), o null si falta",
      "filas": [
        {
          "fecha": "YYYY-MM-DD (ej: 2026-07-30) o null si la casilla de fecha en ese renglón está en blanco",
          "horaInicio": "HH:MM (formato 24h) o null si está en blanco",
          "horaFin": "HH:MM (formato 24h) o null si está en blanco",
          "cantArticulos": 283,
          "notaIrregularidad": "Texto manuscrito adicional (ej: FALTANTE, TERMINO SEBA) o null",
          "esIrregular": true/false
        }
      ]
    }
  ]
}`;

export function ExternalJsonImporter() {
  const { agregarItemPendiente } = useArmadoStore();
  const [jsonText, setJsonText] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);

  const handleCopiarYAbrirGemini = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_IA_EXTERNA);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);

      // Abrir Gemini Web en una nueva pestaña
      window.open('https://gemini.google.com/', '_blank');
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleProcesarJson = () => {
    setErrorParse(null);
    setExitoMensaje(null);

    if (!jsonText.trim()) {
      setErrorParse('Por favor pega el código JSON de la IA antes de procesar.');
      return;
    }

    try {
      // Limpiar posibles bloques de código markdown tipo ```json ... ```
      let cleanedText = jsonText.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanedText);
      let listaPlanillas: any[] = [];

      if (Array.isArray(parsed)) {
        listaPlanillas = parsed;
      } else if (Array.isArray(parsed.planillas)) {
        listaPlanillas = parsed.planillas;
      } else if (parsed.filas) {
        listaPlanillas = [parsed];
      } else {
        throw new Error('El JSON no contiene una estructura válida con "filas" o "planillas".');
      }

      const hoyStr = new Date().toISOString().split('T')[0];
      let cantCargadas = 0;

      listaPlanillas.forEach((p, idxP) => {
        const empHeader = (p.empleadoHeader && p.empleadoHeader !== 'null' ? p.empleadoHeader : 'Empleado Desconocido').toUpperCase();
        const filasRaw = (p.filas || []).map((f: any) => {
          const notaClean = f.notaIrregularidad && String(f.notaIrregularidad).trim() !== 'null' ? String(f.notaIrregularidad).trim() : null;
          const tieneNota = Boolean(notaClean && notaClean.length > 0 && !notaClean.toLowerCase().includes('marca de irregularidad'));
          const fechaClean = f.fecha && String(f.fecha).trim() !== 'null' ? String(f.fecha).trim() : null;

          return {
            fecha: fechaClean,
            horaInicio: f.horaInicio && String(f.horaInicio).trim() !== 'null' ? String(f.horaInicio).trim() : '',
            horaFin: f.horaFin && String(f.horaFin).trim() !== 'null' ? String(f.horaFin).trim() : '',
            cantArticulos: Number(f.cantArticulos) || 0,
            notaIrregularidad: notaClean ? notaClean.toUpperCase() : null,
            esIrregular: Boolean(f.esIrregular || tieneNota),
          };
        });

        const filasProcesadas: FilaArmado[] = procesarFechasPlanilla(filasRaw, hoyStr).map((f, idxF) => ({
          id: `fila-ext-${idxP}-${idxF}-${Date.now()}`,
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
          imagenBase64: '', // Sin imagen física por ser origen externo
          nombreArchivoOriginal: `Importación Externa (JSON #${idxP + 1})`,
          creadoEn: new Date().toISOString(),
          filas: filasProcesadas,
        };

        // Guardar asincrónicamente en Firestore para persistencia total al refrescar
        guardarPlanillaPendienteFirestore(itemPendiente).then((idReal) => {
          itemPendiente.id = idReal;
        });

        agregarItemPendiente(itemPendiente);

        cantCargadas++;
      });

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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Importación Externa
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Cargar JSON obtenido desde Gemini Web / ChatGPT
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopiarYAbrirGemini}
            className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-purple-700 transition-all shrink-0"
            title="Copiar prompt al portapapeles y abrir gemini.google.com"
          >
            {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiado ? '¡Copiado!' : 'Copiar Prompt y Abrir Gemini'}</span>
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Pegar código JSON emitido por Gemini Web / ChatGPT:
          </label>
          <textarea
            rows={4}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Pega aquí el JSON generado (ej: {"planillas": [...]})...'
            className="w-full rounded-xl border border-purple-200 bg-purple-50/30 p-2.5 font-mono text-xs text-gray-900 focus:outline-none dark:border-purple-900/60 dark:bg-purple-950/20 dark:text-gray-200"
          />
        </div>

        {errorParse && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorParse}</span>
          </div>
        )}

        {exitoMensaje && (
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{exitoMensaje}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleProcesarJson}
        className="mt-3 w-full rounded-xl border border-purple-600 bg-purple-50 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-500/60 dark:bg-purple-950/40 dark:text-purple-300 transition-all"
      >
        Procesar y Cargar Planillas (JSON)
      </button>
    </div>
  );
}

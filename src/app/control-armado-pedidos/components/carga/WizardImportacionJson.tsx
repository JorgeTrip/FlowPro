// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { PROMPT_IA_EXTERNA } from '../../utils/promptsImportacion';
import { useImportadorJsonExterno } from '../../hooks/useImportadorJsonExterno';
import { X, Copy, Check, ExternalLink, ChevronRight, ChevronLeft, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WizardImportacionJsonProps {
  isOpen: boolean;
  onClose: () => void;
  onExito?: () => void;
}

const PASOS = [
  { num: 1, titulo: 'Copiar Prompt', sub: 'Instrucción para la IA' },
  { num: 2, titulo: 'Abrir IA', sub: 'Pegar y subir fotos' },
  { num: 3, titulo: 'Copiar Código', sub: 'Copiar bloque JSON' },
  { num: 4, titulo: 'Pegar y Finalizar', sub: 'Cargar a la cola' },
];

export function WizardImportacionJson({ isOpen, onClose, onExito }: WizardImportacionJsonProps) {
  const [pasoActual, setPasoActual] = useState(1);
  const [copiado, setCopiado] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const { cargando, errorParse, exitoMensaje, importarTextoJson } = useImportadorJsonExterno();

  if (!isOpen) return null;

  const handleCopiarPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_IA_EXTERNA);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleFinalizar = async () => {
    const res = await importarTextoJson(jsonInput);
    if (res.exito) {
      setJsonInput('');
      onExito?.();
      setTimeout(() => {
        onClose();
        setPasoActual(1);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-purple-200 bg-white p-6 shadow-2xl dark:border-purple-900/40 dark:bg-[#1C1C1E]">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Asistente de Importación Externa</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Paso {pasoActual} de 4: {PASOS[pasoActual - 1].titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Pasos */}
        <div className="my-4 flex items-center justify-between gap-1 border-b border-gray-100 pb-3 dark:border-gray-800">
          {PASOS.map((p) => (
            <div key={p.num} className="flex flex-1 items-center space-x-2">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                pasoActual === p.num ? 'bg-purple-600 text-white shadow-md' : pasoActual > p.num ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
              }`}>
                {pasoActual > p.num ? <Check className="h-3.5 w-3.5" /> : p.num}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold ${pasoActual === p.num ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>{p.titulo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <div className="min-h-[210px] flex-1 overflow-y-auto py-2">
          {pasoActual === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Copia este prompt del sistema. Le indicará a la IA las columnas exactas de las planillas de armado y le exigirá responder únicamente con el formato JSON listo para copiar.
              </p>
              <button
                onClick={handleCopiarPrompt}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-purple-300 bg-purple-50 p-4 text-xs font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
              >
                {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copiado ? '¡Prompt Copiado al Portapapeles!' : 'Copiar Prompt Especializado'}</span>
              </button>
            </div>
          )}

          {pasoActual === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Abre la IA de tu preferencia. En el chat, <strong>pega el prompt</strong> que acabas de copiar y luego <strong>adjunta las fotos</strong> de las planillas:
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
                  <span>Gemini Web</span>
                  <ExternalLink className="h-3.5 w-3.5 text-purple-500" />
                </a>
                <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
                  <span>ChatGPT</span>
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                </a>
                <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold hover:border-purple-400 dark:border-gray-800 dark:bg-gray-900/50">
                  <span>Claude</span>
                  <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
                </a>
              </div>
            </div>
          )}

          {pasoActual === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Cuando la IA termine de analizar tus imágenes, mostrará una caja oscura de código con el rótulo <strong>json</strong>. Haz clic en el botón <strong>&quot;Copiar código&quot;</strong> que aparece en la esquina de la respuesta de la IA.
              </p>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300 font-mono">
                <div className="flex justify-between border-b border-gray-800 pb-1.5 text-[11px] text-gray-400">
                  <span>json</span>
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Copy className="h-3 w-3" />
                    <span>Copiar código (en la IA)</span>
                  </span>
                </div>
                <pre className="mt-2 text-[11px] text-emerald-400">{'{\n  "planillas": [\n    { "empleadoHeader": "GABRIEL", ... }\n  ]\n}'}</pre>
              </div>
            </div>
          )}

          {pasoActual === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">Pega aquí el código que copiaste de la IA:</p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Pega aquí el código JSON emitido por la IA...'
                className="h-28 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs focus:border-purple-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200"
              />
              {errorParse && <div className="flex items-center space-x-1.5 text-xs text-red-600"><AlertCircle className="h-4 w-4 shrink-0" /><span>{errorParse}</span></div>}
              {exitoMensaje && <div className="flex items-center space-x-1.5 text-xs text-emerald-600"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{exitoMensaje}</span></div>}
            </div>
          )}
        </div>

        {/* Botones de Navegación */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            onClick={() => setPasoActual((prev) => Math.max(1, prev - 1))}
            disabled={pasoActual === 1}
            className="flex items-center space-x-1 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          {pasoActual < 4 ? (
            <button
              onClick={() => setPasoActual((prev) => Math.min(4, prev + 1))}
              className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700"
            >
              <span>Siguiente Paso</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalizar}
              disabled={cargando || !jsonInput.trim()}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{cargando ? 'Importando...' : 'Importar y Finalizar'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

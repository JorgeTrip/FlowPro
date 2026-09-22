// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { PROMPT_IA_EXTERNA } from '../../utils/promptsImportacion';
import { useImportadorJsonExterno } from '../../hooks/useImportadorJsonExterno';
import { useProcesarLoteScan } from '../../hooks/useProcesarLoteScan';
import { WizardStepPanels } from './WizardStepPanels';
import { ModalFotosNoAsignadas } from './ModalFotosNoAsignadas';
import { X, ChevronRight, ChevronLeft, Upload, Sparkles } from 'lucide-react';

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
  const [archivosFotos, setArchivosFotos] = useState<File[]>([]);

  const {
    cargando,
    errorParse,
    exitoMensaje,
    archivosSobrantes,
    cantFotosAsignadas,
    modalSobrantesAbierto,
    setModalSobrantesAbierto,
    importarTextoJson,
  } = useImportadorJsonExterno();

  const { procesarArchivos } = useProcesarLoteScan();

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
    const res = await importarTextoJson(jsonInput, archivosFotos);
    if (res.exito) {
      setJsonInput('');
      setArchivosFotos([]);
      onExito?.();
      if (!res.sobrantes || res.sobrantes.length === 0) {
        setTimeout(() => {
          onClose();
          setPasoActual(1);
        }, 1500);
      }
    }
  };

  const handleCerrarModalSobrantes = () => {
    setModalSobrantesAbierto(false);
    onClose();
    setPasoActual(1);
  };

  const handleEscanearSobrantes = (sobrantes: File[]) => {
    procesarArchivos(sobrantes);
    handleCerrarModalSobrantes();
  };

  return (
    <>
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
                  {pasoActual > p.num ? '✓' : p.num}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-semibold ${pasoActual === p.num ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>{p.titulo}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contenido Dinámico */}
          <div className="min-h-[210px] flex-1 overflow-y-auto py-2">
            <WizardStepPanels
              pasoActual={pasoActual}
              copiado={copiado}
              onCopiarPrompt={handleCopiarPrompt}
              jsonInput={jsonInput}
              onJsonInputChange={setJsonInput}
              archivosFotos={archivosFotos}
              onArchivosFotosChange={setArchivosFotos}
              errorParse={errorParse}
              exitoMensaje={exitoMensaje}
            />
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

      <ModalFotosNoAsignadas
        isOpen={modalSobrantesAbierto}
        onClose={handleCerrarModalSobrantes}
        cantAsignadas={cantFotosAsignadas}
        archivosSobrantes={archivosSobrantes}
        onEscanearSobrantes={handleEscanearSobrantes}
      />
    </>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import { useImportadorJsonExterno } from '../../hooks/useImportadorJsonExterno';
import { useProcesarLoteScan } from '../../hooks/useProcesarLoteScan';
import { HeaderImportadorJson } from './HeaderImportadorJson';
import { WizardImportacionJson } from './WizardImportacionJson';
import { MiniDropzoneImagenesJson } from './MiniDropzoneImagenesJson';
import { ModalFotosNoAsignadas } from './ModalFotosNoAsignadas';
import { PROMPT_IA_EXTERNA } from '../../utils/promptsImportacion';
import { Upload, CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';

/**
 * Componente que permite importar planillas a la cola de verificación a partir
 * de un código JSON estructurado emitido por un modelo de IA externo y asociar
 * automáticamente las imágenes coincidentes por nombre de archivo.
 */
export function ExternalJsonImporter() {
  const [jsonText, setJsonText] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [wizardAbierto, setWizardAbierto] = useState(false);
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
    asignarFotosAPlanillasPendientes,
  } = useImportadorJsonExterno();

  const { procesarArchivos } = useProcesarLoteScan();

  const handleCopiarPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_IA_EXTERNA);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (err) {
      console.error('Error al copiar el prompt al portapapeles:', err);
    }
  };

  const handleEjecutarAccion = async () => {
    if (jsonText.trim()) {
      const res = await importarTextoJson(jsonText, archivosFotos);
      if (res.exito) {
        setJsonText('');
        setArchivosFotos([]);
      }
    } else if (archivosFotos.length > 0) {
      const res = await asignarFotosAPlanillasPendientes(archivosFotos);
      if (res.exito) {
        setArchivosFotos([]);
      }
    }
  };

  const handleEscanearSobrantes = (sobrantes: File[]) => {
    procesarArchivos(sobrantes);
    setModalSobrantesAbierto(false);
  };

  const botonDeshabilitado = cargando || (!jsonText.trim() && archivosFotos.length === 0);
  const textoBoton = cargando
    ? 'Procesando...'
    : jsonText.trim()
    ? archivosFotos.length > 0
      ? `Importar JSON y asociar ${archivosFotos.length} fotos`
      : 'Importar a Cola de Verificación'
    : `Asignar ${archivosFotos.length} fotos a pendientes sin imagen`;

  return (
    <div className="flex h-full min-h-[265px] flex-col justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-xl dark:border-purple-900/40 dark:bg-[#1C1C1E]">
      <WizardImportacionJson
        isOpen={wizardAbierto}
        onClose={() => setWizardAbierto(false)}
      />

      <ModalFotosNoAsignadas
        isOpen={modalSobrantesAbierto}
        onClose={() => setModalSobrantesAbierto(false)}
        cantAsignadas={cantFotosAsignadas}
        archivosSobrantes={archivosSobrantes}
        onEscanearSobrantes={handleEscanearSobrantes}
      />

      <div>
        <HeaderImportadorJson
          copiado={copiado}
          onCopiarPrompt={handleCopiarPrompt}
        />

        {/* Botón Destacado: Wizard Paso a Paso */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setWizardAbierto(true)}
            className="group flex w-full items-center justify-between rounded-xl border border-purple-300 bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-indigo-600/10 p-2.5 text-xs font-bold text-purple-700 transition-all hover:border-purple-400 hover:from-purple-600/20 hover:to-indigo-600/20 dark:border-purple-800 dark:text-purple-300"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-purple-600 p-1 text-white shadow-sm transition-transform group-hover:scale-110">
                <Wand2 className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <span className="block font-bold">¿Cómo digitalizar con IA externa?</span>
                <span className="text-[10px] font-normal text-purple-600/80 dark:text-purple-400/80">
                  Abrir asistente interactivo paso a paso
                </span>
              </div>
            </div>
            <span className="rounded-lg bg-purple-600/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              Guía Paso a Paso ➔
            </span>
          </button>
        </div>

        {/* Campo de Pegado Rápido */}
        <div className="mt-3">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Pega aquí el código JSON directamente (ej. {"planillas": [...]})'
            className="h-20 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 font-mono text-xs text-gray-800 focus:border-purple-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
          />
        </div>

        {/* Mini Dropzone para Imágenes */}
        <div className="mt-2.5">
          <MiniDropzoneImagenesJson
            archivos={archivosFotos}
            onArchivosChange={setArchivosFotos}
            compacto
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

      {/* Botón de Ejecución Directa */}
      <button
        onClick={handleEjecutarAccion}
        disabled={botonDeshabilitado}
        className="mt-3 flex w-full items-center justify-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-500"
      >
        <Upload className="h-4 w-4" />
        <span>{textoBoton}</span>
      </button>
    </div>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Upload, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  descargarBackupCompleto,
  restaurarBackupCompleto,
} from '@/features/usuarios/services/servicioBackupSoberania';

interface ModalSoberaniaDatosProps {
  abierto: boolean;
  onCerrar: () => void;
  emailUsuario: string;
}

export function ModalSoberaniaDatos({ abierto, onCerrar, emailUsuario }: ModalSoberaniaDatosProps) {
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  if (!abierto) return null;

  const handleExportar = async () => {
    setProcesando(true);
    try {
      await descargarBackupCompleto(emailUsuario);
      setMensaje({ tipo: 'exito', texto: 'Copia de seguridad descargada exitosamente en JSON.' });
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: `Error al exportar: ${e?.message || 'Error desconocido'}` });
    } finally {
      setProcesando(false);
    }
  };

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = async (evento) => {
      setProcesando(true);
      try {
        const contenido = JSON.parse(evento.target?.result as string);
        const res = await restaurarBackupCompleto(contenido);
        if (res.exito) {
          setMensaje({ tipo: 'exito', texto: res.mensaje });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMensaje({ tipo: 'error', texto: res.mensaje });
        }
      } catch {
        setMensaje({ tipo: 'error', texto: 'El archivo seleccionado no es un archivo JSON válido.' });
      } finally {
        setProcesando(false);
      }
    };
    lector.readAsText(archivo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Soberanía de Datos</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exporta e importa tus datos en formato JSON</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mensaje && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              mensaje.tipo === 'exito'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {mensaje.tipo === 'exito' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{mensaje.texto}</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleExportar}
            disabled={procesando}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Descargar Copia de Seguridad (JSON)</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Exportar</span>
          </button>

          <input
            type="file"
            ref={inputArchivoRef}
            onChange={handleSeleccionarArchivo}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputArchivoRef.current?.click()}
            disabled={procesando}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Restaurar Copia desde Archivo JSON</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Importar</span>
          </button>
        </div>

        <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

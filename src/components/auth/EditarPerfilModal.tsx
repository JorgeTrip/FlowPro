// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { actualizarPerfilUsuario, cambiarPasswordUsuario } from '@/services/authService';
import { X, User, Lock, CheckCircle, Loader2, Camera } from 'lucide-react';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARES_PREDETERMINADOS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
];

export function EditarPerfilModal({ isOpen, onClose }: EditarPerfilModalProps) {
  const { user, actualizarDatosUsuario } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mostrarPasswordInput, setMostrarPasswordInput] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(null);
    setErrorLocal(null);

    try {
      if (!displayName.trim()) {
        throw new Error('El nombre de usuario no puede estar vacío.');
      }

      await actualizarPerfilUsuario(displayName, photoURL);

      if (mostrarPasswordInput && nuevaPassword.trim()) {
        if (nuevaPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        await cambiarPasswordUsuario(nuevaPassword);
      }

      actualizarDatosUsuario({
        displayName: displayName.trim(),
        photoURL: photoURL ? photoURL.trim() : null,
      });

      setMensajeExito('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        setMensajeExito(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorLocal(err.message || 'Error al guardar los datos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#1C1C1E]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-500" />
            <span>Editar Mi Perfil</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleGuardar} className="mt-4 space-y-4">
          {mensajeExito && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {errorLocal && (
            <div className="rounded-xl bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              {errorLocal}
            </div>
          )}

          {/* Vista previa de Avatar y Selección */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              {photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photoURL} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-blue-500 shadow-md" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md">
                  {displayName.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Avatares predeterminados:</span>
            <div className="flex space-x-2">
              {AVATARES_PREDETERMINADOS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhotoURL(url)}
                  className={`h-8 w-8 rounded-full overflow-hidden border-2 transition-all ${
                    photoURL === url ? 'border-blue-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre Visible</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <Camera className="h-3.5 w-3.5 text-gray-400" />
              <span>URL de Foto Personalizada (Opcional)</span>
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://ejemplo.com/mi-foto.jpg"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setMostrarPasswordInput(!mostrarPasswordInput)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{mostrarPasswordInput ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}</span>
            </button>

            {mostrarPasswordInput && (
              <div className="mt-3">
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Guardar Cambios</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

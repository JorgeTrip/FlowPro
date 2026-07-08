// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

interface SelectorMapeoProps {
  /** Nombre visible del campo del sistema */
  label: string;
  /** Listado de columnas detectadas en la planilla de Excel */
  columnas: string[];
  /** Columna actualmente seleccionada */
  value: string;
  /** Callback al cambiar la selección */
  onChange: (columna: string) => void;
  /** Determina si el campo es de asignación obligatoria */
  requerido?: boolean;
  /** Deshabilita el selector */
  disabled?: boolean;
}

/** Icono de confirmación verde para cuando el mapeo está completo */
const IconoCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="ml-2 h-5 w-5 flex-shrink-0 text-green-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Componente presentacional puro para la asignación de columnas.
 * Proporciona un selector dropdown y un indicador gráfico del estado de completado.
 */
export default function SelectorMapeo({
  label,
  columnas,
  value,
  onChange,
  requerido = false,
  disabled = false,
}: SelectorMapeoProps) {
  return (
    <div className="w-full">
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>{label}</span>
        {requerido && <span className="ml-1 text-red-500 font-bold">*</span>}
        {value && <IconoCheck />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-600 ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
            : 'bg-white text-gray-900 hover:shadow dark:bg-gray-700 dark:text-white'
        }`}
      >
        <option value="">
          {disabled ? 'No aplicable' : requerido ? 'Seleccionar columna obligatoria...' : 'Seleccionar columna (opcional)...'}
        </option>
        {columnas.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  );
}

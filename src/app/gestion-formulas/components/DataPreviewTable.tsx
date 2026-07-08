// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

interface DataPreviewTableProps {
  /** Datos crudos de la planilla de Excel */
  previewData: any[];
  /** Nombres de las columnas detectadas */
  columns: string[];
  /** Título descriptivo de la tabla */
  title: string;
  /** Columnas que ya han sido mapeadas (se destacan visualmente en verde) */
  columnasMapeadas?: string[];
}

/**
 * Componente presentacional para mostrar una previsualización compacta (máximo 5 filas)
 * de la planilla Excel importada por el usuario. Permite dar feedback instantáneo del mapeo.
 */
export default function DataPreviewTable({
  previewData,
  columns,
  title,
  columnasMapeadas = [],
}: DataPreviewTableProps) {
  if (!previewData || previewData.length === 0) return null;

  // Filtrar columnas vacías o no válidas
  const columnasVisibles = columns.filter(Boolean);

  return (
    <div className="my-6">
      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title} (Primeras 5 filas)
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
          <thead className="bg-gray-100 dark:bg-[#2C2C2E]">
            <tr>
              {columnasVisibles.map((cabecera, idx) => {
                const estaMapeada = columnasMapeadas.includes(cabecera);
                return (
                  <th
                    key={idx}
                    scope="col"
                    className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                      estaMapeada
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {cabecera}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#1C1C1E]">
            {previewData.map((fila, filaIdx) => (
              <tr
                key={filaIdx}
                className="hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 transition-colors"
              >
                {columnasVisibles.map((cabecera, colIdx) => {
                  const estaMapeada = columnasMapeadas.includes(cabecera);
                  const valor = fila[cabecera];
                  return (
                    <td
                      key={colIdx}
                      className={`px-4 py-2 whitespace-nowrap text-sm transition-colors ${
                        estaMapeada
                          ? 'bg-green-50/50 text-green-900 dark:bg-green-900/10 dark:text-green-200'
                          : 'text-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {valor !== undefined && valor !== null ? String(valor) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { procesarHojaEspecifica } from './excelReaderCore';

function normalizarSitioFabricacion(sitioStr: string): string {
  const norm = sitioStr.trim().toUpperCase();
  if (['E.R.', 'ENTRE RIOS', 'ENTRE RÍOS', 'ER'].includes(norm)) {
    return 'ENTRE RIOS';
  }
  if (['CABA + E.R.', 'CABA + ER', 'CABA + ENTRE RIOS'].includes(norm)) {
    return 'CABA + ENTRE RIOS';
  }
  if (['TERC. E.R.', 'TERC. ER', 'TERC. ENTRE RIOS', 'TERCERIZADOS ENTRE RIOS'].includes(norm)) {
    return 'TERC. ENTRE RIOS';
  }
  if (['TERC. CABA', 'TERCERIZADOS CABA'].includes(norm)) {
    return 'TERC. CABA';
  }
  return norm;
}

export async function importarPrefijosDesdeHoja(file: File, hojaNombre: string): Promise<void> {
  try {
    const { usePrefijosStore } = await import('@/app/stores/prefijosStore');
    const { data, columns } = await procesarHojaEspecifica(file, hojaNombre);
    const importadas: any[] = [];
    const keys = columns || [];

    const cabeceraEsReglaValida = (k: string[]) => {
      if (k.length < 3) return false;
      const sitio = k[2].trim().toUpperCase();
      return [
        'CABA', 'ENTRE RIOS', 'E.R.', 'ER', 'CABA + ENTRE RIOS',
        'CABA + E.R.', 'TERC. CABA', 'TERC. ENTRE RIOS', 'TERC. E.R.',
      ].includes(sitio);
    };

    if (cabeceraEsReglaValida(keys)) {
      importadas.push({
        prefijo: keys[0].trim(),
        linea: keys[1].trim(),
        sitioFabricacion: normalizarSitioFabricacion(keys[2]),
        descripcion: keys[3] ? keys[3].trim() : undefined,
      });
    }

    data.forEach((row: any) => {
      const rowKeys = Object.keys(row);
      const findVal = (keywords: string[]) => {
        const key = rowKeys.find((k) => {
          const kNorm = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return keywords.some((kw) => {
            const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return kNorm.includes(kwNorm);
          });
        });
        return key ? row[key] : null;
      };

      const prefijo = findVal(['prefijo']) || row[rowKeys[0]];
      const linea = findVal(['linea']) || row[rowKeys[1]];
      const sitioRaw = findVal(['sitio', 'fabricacion', 'planta']) || row[rowKeys[2]];
      const descripcion = findVal(['descripcion', 'detalle']) || (rowKeys[3] ? row[rowKeys[3]] : undefined);

      if (prefijo && linea && sitioRaw) {
        importadas.push({
          prefijo: String(prefijo).trim(),
          linea: String(linea).trim(),
          sitioFabricacion: normalizarSitioFabricacion(String(sitioRaw)),
          descripcion: descripcion ? String(descripcion).trim() : undefined,
        });
      }
    });

    const res = usePrefijosStore.getState().importarReglas(importadas);
    console.log(`[importarPrefijosDesdeHoja] Se procesaron ${importadas.length} reglas. Resultado store:`, res);
  } catch (err) {
    console.error('Error al importar prefijos desde hoja de excel:', err);
  }
}

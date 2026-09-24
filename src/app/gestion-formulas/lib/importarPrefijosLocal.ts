// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { usePrefijosStore } from '@/app/stores/prefijosStore';

function normalizarSitio(sitioRaw?: string): 'CABA' | 'ENTRE RIOS' | 'CABA + ENTRE RIOS' | 'TERC. CABA' | 'TERC. ENTRE RIOS' | 'TERC. CON PROV. MP' {
  const s = String(sitioRaw || '').trim().toUpperCase();
  if (['E.R.', 'ENTRE RIOS', 'ENTRE RÍOS', 'ER'].includes(s)) return 'ENTRE RIOS';
  if (['CABA + E.R.', 'CABA + ER', 'CABA + ENTRE RIOS'].includes(s)) return 'CABA + ENTRE RIOS';
  if (['TERC. E.R.', 'TERC. ER', 'TERC. ENTRE RIOS', 'TERCERIZADOS ENTRE RIOS'].includes(s)) return 'TERC. ENTRE RIOS';
  if (['TERC. CABA', 'TERCERIZADOS CABA'].includes(s)) return 'TERC. CABA';
  return 'CABA';
}

export async function procesarArchivoPrefijos(file: File): Promise<{ exito: boolean; mensaje?: string }> {
  const nombreArchivo = file.name.toLowerCase();
  let contenido: any[] = [];

  if (nombreArchivo.endsWith('.json')) {
    const text = await file.text();
    contenido = JSON.parse(text);
  } else if (nombreArchivo.endsWith('.xlsx')) {
    const { leerHojasExcel, procesarHojaEspecifica } = await import('./lectorExcel');
    const hojas = await leerHojasExcel(file);
    const solapaPrefijos = hojas.find((h: string) =>
      ['prefijo de codigos - lineas pt', 'prefijo de codigos', 'lineas pt', 'prefijos'].some((k) =>
        h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(k)
      )
    ) || hojas[0];

    if (solapaPrefijos) {
      const { data, columns } = await procesarHojaEspecifica(file, solapaPrefijos);
      const keys = columns || [];

      if (keys.length >= 3) {
        contenido.push({
          prefijo: keys[0].trim(),
          linea: keys[1].trim(),
          sitioFabricacion: normalizarSitio(keys[2]),
          descripcion: keys[3] ? keys[3].trim() : undefined,
        });
      }

      data.forEach((row: any) => {
        const rowKeys = Object.keys(row);
        const findVal = (keywords: string[]) => {
          const key = rowKeys.find((k) => {
            const kNorm = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return keywords.some((kw) => kNorm.includes(kw));
          });
          return key ? row[key] : null;
        };

        const prefijo = findVal(['prefijo']) || row[rowKeys[0]];
        const linea = findVal(['linea']) || row[rowKeys[1]];
        const sitioFabricacion = findVal(['sitio', 'fabricacion', 'planta']) || row[rowKeys[2]];
        const descripcion = findVal(['descripcion', 'detalle']) || (rowKeys[3] ? row[rowKeys[3]] : undefined);

        if (prefijo && linea) {
          contenido.push({
            prefijo: String(prefijo).trim(),
            linea: String(linea).trim(),
            sitioFabricacion: normalizarSitio(sitioFabricacion),
            descripcion: descripcion ? String(descripcion).trim() : undefined,
          });
        }
      });
    }
  } else if (nombreArchivo.endsWith('.csv')) {
    const text = await file.text();
    const lineas = text.split(/\r?\n/);
    for (let i = 1; i < lineas.length; i++) {
      const lineaStr = lineas[i].trim();
      if (!lineaStr) continue;

      const celdas = lineaStr.split(',').map((c) => c.replace(/^"(.*)"$/, '$1').trim());
      const [prefijo, linea, sitio, desc] = celdas;
      if (prefijo && linea) {
        contenido.push({
          prefijo,
          linea,
          sitioFabricacion: normalizarSitio(sitio),
          descripcion: desc,
        });
      }
    }
  } else {
    return { exito: false, mensaje: 'Formato no soportado para prefijos. Use .json, .csv o .xlsx' };
  }

  return usePrefijosStore.getState().importarReglas(contenido);
}

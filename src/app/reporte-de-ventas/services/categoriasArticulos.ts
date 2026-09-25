export const CATEGORIAS_ARTICULOS: Record<string, string> = {
  '13': 'ACEITE DE OLIVA',
  '01': 'ACEITE ESENCIAL',
  '22': 'ACEITE OLIVA/ACETO',
  '03': 'AZUCAR',
  '21': 'BLEND',
  '04': 'CARAMELOS',
  '05': 'COSMETICA',
  '06': 'EDULCORANTE',
  '24': 'GIN TONIC',
  '07': 'HIERBAS FRACCIONADA',
  '08': 'INFUSIONES',
  '09': 'JALEA - PROPOLEO',
  '10': 'LEVADURA',
  '20': 'LINEA MUJERES',
  '11': 'MERMELADA',
  '12': 'MIEL',
  '16': 'S. FRASCO',
  '14': 'SAHUMERIO',
  '15': 'SALSA DE SOJA',
  '17': 'TINTURA MADRE',
  '02': 'TM ANDINO',
  '18': 'VARIOS',
  '19': 'YERBA MATE',
};

export function obtenerCategoria(codigoArticulo: string): string {
  if (!codigoArticulo) return 'OTROS';
  const match = codigoArticulo.match(/^(\d{2})/i);
  if (match && match[1]) {
    return CATEGORIAS_ARTICULOS[match[1]] || 'OTROS';
  }
  const prefijo = codigoArticulo.substring(0, 2);
  return CATEGORIAS_ARTICULOS[prefijo] || 'OTROS';
}

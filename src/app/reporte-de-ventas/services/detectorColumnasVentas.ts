export interface MapeoVentas {
  Periodo: string;
  Fecha: string;
  TipoComprobante: string;
  NroComprobante: string;
  ReferenciaVendedor: string;
  RazonSocial: string;
  Cliente: string;
  Direccion: string;
  Articulo: string;
  Descripcion: string;
  Cantidad: string;
  PrecioUnitario: string;
  Total: string;
  TotalCIVA: string;
  DirectoIndirecto: string;
  DescRubro: string;
  DescripcionZona: string;
}

export function detectarMapeoAutomaticoVentas(ventasColumnas: string[]): MapeoVentas {
  const automaticMapping: MapeoVentas = {
    Periodo: '',
    Fecha: '',
    TipoComprobante: '',
    NroComprobante: '',
    ReferenciaVendedor: '',
    Articulo: '',
    Descripcion: '',
    Cantidad: '',
    Cliente: '',
    RazonSocial: '',
    TotalCIVA: '',
    DescripcionZona: '',
    DescRubro: '',
    Direccion: '',
    PrecioUnitario: '',
    Total: '',
    DirectoIndirecto: '',
  };

  const usedColumns = new Set<string>();

  const fieldMappings = [
    { field: 'Fecha', keywords: ['fecha'] },
    { field: 'Articulo', keywords: ['articulo', 'artículo', 'cod', 'cód', 'sku'] },
    { field: 'Descripcion', keywords: ['descripcion', 'descripción'] },
    { field: 'Cantidad', keywords: ['cantidad', 'cant'] },
    { field: 'Cliente', keywords: ['razon social', 'razón social', 'razon', 'razón', 'cliente'] },
    { field: 'ReferenciaVendedor', keywords: ['vendedor', 'referencia'] },
    { field: 'DescripcionZona', keywords: ['descripcion zona', 'descripción zona', 'zona'] },
    { field: 'DescRubro', keywords: ['desc rubro', 'descripcion rubro', 'descripción rubro', 'rubro'] },
    { field: 'Periodo', keywords: ['periodo', 'período'] },
    { field: 'TipoComprobante', keywords: ['tipo', 'comprobante'] },
    { field: 'NroComprobante', keywords: ['numero', 'nro'] },
    { field: 'RazonSocial', keywords: ['razon social', 'razón social'] },
    { field: 'Direccion', keywords: ['direccion', 'dirección'] },
    { field: 'PrecioUnitario', keywords: ['precio unitario', 'unitario'] },
    { field: 'Total', keywords: ['total'] },
    { field: 'TotalCIVA', keywords: ['total c/iva', 'total con iva', 'total coniva'] },
    { field: 'DirectoIndirecto', keywords: ['directo', 'indirecto'] },
  ];

  const matches: Array<{ field: string; column: string; specificity: number }> = [];

  fieldMappings.forEach(({ field, keywords }) => {
    keywords.forEach((keyword, keywordIndex) => {
      ventasColumnas.forEach((column) => {
        const columnLower = column.toLowerCase();
        const keywordLower = keyword.toLowerCase();

        if (columnLower.includes(keywordLower)) {
          let specificity = 0;
          if (columnLower === keywordLower) {
            specificity = 1000;
          } else if (
            columnLower.split(' ').includes(keywordLower) ||
            keywordLower.split(' ').every((word) => columnLower.includes(word))
          ) {
            specificity = 500 + keyword.split(' ').length * 10;
          } else {
            specificity = 100;
          }

          specificity -= keywordIndex;

          if (field === 'ReferenciaVendedor') {
            const isExactVendedor = columnLower.trim() === 'vendedor';
            const seemsName = columnLower.includes('nombre');
            const seemsCode = /\b(cod|cód|codigo|código|id|nro)\b/.test(columnLower);

            if (isExactVendedor) specificity += 600;
            if (seemsName) specificity += 350;
            if (seemsCode) specificity -= 500;
          }

          matches.push({ field, column, specificity });
        }
      });
    });
  });

  matches.sort((a, b) => b.specificity - a.specificity);

  const assignedFields = new Set<string>();
  matches.forEach((match) => {
    if (!usedColumns.has(match.column) && !assignedFields.has(match.field)) {
      if (!automaticMapping[match.field as keyof MapeoVentas]) {
        (automaticMapping as unknown as Record<string, string>)[match.field] = match.column;
        usedColumns.add(match.column);
        assignedFields.add(match.field);
      }
    }
  });

  return automaticMapping;
}

export function detectarMapeoAutomaticoNomina(nominaColumnas: string[]) {
  const autoNominaMapeo = { RazonSocial: '', Vendedor: '' };

  const razonSocialMatch = nominaColumnas.find(
    (col) =>
      col.toLowerCase().includes('razón social') ||
      col.toLowerCase().includes('razon social') ||
      col.toLowerCase() === 'razón social'
  );
  if (razonSocialMatch) autoNominaMapeo.RazonSocial = razonSocialMatch;

  const vendedorMatch = nominaColumnas.find((col) => col.toLowerCase() === 'vendedor');
  if (vendedorMatch) autoNominaMapeo.Vendedor = vendedorMatch;

  return autoNominaMapeo;
}

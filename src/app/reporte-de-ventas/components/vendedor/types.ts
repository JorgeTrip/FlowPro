export interface VendedorData {
  name: string;
  value?: number;
  importe?: number;
  cantidad?: number;
  porcentaje?: string;
  total?: number;
  [key: string]: string | number | undefined;
}

export interface FilaVendedorAcumulado {
  vendedor: string;
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  total: number;
  totalCantidad: number;
}

export interface MesDato {
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  totalImporte: number;
  totalCantidad: number;
}

export interface FilaVendedorComparativo {
  vendedor: string;
  totalGlobalImporte: number;
  totalGlobalCantidad: number;
  meses: Record<string, MesDato>;
}

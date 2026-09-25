export interface DatoRubroAcumulado {
  name: string;
  value: number;
}

export type DatoRubroComparativo = Record<string, number | string> & {
  name: string;
  total: number;
};

export interface FilaTablaRubroAcumulado {
  rubro: string;
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  total: number;
  totalCantidad: number;
}

export interface FilaTablaRubroComparativo {
  rubro: string;
  meses: Record<string, {
    importe: number;
    cantidad: number;
    varImporte: number;
    varCantidad: number;
  }>;
  totalImporte: number;
  totalCantidad: number;
}

export interface DatoZonaAcumulado {
  name: string;
  value: number;
}

export type DatoZonaComparativo = Record<string, number | string> & {
  name: string;
  total: number;
};

export interface FilaTablaZonaAcumulado {
  zona: string;
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  total: number;
  totalCantidad: number;
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export type SitioFabricacion =
  | 'CABA'
  | 'ENTRE RIOS'
  | 'CABA + ENTRE RIOS'
  | 'TERC. CABA'
  | 'TERC. ENTRE RIOS'
  | 'TERC. CON PROV. MP';

export interface ReglaPrefijo {
  id: string;
  prefijo: string;
  linea: string;
  sitioFabricacion: SitioFabricacion;
  descripcion?: string;
}

export interface ReglaPrefijoDocumento {
  id: string;
  prefijo: string;
  linea: string;
  sitioFabricacion: SitioFabricacion;
  descripcion?: string;
  actualizadoEn: string;
  actualizadoPor?: string;
}

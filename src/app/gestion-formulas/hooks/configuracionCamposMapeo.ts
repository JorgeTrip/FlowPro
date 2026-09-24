// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface CampoConfig {
  campo: string;
  keywords: string[];
  defaultIndex?: number;
}

export const COLS_DEF_PEDIDOS = [
  'Columna A (Fecha Solicitud)', 'Columna B', 'Columna C',
  'Columna D (Código Insumo)', 'Columna E', 'Columna F (Cant. Solicitada)',
  'Columna V (Cant. Recibida)',
];

export const CAMPOS_FORMULAS: CampoConfig[] = [
  { campo: 'codigoProducto', keywords: ['codigo tango', 'cod tango', 'codigo producto', 'art cod', 'codigo'], defaultIndex: 0 },
  { campo: 'descripcionProducto', keywords: ['descripcion', 'desc', 'detalle', 'producto'], defaultIndex: 1 },
  { campo: 'contenido', keywords: ['descripcion adicional contenido', 'adicional contenido', 'contenido', 'presentacion', 'adicional'], defaultIndex: 2 },
  { campo: 'codigoComponente', keywords: ['codigo componente', 'insumo', 'mp cod', 'componente', 'codigo'], defaultIndex: 3 },
  { campo: 'descripcionComponente', keywords: ['articulo', 'nombre componente', 'descripcion componente', 'insumo'], defaultIndex: 4 },
  { campo: 'unidadMedidaComponente', keywords: ['um', 'u m', 'unidad medida', 'unidad', 'medida'], defaultIndex: 5 },
  { campo: 'cantidad', keywords: ['cantidad requerida', 'cantidad', 'cant', 'proporcion'], defaultIndex: 6 },
];

export const CAMPOS_STOCK: CampoConfig[] = [
  { campo: 'codigoProducto', keywords: ['codigo', 'articulo', 'art cod', 'producto'], defaultIndex: 0 },
  { campo: 'deposito', keywords: ['descripcion deposito', 'deposito', 'almacen', 'ubicacion'], defaultIndex: 2 },
  { campo: 'stockFisico', keywords: ['saldo control stock', 'saldo stock', 'stock fisico', 'fisico', 'saldo', 'stock'], defaultIndex: 4 },
  { campo: 'stockReservado', keywords: ['cantidad comprometida control stock', 'cantidad comprometida', 'comprometida', 'stock reservado', 'reservado'], defaultIndex: 5 },
  { campo: 'unidadMedida', keywords: ['u m control stock', 'unidad medida', 'u m', 'um', 'unidad'], defaultIndex: 3 },
  { campo: 'cantidadARecibir', keywords: ['cantidad a recibir control stock', 'pendiente de remitir', 'a recibir', 'pendiente'], defaultIndex: 6 },
];

export const CAMPOS_CONSUMO: CampoConfig[] = [
  { campo: 'codigoProducto', keywords: ['codigo', 'art cod', 'insumo', 'producto'], defaultIndex: 0 },
  { campo: 'cantidadConsumida', keywords: ['rotacion mensual', 'rotacion', 'consumo mensual', 'consumo', 'cantidad consumida', 'cantidad'], defaultIndex: 3 },
  { campo: 'anio', keywords: ['ano', 'año', 'ejercicio', 'periodo'] },
  { campo: 'mes', keywords: ['mes', 'periodo'] },
];

export const CAMPOS_STOCK_PT: CampoConfig[] = [
  { campo: 'codigo', keywords: ['codigo tango', 'codigo', 'art cod', 'articulo'], defaultIndex: 0 },
  { campo: 'descripcion', keywords: ['descripcion', 'producto', 'articulo'], defaultIndex: 1 },
  { campo: 'descripcionAdicional', keywords: ['descripcion adicional', 'adicional', 'contenido'], defaultIndex: 2 },
];

export const CAMPOS_PEDIDOS_COMPRA: CampoConfig[] = [
  { campo: 'fechaSolicitud', keywords: ['fecha solicitud', 'fecha pedido', 'fecha', 'fec solicitud', 'fec', 'columna a'], defaultIndex: 0 },
  { campo: 'codigoProducto', keywords: ['codigo tango', 'codigo producto', 'codigo insumo', 'codigo', 'art cod', 'insumo', 'columna d'], defaultIndex: 3 },
  { campo: 'cantidadSolicitada', keywords: ['cantidad solicitada', 'cant solicitada', 'cantidad pedida', 'cant pedida', 'solicitada', 'cantidad', 'columna f'], defaultIndex: 5 },
  { campo: 'cantidadRecibida', keywords: ['cantidad recibida', 'cant recibida', 'recibida', 'recibido', 'entrega', 'recepcion', 'columna v'], defaultIndex: 21 },
];

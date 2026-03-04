/**
 * Tipos para una venta individual y sus campos relevantes
 */
export interface Venta {
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
  Cantidad: number;
  PrecioUnitario: number;
  PrecioTotal: number;
  Total: number;
  TotalCIVA: number;
  DirectoIndirecto: string;
  DescRubro: string;
  DescripcionZona: string;
}

/**
 * Representa una fila de la planilla "Nómina de clientes".
 * Se usa para cruzar con ventas por Cód. cliente y reasignar el vendedor real.
 */
export interface ClienteNomina {
  CodCliente: string;
  RazonSocial: string;
  CodVendedor: string;
  Vendedor: string;
}

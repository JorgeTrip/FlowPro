// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface Modulo {
  id: string;
  nombre: string;
  ruta: string;
  icono: string;
  descripcion: string;
  activo: boolean;
  categoria: keyof typeof CATEGORIAS_MODULOS;
  tooltip?: {
    descripcion: string;
    inputRequerido: string;
  };
}

export const MODULOS_DISPONIBLES: Modulo[] = [
  {
    id: 'dashboard',
    nombre: 'Dashboard',
    ruta: '/',
    icono: '🏠',
    descripcion: 'Vista general',
    activo: true,
    categoria: 'general'
  },
  {
    id: 'estimar-demanda',
    nombre: 'Estimar Demanda',
    ruta: '/estimar-demanda',
    icono: '📈',
    descripcion: 'Análisis demanda vs stock',
    activo: true,
    categoria: 'inventario',
    tooltip: {
      descripcion: 'Analiza la demanda mensual vs stock disponible en CABA y Entre Ríos. Calcula meses de cobertura y sugiere transferencias entre depósitos.',
      inputRequerido: 'Requiere 2 reportes Excel de Tango: 1) Planilla de ventas (ID producto, cantidad, fecha, descripción) 2) Planilla de stock (ID producto, cantidad, depósito CABA/Entre Ríos, stock reservado)'
    }
  },
  {
    id: 'reporte-de-ventas',
    nombre: 'Reporte de Ventas',
    ruta: '/reporte-de-ventas',
    icono: '🛒',
    descripcion: 'Análisis de ventas por producto',
    activo: true,
    categoria: 'ventas',
    tooltip: {
      descripcion: 'Genera reportes detallados de ventas con gráficos interactivos, análisis por categorías, top productos y clientes. Incluye filtros avanzados y exportación.',
      inputRequerido: 'Requiere 1 reporte Excel de Tango con datos de ventas: ID producto, descripción, categoría, cliente, cantidad, importe, fecha'
    }
  },
  {
    id: 'redistribucion-stock',
    nombre: 'Redistribución Stock',
    ruta: '/redistribucion-stock',
    icono: '🚚',
    descripcion: 'Redistribución entre depósitos según rotación',
    activo: true,
    categoria: 'inventario',
    tooltip: {
      descripcion: 'Optimiza la distribución de stock entre CABA y Entre Ríos basado en rotación mensual. Identifica productos que necesitan transferencia.',
      inputRequerido: 'De Google Drive usar "Planilla integral de stock", solapa "Info hierbas para compra" columnas A-H (ID producto, descripción, stock CABA MP+PT, stock Entre Ríos MP+PT, rotación mensual)'
    }
  },
  {
    id: 'gestion-formulas',
    nombre: 'Pedido MP/PT',
    ruta: '/gestion-formulas',
    icono: '⚗️',
    descripcion: 'Gestión de fórmulas, stock y optimización para Pedido MP/PT',
    activo: true,
    categoria: 'inventario',
    tooltip: {
      descripcion: 'Optimiza el cálculo de fórmulas (BOM/MRP) de forma intermedia procesando datos de stock y recetas en el cliente para volcar en la planilla de Excel oficial.',
      inputRequerido: 'Requiere archivos Excel de Tango: 1) Catálogo de productos, 2) Fórmulas/recetas (BOM) y 3) Stock actual por depósito.'
    }
  },
  {
    id: 'gestion-ventas',
    nombre: 'Gestión Ventas (CRM)',
    ruta: '/gestion-ventas',
    icono: '💰',
    descripcion: 'CRM y seguimiento de clientes',
    activo: false, // Se activa cuando se implemente
    categoria: 'ventas'
  },
  {
    id: 'contabilidad',
    nombre: 'Contabilidad',
    ruta: '/contabilidad',
    icono: '📊',
    descripcion: 'Gestión contable y reportes',
    activo: false,
    categoria: 'finanzas'
  },
  {
    id: 'control-asistencias',
    nombre: 'Control de Asistencias',
    ruta: '/control-asistencias',
    icono: '🕒',
    descripcion: 'Fichadas, horarios y análisis de puntualidad',
    activo: true,
    categoria: 'personal',
    tooltip: {
      descripcion: 'Importa fichadas desde Excel, asigna horarios y analiza llegadas/salidas y almuerzos.',
      inputRequerido: 'Requiere 1 planilla Excel con columnas: Empleado, Fecha, Hora, Tipo (Entrada/Salida).'
    }
  },
  {
    id: 'recursos-humanos',
    nombre: 'RRHH',
    ruta: '/recursos-humanos',
    icono: '👥',
    descripcion: 'Gestión de personal',
    activo: false,
    categoria: 'personal'
  }
];

export const CATEGORIAS_MODULOS = {
  general: { nombre: 'General', color: 'blue' },
  inventario: { nombre: 'Inventario', color: 'green' },
  ventas: { nombre: 'Ventas', color: 'purple' },
  finanzas: { nombre: 'Finanzas', color: 'amber' },
  personal: { nombre: 'Personal', color: 'red' }
} as const;

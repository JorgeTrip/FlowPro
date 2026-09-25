// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluarPedidosProducto,
  mapearFilasCompra,
  parsearFechaExcel,
} from './evaluarPedidosCompraPendientes.ts';
import type { RegistroFilaCompra } from './evaluarPedidosCompraPendientes.ts';

test('Retorna null si la criticidad no es alta', () => {
  const registros: RegistroFilaCompra[] = [
    {
      fechaSolicitud: new Date('2026-09-20'),
      fechaSolicitudTexto: '20/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 500,
      cantidadRecibida: null,
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultadoBaja = evaluarPedidosProducto('MP-001', 'baja', registros);
  const resultadoMedia = evaluarPedidosProducto('MP-001', 'media', registros);

  assert.equal(resultadoBaja, null);
  assert.equal(resultadoMedia, null);
});

test('Retorna null si el código de producto no existe en los registros', () => {
  const registros: RegistroFilaCompra[] = [
    {
      fechaSolicitud: new Date('2026-09-20'),
      fechaSolicitudTexto: '20/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 500,
      cantidadRecibida: null,
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultado = evaluarPedidosProducto('MP-999', 'alta', registros);
  assert.equal(resultado, null);
});

test('Retorna null si la solicitud con fecha más reciente ya tiene recepción (columna V con datos)', () => {
  const registros: RegistroFilaCompra[] = [
    {
      fechaSolicitud: new Date('2026-09-10'),
      fechaSolicitudTexto: '10/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 200,
      cantidadRecibida: null, // Pendiente anterior
      hojaOrigen: 'Solicitud de compras',
    },
    {
      fechaSolicitud: new Date('2026-09-22'),
      fechaSolicitudTexto: '22/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 400,
      cantidadRecibida: 400, // Última solicitud YA recibida
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultado = evaluarPedidosProducto('MP-001', 'alta', registros);
  assert.equal(resultado, null);
});

test('Devuelve fecha y cantidad de la última solicitud cuando la columna V está vacía (1 solo pedido pendiente)', () => {
  const registros: RegistroFilaCompra[] = [
    {
      fechaSolicitud: new Date('2026-09-01'),
      fechaSolicitudTexto: '01/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 150,
      cantidadRecibida: 150, // Recibido
      hojaOrigen: 'Solicitud Hierbas',
    },
    {
      fechaSolicitud: new Date('2026-09-23'),
      fechaSolicitudTexto: '23/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 750,
      cantidadRecibida: null, // Sin recibir
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultado = evaluarPedidosProducto('mp-001', 'alta', registros);

  assert.ok(resultado);
  assert.equal(resultado.fechaUltimaSolicitud, '23/09/2026');
  assert.equal(resultado.cantidadSolicitadaUltima, 750);
  assert.equal(resultado.tieneMultiplesPendientes, false);
  assert.equal(resultado.totalPedidosPendientes, 1);
});

test('Activa badge y conteo cuando existen múltiples solicitudes pendientes sin recibir', () => {
  const registros: RegistroFilaCompra[] = [
    {
      fechaSolicitud: new Date('2026-09-05'),
      fechaSolicitudTexto: '05/09/2026',
      codigoProducto: 'PT-100',
      cantidadSolicitada: 100,
      cantidadRecibida: null, // Pendiente 1
      hojaOrigen: 'Solicitud de compras',
    },
    {
      fechaSolicitud: new Date('2026-09-15'),
      fechaSolicitudTexto: '15/09/2026',
      codigoProducto: 'PT-100',
      cantidadSolicitada: 200,
      cantidadRecibida: null, // Pendiente 2
      hojaOrigen: 'Solicitud Hierbas',
    },
    {
      fechaSolicitud: new Date('2026-09-24'),
      fechaSolicitudTexto: '24/09/2026',
      codigoProducto: 'PT-100',
      cantidadSolicitada: 300,
      cantidadRecibida: null, // Pendiente 3 (más reciente)
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultado = evaluarPedidosProducto('PT-100', 'alta', registros);

  assert.ok(resultado);
  assert.equal(resultado.fechaUltimaSolicitud, '24/09/2026');
  assert.equal(resultado.cantidadSolicitadaUltima, 300);
  assert.equal(resultado.tieneMultiplesPendientes, true);
  assert.equal(resultado.totalPedidosPendientes, 3);
});

test('mapearFilasCompra procesa matrices heterogéneas con fechas seriales y recepción', () => {
  // Simulación de fila de Excel: Col A (índice 0) Fecha, Col D (índice 3) Código, Col F (índice 5) Cantidad, Col V (índice 21) Recibido
  const fila1 = new Array(22).fill(null);
  fila1[0] = '15/09/2026';
  fila1[3] = 'MP-HIERBA-1';
  fila1[5] = 1200;
  fila1[21] = null; // Sin recepción

  const fila2 = new Array(22).fill(null);
  fila2[0] = 45550; // Serial Excel
  fila2[3] = 'MP-HIERBA-1';
  fila2[5] = '800';
  fila2[21] = 800; // Recibido

  const registros = mapearFilasCompra([fila1, fila2], 'Solicitud Hierbas');

  assert.equal(registros.length, 2);
  assert.equal(registros[0].codigoProducto, 'MP-HIERBA-1');
  assert.equal(registros[0].cantidadSolicitada, 1200);
  assert.equal(registros[0].cantidadRecibida, null);
  assert.equal(registros[0].hojaOrigen, 'Solicitud Hierbas');

  assert.equal(registros[1].codigoProducto, 'MP-HIERBA-1');
  assert.equal(registros[1].cantidadSolicitada, 800);
  assert.equal(registros[1].cantidadRecibida, 800);
});

test('parsearFechaExcel maneja seriales de Excel y cadenas de fecha estándar', () => {
  const parsedStr = parsearFechaExcel('25/12/2026');
  assert.ok(parsedStr);
  assert.equal(parsedStr.texto, '25/12/2026');

  const parsedSerial = parsearFechaExcel(45550);
  assert.ok(parsedSerial);
  assert.match(parsedSerial.texto, /^\d{2}\/\d{2}\/\d{4}$/);
});

test('evaluarPedidosProducto soporta fechas deserializadas como strings desde IndexedDB', () => {
  const registrosPersistidos: RegistroFilaCompra[] = [
    {
      fechaSolicitud: '2026-09-22T00:00:00.000Z',
      fechaSolicitudTexto: '22/09/2026',
      codigoProducto: 'MP-001',
      cantidadSolicitada: 400,
      cantidadRecibida: null,
      hojaOrigen: 'Solicitud de compras',
    },
  ];

  const resultado = evaluarPedidosProducto('MP-001', 'alta', registrosPersistidos);
  assert.ok(resultado);
  assert.equal(resultado?.cantidadSolicitadaUltima, 400);
  assert.equal(resultado?.fechaUltimaSolicitud, '22/09/2026');
});


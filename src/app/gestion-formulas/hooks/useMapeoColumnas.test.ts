// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarTexto,
  buscarCoincidenciaColumna,
} from './useMapeoColumnas.ts';

test('normalizarTexto remueve acentos, saltos de linea y caracteres especiales', () => {
  const entrada = 'DESCRIPCIÓN ADICIONAL\n / CONTENIDO';
  const normalizada = normalizarTexto(entrada);
  assert.equal(normalizada, 'descripcion adicional contenido');
});

test('buscarCoincidenciaColumna encuentra columnas complejas con saltos de linea o puntuacion', () => {
  const columnas = [
    'CÓDIGO TANGO',
    'DESCRIPCIÓN',
    'DESCRIPCIÓN ADICIONAL\n / CONTENIDO',
    'CÓDIGO',
    'ARTÍCULO',
    'UM',
    'CANTIDAD',
  ];

  const colContenido = buscarCoincidenciaColumna(columnas, [
    'descripcion adicional contenido',
    'contenido',
  ]);
  assert.equal(colContenido, 'DESCRIPCIÓN ADICIONAL\n / CONTENIDO');

  const colUM = buscarCoincidenciaColumna(columnas, ['um', 'unidad']);
  assert.equal(colUM, 'UM');
});

test('buscarCoincidenciaColumna resuelve columnas de stock con cantidad comprometida', () => {
  const columnasStock = [
    'Código',
    'Descripción',
    'Descripción depósito',
    'U.m. control stock',
    'Saldo control stock',
    'Cantidad comprometida control stock',
    'Cantidad a recibir control stock',
    'Punto de pedido',
  ];

  const reservado = buscarCoincidenciaColumna(columnasStock, [
    'cantidad comprometida control stock',
    'cantidad comprometida',
    'comprometida',
    'reservado',
  ]);
  assert.equal(reservado, 'Cantidad comprometida control stock');

  const um = buscarCoincidenciaColumna(columnasStock, [
    'u m control stock',
    'unidad medida',
    'u m',
    'um',
  ]);
  assert.equal(um, 'U.m. control stock');
});

test('buscarCoincidenciaColumna resuelve rotacion mensual en solapas de consumo', () => {
  const columnasRotacion = [
    'CÓDIGO',
    'DESCRIPCIÓN',
    'DESCRIPCIÓN ADICIONAL',
    'ROTACIÓN MENSUAL',
  ];

  const rot = buscarCoincidenciaColumna(columnasRotacion, [
    'rotacion mensual',
    'rotacion',
    'consumo mensual',
  ]);
  assert.equal(rot, 'ROTACIÓN MENSUAL');
});

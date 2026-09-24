// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encontrarFilaCabecera,
  deducirIndicesDeCabecera,
} from './lectorPedidosCompra.ts';

test('encontrarFilaCabecera detecta la fila de encabezados aunque este precedida por titulos y metadatos', () => {
  const matrizExcel = [
    ['EMPRESA S.A. - SISTEMA DE GESTION INTEGRAL'],
    ['Reporte emitido el 24/09/2026'],
    ['Filtros aplicados: Todas las plantas'],
    [],
    ['Fecha Solicitud', 'Nro OC', 'Proveedor', 'Código', 'Descripción', 'Cantidad Solicitada', 'UM', 'Cantidad Recibida'],
    ['20/09/2026', 'OC-101', 'Prov A', 'MP-001', 'Materia Prima 1', 500, 'KG', null],
  ];

  const idxCabecera = encontrarFilaCabecera(matrizExcel);
  assert.equal(idxCabecera, 4, 'La fila cabecera debe ser la 4 (indice 4), ignorando titulos previos');
});

test('deducirIndicesDeCabecera identifica las columnas correctas por nombre de encabezado', () => {
  const filaCabecera = [
    'Fecha Solicitud', // 0
    'Requerimiento',   // 1
    'Proveedor',       // 2
    'Código Insumo',   // 3
    'Artículo',        // 4
    'Cantidad Solicitada', // 5
    'Observaciones',   // 6
    'Cantidad Recibida', // 7
  ];

  const indices = deducirIndicesDeCabecera(filaCabecera);
  assert.equal(indices.idxFecha, 0);
  assert.equal(indices.idxCodigo, 3);
  assert.equal(indices.idxCantSol, 5);
  assert.equal(indices.idxCantRec, 7);
});

test('encontrarFilaCabecera maneja hojas donde los encabezados estan en filas distintas (ej. fila 2)', () => {
  const matrizHierbas = [
    ['SOLICITUDES DE HIERBAS Y MATERIAS PRIMAS BOTANICAS'],
    ['Fecha', 'Sector', 'Código', 'Variedad', 'Cantidad Solicitada', 'Recepción'],
    ['15/09/2026', 'Secadero', 'HIERBA-01', 'Manzanilla', 120, 120],
  ];

  const idxHierbas = encontrarFilaCabecera(matrizHierbas);
  assert.equal(idxHierbas, 1);

  const indicesHierbas = deducirIndicesDeCabecera(matrizHierbas[idxHierbas]);
  assert.equal(indicesHierbas.idxFecha, 0);
  assert.equal(indicesHierbas.idxCodigo, 2);
  assert.equal(indicesHierbas.idxCantSol, 4);
  assert.equal(indicesHierbas.idxCantRec, 5);
});

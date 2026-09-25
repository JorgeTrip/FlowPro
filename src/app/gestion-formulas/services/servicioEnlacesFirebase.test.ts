// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarUrlPlanilla, prepararPayloadEnlaces } from '../lib/enlacesGoogleDriveUtils.ts';

test('normalizarUrlPlanilla limpia espacios y valida enlaces válidos', () => {
  assert.equal(normalizarUrlPlanilla('   '), null);
  assert.equal(normalizarUrlPlanilla(''), null);
  assert.equal(normalizarUrlPlanilla(null), null);
  assert.equal(normalizarUrlPlanilla(undefined), null);
  assert.equal(
    normalizarUrlPlanilla('  https://docs.google.com/spreadsheets/d/abc1234/edit  '),
    'https://docs.google.com/spreadsheets/d/abc1234/edit'
  );
});

test('prepararPayloadEnlaces genera estructura correcta para Firestore', () => {
  const payload = prepararPayloadEnlaces({
    formulas: 'https://docs.google.com/spreadsheets/d/formulas',
    stock: null,
    pedidosCompra: 'https://docs.google.com/spreadsheets/d/compras',
  });

  assert.equal(payload.formulas, 'https://docs.google.com/spreadsheets/d/formulas');
  assert.equal(payload.stock, null);
  assert.equal(payload.pedidosCompra, 'https://docs.google.com/spreadsheets/d/compras');
  assert.ok(payload.actualizadoEn);
});

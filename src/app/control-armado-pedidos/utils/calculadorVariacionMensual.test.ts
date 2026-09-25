// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularVariacionPorcentual,
  formatearVariacionPorcentual,
} from './calculadorVariacionMensual.ts';

test('calcularVariacionPorcentual calcula correctamente incrementos y decrementos', () => {
  // Incremento del 20%
  assert.equal(calcularVariacionPorcentual(120, 100), 20);

  // Decremento del 25%
  assert.equal(calcularVariacionPorcentual(75, 100), -25);

  // Sin cambio (0%)
  assert.equal(calcularVariacionPorcentual(50, 50), 0);

  // Anterior era 0 y actual > 0 -> incremento del 100%
  assert.equal(calcularVariacionPorcentual(10, 0), 100);

  // Ambos en 0 -> null
  assert.equal(calcularVariacionPorcentual(0, 0), null);
});

test('formatearVariacionPorcentual devuelve etiqueta formateada con signo y clase de color', () => {
  const inc = formatearVariacionPorcentual(150, 100);
  assert.equal(inc.texto, '+50%');
  assert.equal(inc.esPositivo, true);

  const dec = formatearVariacionPorcentual(80, 100);
  assert.equal(dec.texto, '-20%');
  assert.equal(dec.esNegativo, true);

  const neutro = formatearVariacionPorcentual(50, 50);
  assert.equal(neutro.texto, '0%');

  const sinDatos = formatearVariacionPorcentual(0, 0);
  assert.equal(sinDatos.texto, '-');
});

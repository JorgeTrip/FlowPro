// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectarSugerenciaTarea,
  formatearEtiquetaTarea,
} from './detectorTareasAlternativas.ts';

test('detectarSugerenciaTarea identifica palabras clave de Atención al Cliente', () => {
  assert.equal(detectarSugerenciaTarea('atención a clientes'), 'atencion_cliente');
  assert.equal(detectarSugerenciaTarea('Atencion cliente'), 'atencion_cliente');
  assert.equal(detectarSugerenciaTarea('Fue a clientes'), 'atencion_cliente');
  assert.equal(detectarSugerenciaTarea('Mostrador y clientes'), 'atencion_cliente');
});

test('detectarSugerenciaTarea identifica palabras clave de Producción', () => {
  assert.equal(detectarSugerenciaTarea('Producción'), 'produccion');
  assert.equal(detectarSugerenciaTarea('fue a produccion'), 'produccion');
  assert.equal(detectarSugerenciaTarea('ayuda en planta de fabricación'), 'produccion');
});

test('detectarSugerenciaTarea devuelve null para notas de armado regular o vacías', () => {
  assert.equal(detectarSugerenciaTarea('TERMINO SEBA'), null);
  assert.equal(detectarSugerenciaTarea('Faltante bulto'), null);
  assert.equal(detectarSugerenciaTarea(''), null);
  assert.equal(detectarSugerenciaTarea(null), null);
  assert.equal(detectarSugerenciaTarea(undefined), null);
});

test('formatearEtiquetaTarea devuelve texto descriptivo según tipoTarea y detalle', () => {
  assert.equal(formatearEtiquetaTarea('armado'), 'Armado');
  assert.equal(formatearEtiquetaTarea('atencion_cliente'), 'Atención al Cliente');
  assert.equal(formatearEtiquetaTarea('produccion'), 'Producción');
  assert.equal(formatearEtiquetaTarea('otros', 'Limpieza y orden'), 'Otros: Limpieza y orden');
  assert.equal(formatearEtiquetaTarea('otros'), 'Otros');
});

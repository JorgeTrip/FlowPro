// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarReglaParaFirestore,
  mapearDocumentoAFirestore,
  validarReglaPrefijo,
} from './normalizadorPrefijos.ts';
import type { ReglaPrefijo } from '../types/prefijos.ts';

test('validarReglaPrefijo valida presencia de prefijo, linea y sitio valido', () => {
  const reglaValida: ReglaPrefijo = {
    id: 'pref-1',
    prefijo: '01ACE',
    linea: 'Aceites',
    sitioFabricacion: 'CABA',
  };

  assert.equal(validarReglaPrefijo(reglaValida).valida, true);
  assert.equal(validarReglaPrefijo({ ...reglaValida, prefijo: '' }).valida, false);
  assert.equal(validarReglaPrefijo({ ...reglaValida, linea: '   ' }).valida, false);
  assert.equal(validarReglaPrefijo({ ...reglaValida, sitioFabricacion: 'CORDOBA' as any }).valida, false);
});

test('normalizarReglaParaFirestore formatea campos y agrega metadatos de sincronizacion', () => {
  const regla: ReglaPrefijo = {
    id: 'pref-123',
    prefijo: '  02vin  ',
    linea: '  Vinagres Especiales  ',
    sitioFabricacion: 'ER' as any,
  };

  const normalizado = normalizarReglaParaFirestore(regla, 'usuario@test.com');

  assert.equal(normalizado.id, 'pref-123');
  assert.equal(normalizado.prefijo, '02VIN');
  assert.equal(normalizado.linea, 'Vinagres Especiales');
  assert.equal(normalizado.sitioFabricacion, 'ENTRE RIOS');
  assert.equal(normalizado.actualizadoPor, 'usuario@test.com');
  assert.ok(typeof normalizado.actualizadoEn === 'string');
});

test('mapearDocumentoAFirestore extrae y sanitiza los campos para el estado local', () => {
  const docCrudo = {
    prefijo: '03JAR',
    linea: 'Jarabes',
    sitioFabricacion: 'CABA + ENTRE RIOS',
    descripcion: 'Jarabes medicinales',
    actualizadoEn: '2026-09-25T12:00:00.000Z',
    actualizadoPor: 'admin@flowpro.com',
  };

  const resultado = mapearDocumentoAFirestore(docCrudo, 'doc-id-03');

  assert.notEqual(resultado, null);
  assert.equal(resultado?.id, 'doc-id-03');
  assert.equal(resultado?.prefijo, '03JAR');
  assert.equal(resultado?.linea, 'Jarabes');
  assert.equal(resultado?.sitioFabricacion, 'CABA + ENTRE RIOS');
  assert.equal(resultado?.descripcion, 'Jarabes medicinales');
});

test('mapearDocumentoAFirestore devuelve null si el documento no tiene datos obligatorios', () => {
  assert.equal(mapearDocumentoAFirestore(null, 'id-1'), null);
  assert.equal(mapearDocumentoAFirestore({}, 'id-2'), null);
  assert.equal(mapearDocumentoAFirestore({ prefijo: '01ACE' }, 'id-3'), null);
});

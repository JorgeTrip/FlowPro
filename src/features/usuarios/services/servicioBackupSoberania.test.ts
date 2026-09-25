// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarEstructuraBackup,
  filtrarClavesSensiblesLocalStorage,
  generarNombreArchivoBackup,
} from './servicioBackupSoberania.ts';

test('validarEstructuraBackup valida que el paquete contenga campos obligatorios', () => {
  const backupValido = {
    version: '1.0.0',
    timestamp: '2026-09-25T10:00:00Z',
    origen: 'flowpro-suite',
    usuario: 'jorge@flowpro.com',
    datosLocalStorage: { tema: 'dark' },
    datosIndexedDB: { catalogo: [{ id: 1 }] },
  };

  assert.equal(validarEstructuraBackup(backupValido), true);
  assert.equal(validarEstructuraBackup(null), false);
  assert.equal(validarEstructuraBackup({}), false);
  assert.equal(validarEstructuraBackup({ version: '1.0.0' }), false);
  assert.equal(validarEstructuraBackup({ ...backupValido, datosIndexedDB: null }), false);
});

test('filtrarClavesSensiblesLocalStorage excluye tokens de sesion o claves no autorizadas', () => {
  const storageCrudo = {
    'flowpro_prefijos_pt': '{"PT-01": "Línea 1"}',
    'firebase:authUser:apiKey': 'TOKEN_SECRETO_FIREBASE',
    'flowpro_modo_oscuro': 'true',
  };

  const filtrado = filtrarClavesSensiblesLocalStorage(storageCrudo);
  assert.equal('flowpro_prefijos_pt' in filtrado, true);
  assert.equal('flowpro_modo_oscuro' in filtrado, true);
  assert.equal('firebase:authUser:apiKey' in filtrado, false);
});

test('generarNombreArchivoBackup genera nombre con fecha en formato YYYY-MM-DD', () => {
  const nombre = generarNombreArchivoBackup();
  assert.match(nombre, /^flowpro_backup_\d{4}-\d{2}-\d{2}\.json$/);
});

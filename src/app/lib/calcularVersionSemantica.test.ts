// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deducirTipoCommit,
  calcularVersionSemantica,
  parsearSalidaGitLog,
} from './calcularVersionSemantica.ts';

test('deducirTipoCommit clasifica correctamente según prefijos estándar', () => {
  assert.equal(deducirTipoCommit('feat: Se agrega exportación a PDF'), 'feat');
  assert.equal(deducirTipoCommit('🚀 Se agrega nueva solapa'), 'feat');
  assert.equal(deducirTipoCommit('fix: Se corrige error en filtros'), 'fix');
  assert.equal(deducirTipoCommit('🔧 Se corrige cálculo'), 'fix');
  assert.equal(deducirTipoCommit('BREAKING: Se reemplaza API'), 'breaking');
  assert.equal(deducirTipoCommit('chore: Se actualizan dependencias'), 'chore');
  assert.equal(deducirTipoCommit('refactor: Se reorganiza módulo'), 'refactor');
  assert.equal(deducirTipoCommit('Se actualiza documentación'), 'otros');
});

test('calcularVersionSemantica incrementa major, minor o patch según historial cronológico', () => {
  const commits = [
    { titulo: 'commit inicial base' },                     // patch -> 1.0.1
    { titulo: 'feat: Se implementa módulo stock' },        // minor -> 1.1.0
    { titulo: 'fix: Se corrige timezone de fechas' },       // patch -> 1.1.1
    { titulo: 'feat: Se agrega soporte compras' },         // minor -> 1.2.0
    { titulo: 'BREAKING: Se migra estructura de datos' },  // major -> 2.0.0
    { titulo: 'fix: Se corrige bug residual' },            // patch -> 2.0.1
  ];

  const version = calcularVersionSemantica(commits, '1.0.0');
  assert.equal(version, '2.0.1');
});

test('parsearSalidaGitLog procesa bloques delimitados de git log', () => {
  const logCrudo = `abc1234567890abcdef|abc1234|Jorge O. Tripodi|2026-09-24 21:00:00 -0300|feat: Se agrega exportacion|Cuerpo explicativo@@@COMMIT@@@`;
  const res = parsearSalidaGitLog(logCrudo);

  assert.equal(res.length, 1);
  assert.equal(res[0].shortHash, 'abc1234');
  assert.equal(res[0].autor, 'Jorge O. Tripodi');
  assert.equal(res[0].titulo, 'feat: Se agrega exportacion');
  assert.equal(res[0].cuerpo, 'Cuerpo explicativo');
  assert.equal(res[0].tipo, 'feat');
});

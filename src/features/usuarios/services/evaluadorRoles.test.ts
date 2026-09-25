// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deducirRolPorEmail,
  tienePermiso,
  esRolMayorOIgual,
  formatearNombreRol,
} from './evaluadorRoles.ts';

test('deducirRolPorEmail asigna superadmin a correos de la lista blanca de Jorge y operador al resto', () => {
  assert.equal(deducirRolPorEmail('jorgeotripodi@gmail.com'), 'superadmin');
  assert.equal(deducirRolPorEmail('jorge.tripodi@flowpro.com'), 'superadmin');
  assert.equal(deducirRolPorEmail('JORGEOTRIPODI@GMAIL.COM'), 'superadmin');
  assert.equal(deducirRolPorEmail('operario1@flowpro.com'), 'operador');
  assert.equal(deducirRolPorEmail(null), 'operador');
  assert.equal(deducirRolPorEmail(undefined), 'operador');
});

test('esRolMayorOIgual respeta la jerarquia superadmin > admin > supervisor > operador', () => {
  assert.equal(esRolMayorOIgual('superadmin', 'admin'), true);
  assert.equal(esRolMayorOIgual('admin', 'supervisor'), true);
  assert.equal(esRolMayorOIgual('supervisor', 'operador'), true);
  assert.equal(esRolMayorOIgual('operador', 'admin'), false);
  assert.equal(esRolMayorOIgual('supervisor', 'admin'), false);
  assert.equal(esRolMayorOIgual('admin', 'admin'), true);
});

test('tienePermiso valida matriz de permisos segun rol', () => {
  // Superadmin tiene todos los permisos
  assert.equal(tienePermiso('superadmin', 'modo_superusuario'), true);
  assert.equal(tienePermiso('superadmin', 'gestionar_roles'), true);
  assert.equal(tienePermiso('superadmin', 'configurar_sistema'), true);
  assert.equal(tienePermiso('superadmin', 'operar_modulos'), true);

  // Admin puede configurar sistema y gestionar roles, pero no modo_superusuario
  assert.equal(tienePermiso('admin', 'gestionar_roles'), true);
  assert.equal(tienePermiso('admin', 'configurar_sistema'), true);
  assert.equal(tienePermiso('admin', 'modo_superusuario'), false);

  // Supervisor puede revisar métricas y operar pero no gestionar roles ni configurar sistema
  assert.equal(tienePermiso('supervisor', 'revisar_metricas'), true);
  assert.equal(tienePermiso('supervisor', 'gestionar_asistencias'), true);
  assert.equal(tienePermiso('supervisor', 'gestionar_roles'), false);
  assert.equal(tienePermiso('supervisor', 'configurar_sistema'), false);

  // Operador solo opera módulos y ve dashboard
  assert.equal(tienePermiso('operador', 'ver_dashboard'), true);
  assert.equal(tienePermiso('operador', 'operar_modulos'), true);
  assert.equal(tienePermiso('operador', 'gestionar_roles'), false);
  assert.equal(tienePermiso('operador', 'revisar_metricas'), false);
});

test('formatearNombreRol devuelve nombre legible y capitalizado', () => {
  assert.equal(formatearNombreRol('superadmin'), 'Superadmin');
  assert.equal(formatearNombreRol('admin'), 'Administrador');
  assert.equal(formatearNombreRol('supervisor'), 'Supervisor');
  assert.equal(formatearNombreRol('operador'), 'Operador');
});

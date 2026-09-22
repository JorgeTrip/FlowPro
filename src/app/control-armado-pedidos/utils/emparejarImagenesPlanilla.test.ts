// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import test from 'node:test';
import assert from 'node:assert/strict';
import { emparejarImagenesConPlanillas } from './emparejarImagenesPlanilla.ts';

test('Empareja prioritariamente por nombre de archivo coincidente exacto', () => {
  const planillas = [
    { id: '1', nombreArchivo: 'planilla_juan.jpg' },
    { id: '2', nombreArchivo: 'planilla_pedro.jpg' },
  ];
  const archivos = [
    { name: 'planilla_pedro.jpg' },
    { name: 'planilla_juan.jpg' },
  ];

  const resultado = emparejarImagenesConPlanillas(planillas, archivos as any);

  assert.equal(resultado.asignadas.length, 2);
  assert.equal(resultado.asignadas[0].planilla.id, '1');
  assert.equal(resultado.asignadas[0].archivo.name, 'planilla_juan.jpg');
  assert.equal(resultado.asignadas[1].planilla.id, '2');
  assert.equal(resultado.asignadas[1].archivo.name, 'planilla_pedro.jpg');
  assert.equal(resultado.sobrantes.length, 0);
});

test('Empareja por nombre sin importar mayúsculas o extensiones distintas', () => {
  const planillas = [
    { id: '1', nombreArchivo: 'PLANILLA_A.PNG' },
  ];
  const archivos = [
    { name: 'planilla_a.jpeg' },
  ];

  const resultado = emparejarImagenesConPlanillas(planillas, archivos as any);

  assert.equal(resultado.asignadas.length, 1);
  assert.equal(resultado.asignadas[0].archivo.name, 'planilla_a.jpeg');
  assert.equal(resultado.sobrantes.length, 0);
});

test('Separa correctamente las fotos sobrantes cuando hay más imágenes que planillas', () => {
  const planillas = [
    { id: '1', nombreArchivo: 'doc1.jpg' },
  ];
  const archivos = [
    { name: 'doc1.jpg' },
    { name: 'sobrante1.jpg' },
    { name: 'sobrante2.jpg' },
  ];

  const resultado = emparejarImagenesConPlanillas(planillas, archivos as any);

  assert.equal(resultado.asignadas.length, 1);
  assert.equal(resultado.sobrantes.length, 2);
  assert.equal(resultado.sobrantes[0].name, 'sobrante1.jpg');
  assert.equal(resultado.sobrantes[1].name, 'sobrante2.jpg');
});

test('Detecta fotos que no pertenecen a ninguna planilla pendiente con nombre', () => {
  const planillas = [
    { id: '1', nombreArchivo: 'operador_marcos.jpg' },
  ];
  const archivos = [
    { name: 'operador_desconocido.jpg' },
  ];

  const resultado = emparejarImagenesConPlanillas(planillas, archivos as any);

  assert.equal(resultado.asignadas.length, 0);
  assert.equal(resultado.sobrantes.length, 1);
  assert.equal(resultado.sobrantes[0].name, 'operador_desconocido.jpg');
  assert.equal(resultado.planillasSinFoto.length, 1);
});

test('Fallback secuencial si las planillas no tienen nombre de archivo en el JSON', () => {
  const planillas = [
    { id: 'p1' },
    { id: 'p2' },
  ];
  const archivos = [
    { name: 'foto_01.jpg' },
    { name: 'foto_02.jpg' },
  ];

  const resultado = emparejarImagenesConPlanillas(planillas, archivos as any);

  assert.equal(resultado.asignadas.length, 2);
  assert.equal(resultado.asignadas[0].archivo.name, 'foto_01.jpg');
  assert.equal(resultado.asignadas[1].archivo.name, 'foto_02.jpg');
  assert.equal(resultado.sobrantes.length, 0);
});

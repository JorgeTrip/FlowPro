// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularRendimientoMensualPorEmpleado } from './monthlyMetricsCalculator.ts';
import type { RegistroArmadoDocumento } from '../types/armado.ts';

test('calcularRendimientoMensualPorEmpleado calcula desglose completo de métricas por mes para cada armador', () => {
  const mockDocs: RegistroArmadoDocumento[] = [
    {
      id: 'doc-julio',
      empleadoHeader: 'MARCOS',
      fechaPrimeraFila: '2026-07-15',
      horaInicioPrimeraFila: '08:00',
      estado: 'verificado',
      creadoEn: '2026-07-15T08:00:00Z',
      filas: [
        {
          id: 'f1',
          fecha: '2026-07-15',
          horaInicio: '08:00',
          horaFin: '10:00', // 2 hs
          cantArticulos: 200,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'armado',
        },
        {
          id: 'f2',
          fecha: '2026-07-15',
          horaInicio: '10:00',
          horaFin: '11:00', // 1 hs
          cantArticulos: 0,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'atencion_cliente',
        },
      ],
    },
    {
      id: 'doc-agosto',
      empleadoHeader: 'MARCOS',
      fechaPrimeraFila: '2026-08-10',
      horaInicioPrimeraFila: '08:00',
      estado: 'verificado',
      creadoEn: '2026-08-10T08:00:00Z',
      filas: [
        {
          id: 'f3',
          fecha: '2026-08-10',
          horaInicio: '08:00',
          horaFin: '09:00', // 1 hs
          cantArticulos: 150,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'armado',
        },
      ],
    },
  ];

  const res = calcularRendimientoMensualPorEmpleado(mockDocs);
  assert.equal(res.meses.length, 2);
  assert.equal(res.meses[0].clave, '2026-07');
  assert.equal(res.meses[1].clave, '2026-08');

  // Verificar nuevo mapa o diccionario de desglose mensual por empleado
  const detalleMarcos = res.mapaDetalleEmpleado?.get('MARCOS');
  assert.ok(detalleMarcos);

  const mesJulio = detalleMarcos.get('2026-07');
  assert.ok(mesJulio);
  assert.equal(mesJulio.pedidos, 1);
  assert.equal(mesJulio.articulos, 200);
  assert.equal(mesJulio.horasArmado, 2.0);
  assert.equal(mesJulio.horasOtrasTareas, 1.0);
  assert.equal(mesJulio.velocidadArtHs, 100);

  const mesAgosto = detalleMarcos.get('2026-08');
  assert.ok(mesAgosto);
  assert.equal(mesAgosto.pedidos, 1);
  assert.equal(mesAgosto.articulos, 150);
  assert.equal(mesAgosto.horasArmado, 1.0);
  assert.equal(mesAgosto.horasOtrasTareas, 0);
  assert.equal(mesAgosto.velocidadArtHs, 150);
});

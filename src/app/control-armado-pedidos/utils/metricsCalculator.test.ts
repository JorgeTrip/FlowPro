// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularRendimientoPorEmpleado } from './metricsCalculator.ts';
import type { RegistroArmadoDocumento } from '../types/armado.ts';

test('calcularRendimientoPorEmpleado discrimina horas de armado y otras tareas protegiendo la velocidad', () => {
  const mockDocs: RegistroArmadoDocumento[] = [
    {
      id: 'doc-1',
      empleadoHeader: 'GABRIEL',
      fechaPrimeraFila: '2026-09-01',
      horaInicioPrimeraFila: '08:00',
      estado: 'verificado',
      creadoEn: '2026-09-01T08:00:00Z',
      filas: [
        // Renglón 1: Armado normal de 08:00 a 10:00 (120 min = 2.0 hs), 200 artículos
        {
          id: 'f1',
          fecha: '2026-09-01',
          horaInicio: '08:00',
          horaFin: '10:00',
          cantArticulos: 200,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'armado',
        },
        // Renglón 2: Atención al cliente de 10:00 a 11:30 (90 min = 1.5 hs), 0 artículos
        {
          id: 'f2',
          fecha: '2026-09-01',
          horaInicio: '10:00',
          horaFin: '11:30',
          cantArticulos: 0,
          notaIrregularidad: 'Fue a clientes',
          esIrregular: false,
          tipoTarea: 'atencion_cliente',
        },
        // Renglón 3: Producción de 11:30 a 12:30 (60 min = 1.0 hs), 0 artículos
        {
          id: 'f3',
          fecha: '2026-09-01',
          horaInicio: '11:30',
          horaFin: '12:30',
          cantArticulos: 0,
          notaIrregularidad: 'En planta producción',
          esIrregular: false,
          tipoTarea: 'produccion',
        },
      ],
    },
  ];

  const resultado = calcularRendimientoPorEmpleado(mockDocs);
  assert.equal(resultado.length, 1);

  const gabriel = resultado[0];
  assert.equal(gabriel.empleado, 'GABRIEL');
  assert.equal(gabriel.totalPedidos, 1); // Solo 1 pedido de armado
  assert.equal(gabriel.totalArticulos, 200);
  assert.equal(gabriel.horasArmado, 2.0);
  assert.equal(gabriel.horasOtrasTareas, 2.5); // 1.5 + 1.0
  assert.equal(gabriel.horasTotales, 4.5);
  assert.equal(gabriel.desgloseOtrasTareas.atencionClienteHs, 1.5);
  assert.equal(gabriel.desgloseOtrasTareas.produccionHs, 1.0);
  assert.equal(gabriel.desgloseOtrasTareas.otrosHs, 0);

  // La velocidad debe calcularse sobre 2.0 hs (200 / 2 = 100 Art/hs), NO sobre 4.5 hs (44 Art/hs)
  assert.equal(gabriel.velocidadArtHs, 100);
  assert.equal(gabriel.tiempoMedioMin, 120); // 120 min de armado / 1 pedido
});

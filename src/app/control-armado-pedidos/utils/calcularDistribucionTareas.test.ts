// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularDistribucionTareasPorEmpleado } from './calcularDistribucionTareas.ts';
import type { RegistroArmadoDocumento } from '../types/armado.ts';

test('calcularDistribucionTareasPorEmpleado desglosa con exactitud horas y porcentajes por tarea', () => {
  const mockDocs: RegistroArmadoDocumento[] = [
    {
      id: 'doc-1',
      empleadoHeader: 'CARLOS',
      fechaPrimeraFila: '2026-09-01',
      horaInicioPrimeraFila: '08:00',
      estado: 'verificado',
      creadoEn: '2026-09-01T08:00:00Z',
      filas: [
        // 2 horas de armado (120 min)
        {
          id: 'f1',
          fecha: '2026-09-01',
          horaInicio: '08:00',
          horaFin: '10:00',
          cantArticulos: 100,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'armado',
        },
        // 1 hora de atencion al cliente (60 min)
        {
          id: 'f2',
          fecha: '2026-09-01',
          horaInicio: '10:00',
          horaFin: '11:00',
          cantArticulos: 0,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'atencion_cliente',
        },
        // 1 hora de produccion (60 min)
        {
          id: 'f3',
          fecha: '2026-09-01',
          horaInicio: '11:00',
          horaFin: '12:00',
          cantArticulos: 0,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'produccion',
        },
        // 1 hora de otros (60 min)
        {
          id: 'f4',
          fecha: '2026-09-01',
          horaInicio: '12:00',
          horaFin: '13:00',
          cantArticulos: 0,
          notaIrregularidad: 'Limpieza',
          esIrregular: false,
          tipoTarea: 'otros',
        },
      ],
    },
  ];

  const resultado = calcularDistribucionTareasPorEmpleado(mockDocs);
  assert.equal(resultado.length, 1);

  const carlos = resultado[0];
  assert.equal(carlos.empleado, 'CARLOS');
  assert.equal(carlos.horasArmado, 2.0);
  assert.equal(carlos.horasAtencionCliente, 1.0);
  assert.equal(carlos.horasProduccion, 1.0);
  assert.equal(carlos.horasOtros, 1.0);
  assert.equal(carlos.horasTotales, 5.0);

  // Porcentajes: 2/5 = 40%, 1/5 = 20% cada una de las otras 3
  assert.equal(carlos.porcentajes.armado, 40);
  assert.equal(carlos.porcentajes.atencionCliente, 20);
  assert.equal(carlos.porcentajes.produccion, 20);
  assert.equal(carlos.porcentajes.otros, 20);

  // Comprobar items para el gráfico de torta
  assert.equal(carlos.itemsGrafico.length, 4);
  assert.equal(carlos.itemsGrafico[0].name, 'Armado de Pedidos');
  assert.equal(carlos.itemsGrafico[0].value, 2.0);
});

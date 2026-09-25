// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularDistribucionTareasPorEmpleado,
  formatearPorcentajeTarea,
} from './calcularDistribucionTareas.ts';
import type { RegistroArmadoDocumento } from '../types/armado.ts';

test('formatearPorcentajeTarea no redondea a 100% o 0% si hay horas reales pequeñas', () => {
  // 1251.3 hs de 1251.6 hs totales
  const pArmado = formatearPorcentajeTarea(1251.3, 1251.6);
  assert.equal(pArmado, '99.98%');

  // 0.3 hs de 1251.6 hs totales
  const pAtencion = formatearPorcentajeTarea(0.3, 1251.6);
  assert.equal(pAtencion, '0.02%');

  // Enteros limpios
  assert.equal(formatearPorcentajeTarea(50, 100), '50%');
  assert.equal(formatearPorcentajeTarea(0, 100), '0%');
  assert.equal(formatearPorcentajeTarea(100, 100), '100%');
});

test('calcularDistribucionTareasPorEmpleado desglosa con exactitud horas y porcentajes con decimales', () => {
  const mockDocs: RegistroArmadoDocumento[] = [
    {
      id: 'doc-1',
      empleadoHeader: 'CARLOS',
      fechaPrimeraFila: '2026-09-01',
      horaInicioPrimeraFila: '08:00',
      estado: 'verificado',
      creadoEn: '2026-09-01T08:00:00Z',
      filas: [
        {
          id: 'f1',
          fecha: '2026-09-01',
          horaInicio: '08:00',
          horaFin: '10:00', // 2 hs
          cantArticulos: 100,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'armado',
        },
        {
          id: 'f2',
          fecha: '2026-09-01',
          horaInicio: '10:00',
          horaFin: '11:00', // 1 hs
          cantArticulos: 0,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'atencion_cliente',
        },
        {
          id: 'f3',
          fecha: '2026-09-01',
          horaInicio: '11:00',
          horaFin: '12:00', // 1 hs
          cantArticulos: 0,
          notaIrregularidad: null,
          esIrregular: false,
          tipoTarea: 'produccion',
        },
        {
          id: 'f4',
          fecha: '2026-09-01',
          horaInicio: '12:00',
          horaFin: '13:00', // 1 hs
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

  // Porcentajes
  assert.equal(carlos.itemsGrafico[0].porcentajeTexto, '40%');
  assert.equal(carlos.itemsGrafico[1].porcentajeTexto, '20%');
  assert.equal(carlos.itemsGrafico[2].porcentajeTexto, '20%');
  assert.equal(carlos.itemsGrafico[3].porcentajeTexto, '20%');

  // Comprobar items para el gráfico de torta
  assert.equal(carlos.itemsGrafico.length, 4);
  assert.equal(carlos.itemsGrafico[0].name, 'Armado de Pedidos');
  assert.equal(carlos.itemsGrafico[0].value, 2.0);
});

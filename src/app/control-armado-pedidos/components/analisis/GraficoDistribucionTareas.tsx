// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useMemo } from 'react';
import type { RegistroArmadoDocumento } from '../../types/armado';
import { calcularDistribucionTareasPorEmpleado, COLORES_TAREAS } from '../../utils/calcularDistribucionTareas';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Clock, Users, User } from 'lucide-react';

interface GraficoDistribucionTareasProps {
  registros: RegistroArmadoDocumento[];
}

export function GraficoDistribucionTareas({ registros }: GraficoDistribucionTareasProps) {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('todos');

  const distribuciones = useMemo(() => {
    return calcularDistribucionTareasPorEmpleado(registros);
  }, [registros]);

  const empleadosDisponibles = useMemo(() => {
    return distribuciones.map((d) => d.empleado);
  }, [distribuciones]);

  // Si se selecciona "todos", calcular consolidado
  const datosDistribucion = useMemo(() => {
    if (distribuciones.length === 0) return null;

    if (empleadoSeleccionado !== 'todos') {
      return distribuciones.find((d) => d.empleado === empleadoSeleccionado) || null;
    }

    // Consolidado de todo el equipo
    let armHs = 0;
    let atenHs = 0;
    let prodHs = 0;
    let otrHs = 0;

    distribuciones.forEach((d) => {
      armHs += d.horasArmado;
      atenHs += d.horasAtencionCliente;
      prodHs += d.horasProduccion;
      otrHs += d.horasOtros;
    });

    const arm = Math.round(armHs * 10) / 10;
    const aten = Math.round(atenHs * 10) / 10;
    const prod = Math.round(prodHs * 10) / 10;
    const otr = Math.round(otrHs * 10) / 10;
    const tot = Math.round((arm + aten + prod + otr) * 10) / 10;

    const calcP = (v: number) => (tot > 0 ? Math.round((v / tot) * 100) : 0);

    return {
      empleado: 'Equipo Completo',
      horasArmado: arm,
      horasAtencionCliente: aten,
      horasProduccion: prod,
      horasOtros: otr,
      horasTotales: tot,
      porcentajes: {
        armado: calcP(arm),
        atencionCliente: calcP(aten),
        produccion: calcP(prod),
        otros: calcP(otr),
      },
      itemsGrafico: [
        { name: 'Armado de Pedidos', value: arm, color: COLORES_TAREAS.armado, porcentaje: calcP(arm) },
        { name: 'Atención al Cliente', value: aten, color: COLORES_TAREAS.atencionCliente, porcentaje: calcP(aten) },
        { name: 'Producción', value: prod, color: COLORES_TAREAS.produccion, porcentaje: calcP(prod) },
        { name: 'Otras Tareas', value: otr, color: COLORES_TAREAS.otros, porcentaje: calcP(otr) },
      ],
    };
  }, [distribuciones, empleadoSeleccionado]);

  if (!datosDistribucion || datosDistribucion.horasTotales === 0) {
    return null;
  }

  const itemsConHoras = datosDistribucion.itemsGrafico.filter((it) => it.value > 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-[#1C1C1E] space-y-4">
      {/* Encabezado y Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <PieIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Distribución del Tiempo por Tarea
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Proporción de horas dedicadas a armado vs. atención a clientes, producción y otras tareas
            </p>
          </div>
        </div>

        {/* Selector de armador */}
        <div className="flex items-center space-x-2">
          {empleadoSeleccionado === 'todos' ? (
            <Users className="h-4 w-4 text-blue-500" />
          ) : (
            <User className="h-4 w-4 text-blue-500" />
          )}
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-2xs"
          >
            <option value="todos">Equipo Completo (Consolidado)</option>
            {empleadosDisponibles.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido: Gráfico + Indicadores de Tareas */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        {/* Gráfico de Torta */}
        <div className="h-64 w-full lg:col-span-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={itemsConHoras}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {itemsConHoras.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#1C1C1E" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-700 bg-[#1C1C1E] p-3 text-xs text-white shadow-xl">
                        <p className="font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
                          {data.name}
                        </p>
                        <p className="text-gray-300 mt-1">{data.value} horas ({data.porcentaje}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tarjetas / Chips de Desglose */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Total de Horas Registradas:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {datosDistribucion.horasTotales} hs
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {datosDistribucion.itemsGrafico.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800/80 dark:bg-gray-900/40"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{item.value} hs</div>
                  </div>
                </div>
                <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-gray-700 shadow-2xs dark:bg-gray-800 dark:text-gray-200">
                  {item.porcentaje}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

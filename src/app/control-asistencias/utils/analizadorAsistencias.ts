import type { TimeHHMM, AttendanceEvent, DayAnalysisRow, AsistenciaConfig } from '../types/asistencias';
import type { ExcelRow } from '@/app/stores/estimarDemandaStore';

export function toHHMMFromAny(value: unknown): TimeHHMM | undefined {
  if (!value && value !== 0) return undefined;
  const s = String(value).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m) {
    const h = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    const hi = parseInt(h, 10);
    const mi = parseInt(mm, 10);
    if (hi >= 0 && hi < 24 && mi >= 0 && mi < 60) return `${h}:${mm}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2, '0');
      const m2 = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m2}`;
    }
  }
  return undefined;
}

export function toYYYYMMDDFromAny(value: unknown): string | undefined {
  if (!value && value !== 0) return undefined;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (m) {
    const dd = String(m[1]).padStart(2, '0');
    const mm = String(m[2]).padStart(2, '0');
    let yyyy = m[3];
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  }
  return undefined;
}

export function minutesOfDay(hhmm: TimeHHMM): number {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

export function dayOfWeekFromYYYYMMDD(fecha: string): number {
  const parts = fecha.split('-').map((x) => parseInt(x, 10));
  const y = parts[0] || 1970;
  const m = (parts[1] || 1) - 1;
  const d = parts[2] || 1;
  const dt = new Date(y, m, d);
  return dt.getDay(); // 0=Dom ... 6=Sab
}

export function generarEventosNormalizados(
  fichadasData: ExcelRow[],
  config: AsistenciaConfig
): AttendanceEvent[] {
  const map = config.mapeo;
  if (!map) return [];

  const grupos = new Map<string, { empleado: string; fecha: string; horas: TimeHHMM[] }>();

  fichadasData.forEach((row) => {
    const empleado = String(row[map.empleado] ?? '').trim();
    const fechaStr = toYYYYMMDDFromAny(row[map.fecha]);
    const horaStr = toHHMMFromAny(row[map.hora]);
    if (!empleado || !fechaStr || !horaStr) return;
    const key = `${empleado}|${fechaStr}`;
    if (!grupos.has(key)) grupos.set(key, { empleado, fecha: fechaStr, horas: [] });
    grupos.get(key)!.horas.push(horaStr);
  });

  const eventos: AttendanceEvent[] = [];

  for (const { empleado, fecha, horas } of grupos.values()) {
    horas.sort();
    const perEmp = config.horariosPorEmpleado[empleado] || {};
    const entradaProg = perEmp.entrada || config.defaults.entrada;
    const salidaProg = perEmp.salida || config.defaults.salida;
    const almInicio = perEmp.almuerzoInicio || config.defaults.almuerzoInicio;
    const almFin = perEmp.almuerzoFin || config.defaults.almuerzoFin;

    const n = horas.length;
    const asignados: ('Entrada' | 'Salida')[] = new Array(n);

    if (n === 1) {
      const t = horas[0];
      const dIn = Math.abs(minutesOfDay(t) - minutesOfDay(entradaProg));
      const dOut = Math.abs(minutesOfDay(t) - minutesOfDay(salidaProg));
      asignados[0] = dIn <= dOut ? 'Entrada' : 'Salida';
    } else if (n === 2) {
      asignados[0] = 'Entrada';
      asignados[1] = 'Salida';
    } else if (n === 3) {
      asignados[0] = 'Entrada';
      asignados[2] = 'Salida';
      const t2 = horas[1];
      const dStart = Math.abs(minutesOfDay(t2) - minutesOfDay(almInicio));
      const dEnd = Math.abs(minutesOfDay(t2) - minutesOfDay(almFin));
      asignados[1] = dStart <= dEnd ? 'Salida' : 'Entrada';
    } else {
      asignados[0] = 'Entrada';
      asignados[n - 1] = 'Salida';
      for (let i = 1; i <= n - 2; i++) {
        asignados[i] = i % 2 === 1 ? 'Salida' : 'Entrada';
      }
    }

    for (let i = 0; i < n; i++) {
      eventos.push({ empleado, fecha, hora: horas[i], tipo: asignados[i] });
    }
  }

  return eventos.sort((a, b) => 
    a.empleado.localeCompare(b.empleado) || 
    a.fecha.localeCompare(b.fecha) || 
    a.hora.localeCompare(b.hora)
  );
}

export function analizarDia(
  eventos: AttendanceEvent[],
  empleado: string,
  fecha: string,
  cfg: AsistenciaConfig
): DayAnalysisRow {
  const perEmp = cfg.horariosPorEmpleado[empleado] || {};
  const entradaProg = perEmp.entrada || cfg.defaults.entrada;
  const salidaProg = perEmp.salida || cfg.defaults.salida;
  const almInicio = perEmp.almuerzoInicio || cfg.defaults.almuerzoInicio;
  const almFin = perEmp.almuerzoFin || cfg.defaults.almuerzoFin;
  const almDurDef = perEmp.almuerzoDuracionMin ?? cfg.defaults.almuerzoDuracionMin;

  const todays = eventos.filter((e) => e.empleado === empleado && e.fecha === fecha);
  const dow = dayOfWeekFromYYYYMMDD(fecha);
  const francosSet = new Set<number>([...(cfg.defaults.francos || []), ...((perEmp.francosExtra || []) as number[])]);
  const esFranco = francosSet.has(dow);
  const ausente = todays.length === 0 && !esFranco;
  const entradas = todays.filter((e) => e.tipo === 'Entrada').map((e) => e.hora);
  const salidas = todays.filter((e) => e.tipo === 'Salida').map((e) => e.hora);

  const firstIn = entradas[0];
  const lastOut = salidas[salidas.length - 1];

  const tardanzaMin = firstIn ? Math.max(0, minutesOfDay(firstIn) - minutesOfDay(entradaProg)) : 0;
  const retiroAnticipadoMin = lastOut ? Math.max(0, minutesOfDay(salidaProg) - minutesOfDay(lastOut)) : 0;

  let almSalida: TimeHHMM | undefined;
  let almEntrada: TimeHHMM | undefined;
  for (const s of salidas) {
    if (minutesOfDay(s) >= minutesOfDay(almInicio) && minutesOfDay(s) <= minutesOfDay(almFin)) {
      almSalida = s;
      almEntrada = entradas.find((h) => minutesOfDay(h) > minutesOfDay(s));
      break;
    }
  }

  const almuerzoDuracionMin = almSalida && almEntrada ? (minutesOfDay(almEntrada) - minutesOfDay(almSalida)) : undefined;
  const almuerzoFueraFranja = !!(
    (almSalida && (minutesOfDay(almSalida) < minutesOfDay(almInicio) || minutesOfDay(almSalida) > minutesOfDay(almFin))) ||
    (almEntrada && (minutesOfDay(almEntrada) < minutesOfDay(almInicio) || minutesOfDay(almEntrada) > minutesOfDay(almFin)))
  );
  const almuerzoExcedido = almuerzoDuracionMin !== undefined ? almuerzoDuracionMin > almDurDef : false;

  return {
    empleado,
    fecha,
    horaEntrada: firstIn,
    horaSalida: lastOut,
    entradaProgramada: entradaProg,
    salidaProgramada: salidaProg,
    tardanzaMin,
    retiroAnticipadoMin,
    almuerzoInicio: almSalida,
    almuerzoFin: almEntrada,
    almuerzoDuracionMin,
    almuerzoFueraFranja,
    almuerzoExcedido,
    ausente,
  };
}

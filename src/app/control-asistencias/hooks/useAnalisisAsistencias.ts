import { useMemo, useState } from 'react';
import { useAsistenciasStore, analizarDia, DayAnalysisRow } from '@/app/stores/asistenciasStore';

function isoDow(iso: string): number {
  if (!iso) return 0;
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(y || 1970, (m || 1) - 1, d || 1);
  return dt.getDay();
}

export function useAnalisisAsistencias() {
  const { setStep, empleados, eventos, config } = useAsistenciasStore();
  const [empleadoSel, setEmpleadoSel] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [filtroTarde, setFiltroTarde] = useState(true);
  const [filtroRetiro, setFiltroRetiro] = useState(true);
  const [filtroAlmFranja, setFiltroAlmFranja] = useState(true);
  const [filtroAlmExced, setFiltroAlmExced] = useState(true);

  const empleadosOptions = useMemo(() => ['(Todos)', ...empleados], [empleados]);

  const allFechas = useMemo(() => Array.from(new Set(eventos.map((e) => e.fecha))).sort(), [eventos]);

  const fullRangeDates = useMemo(() => {
    if (allFechas.length === 0) return [] as string[];
    const start = allFechas[0];
    const end = allFechas[allFechas.length - 1];
    const a = new Date(start);
    const b = new Date(end);
    const out: string[] = [];
    const cur = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    while (cur <= b) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      out.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [allFechas]);

  const selectedDates = useMemo(() => {
    if (!dateFrom && !dateTo) return [] as string[];
    const start = dateFrom || dateTo;
    const end = dateTo || dateFrom;
    if (!start) return [] as string[];
    if (start === end) return [start];
    const a = new Date(start);
    const b = new Date(end);
    const s = a <= b ? a : b;
    const e = a <= b ? b : a;
    const out: string[] = [];
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    while (cur <= e) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      out.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [dateFrom, dateTo]);

  const isTodos = !empleadoSel || empleadoSel === '(Todos)';

  const baseFechasForKpi = useMemo(() => {
    if (!config?.mapeo) return [] as string[];
    const francos = config.defaults.francos || [];
    const base = selectedDates.length > 0 ? selectedDates : fullRangeDates;
    return base.filter((f) => !francos.includes(isoDow(f)));
  }, [config, selectedDates, fullRangeDates]);

  const analisisEmpleado: DayAnalysisRow[] = useMemo(() => {
    const emp = empleadoSel && empleadoSel !== '(Todos)' ? empleadoSel : empleados[0];
    if (!emp || !config?.mapeo) return [];
    const francos = config.defaults.francos || [];
    const base = selectedDates.length > 0 ? selectedDates : fullRangeDates;
    const fechas = base.filter((f) => !francos.includes(isoDow(f)));
    return fechas.map((f) => analizarDia(eventos, emp, f, config));
  }, [empleadoSel, empleados, eventos, config, selectedDates, fullRangeDates]);

  const analisisTodos: DayAnalysisRow[] = useMemo(() => {
    if (!config?.mapeo) return [];
    const francos = config.defaults.francos || [];
    const base = selectedDates.length > 0 ? selectedDates : fullRangeDates;
    const fechas = base.filter((f) => !francos.includes(isoDow(f)));
    const rows: DayAnalysisRow[] = [];
    empleados.forEach((emp) => {
      fechas.forEach((f) => {
        rows.push(analizarDia(eventos, emp, f, config));
      });
    });
    return rows;
  }, [config, empleados, eventos, selectedDates, fullRangeDates]);

  const kpis = useMemo(() => {
    const baseRows = isTodos ? analisisTodos : analisisEmpleado;
    const total = isTodos ? baseFechasForKpi.length : baseRows.length;
    const tardes = baseRows.filter((d) => d.tardanzaMin > 0).length;
    const retiros = baseRows.filter((d) => d.retiroAnticipadoMin > 0).length;
    const almFuera = baseRows.filter((d) => d.almuerzoFueraFranja).length;
    const almExced = baseRows.filter((d) => d.almuerzoExcedido).length;
    const ausentes = baseRows.filter((d) => d.ausente).length;
    const promTarde = Math.round(
      baseRows.reduce((acc, x) => acc + (x.tardanzaMin || 0), 0) / (total || 1)
    );
    return { total, tardes, retiros, almFuera, almExced, promTarde, ausentes };
  }, [isTodos, analisisEmpleado, analisisTodos, baseFechasForKpi]);

  const violacionesGlobales = useMemo(() => {
    if (!config?.mapeo) return [] as DayAnalysisRow[];
    const setPairs = new Set<string>();
    const rows: DayAnalysisRow[] = [];
    empleados.forEach((emp) => {
      const francos = config.defaults.francos || [];
      const base = selectedDates.length > 0 ? selectedDates : fullRangeDates;
      const fechas = base.filter((f) => !francos.includes(isoDow(f)));
      fechas.forEach((f) => {
        const row = analizarDia(eventos, emp, f, config);
        const key = `${emp}|${f}`;
        if (!setPairs.has(key)) {
          setPairs.add(key);
          rows.push(row);
        }
      });
    });
    return rows
      .filter(
        (r) =>
          (filtroTarde && r.tardanzaMin > 0) ||
          (filtroRetiro && r.retiroAnticipadoMin > 0) ||
          (filtroAlmFranja && r.almuerzoFueraFranja) ||
          (filtroAlmExced && r.almuerzoExcedido)
      )
      .sort((a, b) => a.empleado.localeCompare(b.empleado) || a.fecha.localeCompare(b.fecha));
  }, [config, empleados, eventos, filtroTarde, filtroRetiro, filtroAlmFranja, filtroAlmExced, selectedDates, fullRangeDates]);

  const ausenciasDetalle = useMemo(() => {
    if (!config?.mapeo) return [] as { empleado: string; cantidad: number; fechas: string[] }[];
    const francos = config.defaults.francos || [];
    const baseBase = selectedDates.length > 0 ? selectedDates : fullRangeDates;
    const baseFechas = baseBase.filter((f) => !francos.includes(isoDow(f)));
    const out: { empleado: string; cantidad: number; fechas: string[] }[] = [];
    empleados.forEach((emp) => {
      const faltas: string[] = [];
      baseFechas.forEach((f) => {
        const row = analizarDia(eventos, emp, f, config);
        if (row.ausente) faltas.push(f);
      });
      if (faltas.length > 0) out.push({ empleado: emp, cantidad: faltas.length, fechas: faltas.sort() });
    });
    return out.sort((a, b) => a.empleado.localeCompare(b.empleado));
  }, [config, empleados, eventos, selectedDates, fullRangeDates]);

  return {
    setStep,
    config,
    empleadoSel,
    setEmpleadoSel,
    empleadosOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filtroTarde,
    setFiltroTarde,
    filtroRetiro,
    setFiltroRetiro,
    filtroAlmFranja,
    setFiltroAlmFranja,
    filtroAlmExced,
    setFiltroAlmExced,
    analisisEmpleado,
    kpis,
    violacionesGlobales,
    ausenciasDetalle,
  };
}

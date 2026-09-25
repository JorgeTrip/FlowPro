import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { DayAnalysisRow, AsistenciaConfig } from '../types/asistencias';
import { dayName } from '../components/TablasAsistenciasUI';

export async function exportDashboardExcel(
  analisisEmpleado: DayAnalysisRow[],
  empleado?: string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Dashboard - ${empleado || 'Empleado'}`);
  ws.columns = [
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Día', key: 'dia', width: 8 },
    { header: 'Entrada prog.', key: 'entProg', width: 14 },
    { header: 'Entrada real', key: 'entReal', width: 14 },
    { header: 'Tardanza (min)', key: 'tard', width: 14 },
    { header: 'Salida prog.', key: 'salProg', width: 14 },
    { header: 'Salida real', key: 'salReal', width: 14 },
    { header: 'Retiro ant. (min)', key: 'retiro', width: 18 },
    { header: 'Alm. salida', key: 'almOut', width: 14 },
    { header: 'Alm. entrada', key: 'almIn', width: 14 },
    { header: 'Duración alm. (min)', key: 'almDur', width: 20 },
    { header: 'Alm. fuera franja', key: 'almFranja', width: 20 },
    { header: 'Alm. excedido', key: 'almExc', width: 16 },
    { header: 'Ausente', key: 'aus', width: 10 },
  ];
  analisisEmpleado.forEach((r) => {
    ws.addRow({
      fecha: r.fecha,
      dia: dayName(r.fecha),
      entProg: r.entradaProgramada,
      entReal: r.horaEntrada || '-',
      tard: r.tardanzaMin || 0,
      salProg: r.salidaProgramada,
      salReal: r.horaSalida || '-',
      retiro: r.retiroAnticipadoMin || 0,
      almOut: r.almuerzoInicio || '-',
      almIn: r.almuerzoFin || '-',
      almDur: r.almuerzoDuracionMin ?? '-',
      almFranja: r.almuerzoFueraFranja ? 'Sí' : 'No',
      almExc: r.almuerzoExcedido ? 'Sí' : 'No',
      aus: r.ausente ? 'Sí' : 'No',
    });
  });
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `asistencias-dashboard-${empleado || 'empleado'}.xlsx`);
}

export async function exportGlobalExcel(
  violacionesGlobales: DayAnalysisRow[],
  defaults: AsistenciaConfig['defaults']
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Desvíos');
  ws.columns = [
    { header: 'Empleado', key: 'emp', width: 28 },
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Día', key: 'dia', width: 8 },
    { header: 'Desvío', key: 'desvio', width: 22 },
    { header: 'Programado', key: 'prog', width: 20 },
    { header: 'Real', key: 'real', width: 20 },
    { header: 'Minutos', key: 'min', width: 10 },
  ];
  violacionesGlobales.forEach((r) => {
    const desvio = r.tardanzaMin > 0
      ? 'Llegada tarde'
      : r.retiroAnticipadoMin > 0
        ? 'Salida antes'
        : r.almuerzoFueraFranja
          ? 'Almuerzo fuera franja'
          : 'Almuerzo excedido';
    let programado = '-';
    let real = '-';
    let minutos: number | undefined = undefined;
    if (desvio === 'Llegada tarde') {
      programado = r.entradaProgramada;
      real = r.horaEntrada || '-';
      minutos = r.tardanzaMin;
    } else if (desvio === 'Salida antes') {
      programado = r.salidaProgramada;
      real = r.horaSalida || '-';
      minutos = r.retiroAnticipadoMin;
    } else if (desvio === 'Almuerzo fuera franja') {
      programado = `${defaults.almuerzoInicio} - ${defaults.almuerzoFin}`;
      real = `${r.almuerzoInicio || '-'} - ${r.almuerzoFin || '-'}`;
      minutos = r.almuerzoDuracionMin;
    } else if (desvio === 'Almuerzo excedido') {
      programado = `${defaults.almuerzoDuracionMin} min`;
      real = r.almuerzoDuracionMin !== undefined ? `${r.almuerzoDuracionMin} min` : '-';
      minutos = r.almuerzoDuracionMin;
    }
    ws.addRow({ emp: r.empleado, fecha: r.fecha, dia: dayName(r.fecha), desvio, prog: programado, real, min: minutos ?? 0 });
  });
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `asistencias-desvios.xlsx`);
}

export async function exportAusenciasExcel(
  ausenciasDetalle: { empleado: string; cantidad: number; fechas: string[] }[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Ausencias');
  ws.columns = [
    { header: 'Empleado', key: 'emp', width: 28 },
    { header: 'Cantidad', key: 'cant', width: 10 },
    { header: 'Fechas', key: 'fechas', width: 60 },
  ];
  ausenciasDetalle.forEach((a) => {
    const fechas = a.fechas.map((f) => `${f} (${dayName(f)})`).join(', ');
    ws.addRow({ emp: a.empleado, cant: a.cantidad, fechas });
  });
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `asistencias-ausencias.xlsx`);
}

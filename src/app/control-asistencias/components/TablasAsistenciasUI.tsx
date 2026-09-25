import React from 'react';

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function dayName(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias[dt.getDay()];
}

export function renderFecha(f: string): string {
  return `${f} (${dayName(f)})`;
}

export function formatMin(m?: number): string {
  return m !== undefined ? `${m} min` : '-';
}

export function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

export function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={classNames("px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={classNames("px-4 py-2 text-sm text-gray-900 dark:text-gray-100", className)}>{children}</td>;
}

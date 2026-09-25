// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ChartData {
  name: string;
  count: number;
  fill: string;
}

export const DemandaStockChart = ({ data }: { data: ChartData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip
        contentStyle={{
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          borderColor: '#4b5563',
        }}
        labelStyle={{ color: '#f3f4f6' }}
      />
      <Bar dataKey="count" name="N° de Productos">
        <LabelList dataKey="count" position="insideTop" fill="#fff" fontSize={12} fontWeight="bold" />
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

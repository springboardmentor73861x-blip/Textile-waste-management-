"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface CategoryData {
  category: string;
  count: number;
}

interface Props {
  data: CategoryData[];
}

export default function CategoryChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-6 text-xl font-bold">
        Inventory by Category
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="category" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
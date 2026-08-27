import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 shadow-md p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center text-white ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
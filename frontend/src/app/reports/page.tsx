"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Recycle,
  Leaf,
  Scale,
  Layers,
  CheckCircle2,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  ClassificationService,
  WasteReportData,
} from "@/services/classification.service";

const COLORS = [
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
];

export default function ReportsPage() {
  const [report, setReport] = useState<WasteReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ClassificationService.getWasteReport();
      setReport(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load waste classification report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob = await ClassificationService.exportWasteReportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "textile_waste_audit_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Audit & Compliance System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Textile Waste Classification & Recyclability Audit Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive analysis of platform waste streams, material recyclability scores, and carbon offset savings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Refresh Report"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleExportCsv}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV Audit Report
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Generating Audit Report...</p>
          </div>
        ) : report ? (
          <>
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
                  <Layers className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {report.summary_metrics.total_items_analyzed.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-gray-400 block mt-1">
                  Garments & Fabrics Analyzed
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Weight</span>
                  <Scale className="w-5 h-5 text-cyan-500" />
                </div>
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {report.summary_metrics.total_weight_kg.toLocaleString()} kg
                </span>
                <span className="text-xs font-semibold text-gray-400 block mt-1">
                  Total Textile Mass Evaluated
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Recyclability Score</span>
                  <Recycle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {report.summary_metrics.overall_recyclability_score}%
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-md">
                    Grade {report.summary_metrics.overall_recyclability_grade}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-400 block mt-1">
                  Landfill Diversion Rate
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Carbon Offset</span>
                  <Leaf className="w-5 h-5 text-teal-500" />
                </div>
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                  {report.summary_metrics.total_co2_emissions_offset_kg.toLocaleString()} kg
                </span>
                <span className="text-xs font-semibold text-gray-400 block mt-1">
                  CO2 Emissions Saved
                </span>
              </div>
            </div>

            {/* Recharts Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Category Weight Distribution (kg)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.category_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="fabric_category" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="total_weight_kg" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-teal-600" />
                  Material Composition Breakdown
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.category_breakdown}
                        dataKey="total_weight_kg"
                        nameKey="fabric_category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {report.category_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Detailed Waste Stream Breakdown
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Fabric Category</th>
                      <th className="px-6 py-4">Item Count</th>
                      <th className="px-6 py-4">Weight (kg)</th>
                      <th className="px-6 py-4">% Share</th>
                      <th className="px-6 py-4">Industrial Waste Stream</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">CO2 Saved (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {report.category_breakdown.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          {row.fabric_category}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                          {row.item_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">
                          {row.total_weight_kg.toLocaleString()} kg
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {row.percentage_of_total}%
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-xs max-w-xs truncate">
                          {row.waste_stream}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700">
                            {row.recyclability_grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-teal-600">
                          {row.estimated_co2_saved_kg.toLocaleString()} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Strategic Landfill Diversion Recommendations
              </h3>
              <ul className="space-y-2 text-emerald-100 text-sm">
                {report.strategic_recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
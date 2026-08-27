"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AnalyticsService, CircularEconomyAnalyticsData } from "@/services/analytics.service";
import { PieChart as PieIcon, TrendingUp, DollarSign, Activity, RefreshCw, Layers, ShieldCheck, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<CircularEconomyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await AnalyticsService.getCircularEconomyAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load circular economy analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#6366F1"];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Circular Economy Analytics
              </h1>
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-300 dark:border-indigo-800">
                <Activity className="w-3.5 h-3.5" /> Analytics Completed
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Material Circularity Indicator (MCI) metrics, closed-loop vs open-loop proportions, 6-month impact trends, and economic value recovery analytics.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="self-start md:self-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Analytics
          </button>
        </div>

        {/* Top Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/30 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/60 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Unlocked Economic Value</span>
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    ${data.summary.total_economic_value_unlocked_usd.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> ${data.summary.avg_value_recovery_per_kg_usd}/kg avg recovery
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-900/30 dark:to-purple-900/10 border border-indigo-200 dark:border-indigo-800/60 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">MCI Circularity Score</span>
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {data.summary.overall_mci_score} <span className="text-lg font-medium text-gray-500">/ 100</span>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {data.summary.mci_tier}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-900/30 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/60 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Textile Processed</span>
                  <div className="p-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {data.summary.total_textile_analyzed_kg.toLocaleString()} <span className="text-lg font-medium text-gray-500">kg</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    {data.summary.total_items_count} items categorized
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/30 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/60 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Landfill Diversion Rate</span>
                  <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {data.summary.landfill_diversion_rate_pct}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    {data.summary.landfill_volume_diverted_m3} m³ space saved
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Historical Impact Trend Graph */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  6-Month Environmental Impact Trend Trajectory
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Cumulative CO₂ offset (tons) and Water savings (Million Liters) over time.
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.impact_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="co2_saved_tons"
                        name="CO₂ Saved (tons)"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="water_saved_million_liters"
                        name="Water Saved (M Liters)"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Loop Proportions Donut Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Circular Loop Category Distribution
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Proportional allocation across closed-loop, direct upcycling, and open-loop cascades.
                </p>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.loop_distribution}
                        dataKey="percentage"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {data.loop_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                        formatter={(val: any) => [`${val}%`, "Proportion"]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Waste Stream Flow Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Waste Stream Flow Matrix & Offtaker Allocation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Detailed mapping of inventory categories to recommended circular pathways, partner sectors, and economic yields.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3">Source Fabric</th>
                      <th className="px-4 py-3">Volume (kg)</th>
                      <th className="px-4 py-3">Recommended Pathway</th>
                      <th className="px-4 py-3">Target Offtaker Sector</th>
                      <th className="px-4 py-3">Projected Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                    {data.waste_stream_flows.map((flow, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                          {flow.source_material.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          {flow.quantity_kg} kg
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {flow.recommended_pathway}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                          {flow.target_offtaker}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${flow.projected_value_usd.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
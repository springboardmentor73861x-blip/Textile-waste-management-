"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SustainabilityService, SustainabilitySummaryData, LCAScenarioResponse, ItemImpactData } from "@/services/sustainability.service";
import { Leaf, Droplets, Trash2, ShieldCheck, Zap, RefreshCw, BarChart3, Sliders, CheckCircle2, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

export default function SustainabilityPage() {
  const [summary, setSummary] = useState<SustainabilitySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [footprintData, setFootprintData] = useState<Record<string, ItemImpactData>>({});

  // LCA Calculator interactive state
  const [calcFabric, setCalcFabric] = useState("Denim");
  const [calcWeight, setCalcWeight] = useState(50);
  const [calcCondition, setCalcCondition] = useState("Good");
  const [calcPathway, setCalcPathway] = useState("mechanical_recycling");
  const [lcaResult, setLcaResult] = useState<LCAScenarioResponse | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    handleRunCalculator();
  }, [calcFabric, calcWeight, calcCondition, calcPathway]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sumData, fpData] = await Promise.all([
        SustainabilityService.getSummary(),
        SustainabilityService.getFootprintBreakdown(),
      ]);
      setSummary(sumData);
      setFootprintData(fpData.footprint_breakdown);
    } catch (err) {
      console.error("Failed to load sustainability metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCalculator = async () => {
    try {
      setCalcLoading(true);
      const res = await SustainabilityService.calculateLCA(calcFabric, calcWeight, calcPathway, calcCondition);
      setLcaResult(res);
    } catch (err) {
      console.error("LCA calculation failed:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  const fabricOptions = [
    "Denim", "Terrycloth", "Fleece_Pile", "Corduroy_Ribbed", "Woven_Smooth", "Glossy_Fine", "Wool_Textured"
  ];

  const conditionOptions = ["New", "Excellent", "Good", "Fair", "Poor", "Damaged"];

  const pathwayOptions = [
    { id: "mechanical_recycling", label: "Mechanical Re-spinning" },
    { id: "upcycling", label: "Upcycling & Resale" },
    { id: "chemical_recycling", label: "Chemical Depolymerization" },
    { id: "landfill", label: "Landfill Baseline" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sustainability Intelligence Engine
              </h1>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Operational
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Life Cycle Assessment (LCA) environmental impact benchmarks, carbon footprint offsets, water conservation models, and resource circularity indicators.
            </p>
          </div>
          <button
            onClick={fetchInitialData}
            className="self-start md:self-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Intelligence
          </button>
        </div>

        {/* Executive KPI Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/30 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total CO₂ Offset</span>
                <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.total_co2_offset_kg.toLocaleString()} <span className="text-lg font-medium text-gray-500">kg</span>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Equivalent to {(summary.total_co2_offset_kg * 0.045).toFixed(0)} tree-years
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-900/30 dark:to-cyan-900/10 border border-blue-200 dark:border-blue-800/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Water Conserved</span>
                <div className="p-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {(summary.total_water_saved_liters / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg font-medium text-gray-500">kL</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {summary.total_water_saved_liters.toLocaleString()} Liters saved vs virgin
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 dark:from-purple-900/30 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-800/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Landfill Volume Diverted</span>
                <div className="p-2.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.landfill_volume_diverted_m3} <span className="text-lg font-medium text-gray-500">m³</span>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {summary.landfill_diversion_rate_pct} Landfill Diversion Rate
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/30 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/60 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Material Circularity Index</span>
                <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.overall_mci_score} <span className="text-lg font-medium text-gray-500">/ 100</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {summary.mci_tier}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Interactive LCA Scenario Calculator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Interactive Life Cycle Assessment (LCA) Simulator
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Simulate comparative carbon and water impacts across Virgin Production, Mechanical Recycling, Upcycling, and Landfill.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inputs Column */}
            <div className="space-y-5 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-xl border border-gray-200/60 dark:border-gray-700/50">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Fabric Material Class
                </label>
                <select
                  value={calcFabric}
                  onChange={(e) => setCalcFabric(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {fabricOptions.map((f) => (
                    <option key={f} value={f}>
                      {f.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Batch Weight (kg)
                  </label>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {calcWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Garment Condition
                </label>
                <select
                  value={calcCondition}
                  onChange={(e) => setCalcCondition(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {conditionOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Target Processing Pathway
                </label>
                <div className="space-y-2">
                  {pathwayOptions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCalcPathway(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between border ${
                        calcPathway === p.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-500"
                      }`}
                    >
                      {p.label}
                      {calcPathway === p.id && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {calcLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Simulating LCA Pathways...
                </div>
              ) : lcaResult ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">CO₂ Saved</span>
                      <span className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                        {lcaResult.item_impact.co2_saved_kg} kg
                      </span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block">Water Saved</span>
                      <span className="text-xl font-bold text-blue-900 dark:text-blue-200">
                        {lcaResult.item_impact.water_saved_liters.toLocaleString()} L
                      </span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 block">Energy Saved</span>
                      <span className="text-xl font-bold text-purple-900 dark:text-purple-200">
                        {lcaResult.item_impact.energy_saved_kwh} kWh
                      </span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">MCI Rating</span>
                      <span className="text-xl font-bold text-amber-900 dark:text-amber-200">
                        {lcaResult.item_impact.mci_score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Scenario Bar Comparison Chart */}
                  <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                      Comparative Carbon Emissions (kg CO₂e) Across Scenarios
                    </h3>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={lcaResult.lca_scenarios.all_scenarios}
                          margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                        >
                          <XAxis
                            dataKey="scenario_name"
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            interval={0}
                            angle={-10}
                            textAnchor="end"
                          />
                          <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1E293B", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                            formatter={(val: any) => [`${val} kg CO₂`, "Emissions"]}
                          />
                          <Bar dataKey="co2_emissions_kg" radius={[6, 6, 0, 0]}>
                            {lcaResult.lca_scenarios.all_scenarios.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.scenario_name.includes("Landfill")
                                    ? "#EF4444"
                                    : entry.scenario_name.includes("Virgin")
                                    ? "#F59E0B"
                                    : entry.scenario_name.includes("Upcycling")
                                    ? "#10B981"
                                    : "#3B82F6"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Material Footprint Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Material LCA Footprint Matrix (per 100 kg batch)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Baseline environmental savings factors across all supported textile macro-categories.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">Fabric Class</th>
                  <th className="px-4 py-3">Circularity Tier</th>
                  <th className="px-4 py-3">CO₂ Saved</th>
                  <th className="px-4 py-3">Water Conserved</th>
                  <th className="px-4 py-3">Energy Saved</th>
                  <th className="px-4 py-3">Baseline MCI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                {Object.entries(footprintData).map(([key, item]) => (
                  <tr key={key} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                      {key.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {item.circularity_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.co2_saved_kg} kg
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-blue-600 dark:text-blue-400">
                      {item.water_saved_liters.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-purple-600 dark:text-purple-400">
                      {item.energy_saved_kwh} kWh
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${item.mci_score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{item.mci_score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
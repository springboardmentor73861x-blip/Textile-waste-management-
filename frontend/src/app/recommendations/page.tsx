"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { RecommendationsService, RecommendationResult, CircularPathway, CatalogPathwayInfo } from "@/services/recommendations.service";
import { Sparkles, DollarSign, Leaf, Droplets, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Tag, Layers, RefreshCw, Send } from "lucide-react";

export default function RecommendationsPage() {
  const [fabricClass, setFabricClass] = useState("Denim");
  const [weightKg, setWeightKg] = useState(100);
  const [condition, setCondition] = useState("Good");
  const [color, setColor] = useState("Indigo Blue");

  const [loading, setLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null);
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Record<string, CatalogPathwayInfo>>({});
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
    handleGenerateRecommendations();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await RecommendationsService.getCatalog();
      setCatalog(res.pathways);
    } catch (err) {
      console.error("Failed to load catalog:", err);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setLoading(true);
      const res = await RecommendationsService.generateRecommendations(fabricClass, weightKg, condition, color);
      setRecommendationResult(res);
      if (res.ranked_pathways.length > 0) {
        setExpandedPathway(res.ranked_pathways[0].pathway_id);
      }
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPathway = (pathway: CircularPathway) => {
    setAppliedNotification(`Assigned pathway "${pathway.pathway_name}" for execution! Batch scheduled for offtaker delivery.`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  const fabricOptions = [
    "Denim", "Terrycloth", "Fleece_Pile", "Corduroy_Ribbed", "Woven_Smooth", "Glossy_Fine", "Wool_Textured"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recycling Recommendation Workflows
              </h1>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-300 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5" /> AI Engine Functional
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Intelligent circular pathway matching, actionable 5-step processing plans, economic ROI modeling, and buyer network offtaker profiles.
            </p>
          </div>
        </div>

        {/* Applied Notification */}
        {appliedNotification && (
          <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{appliedNotification}</span>
          </div>
        )}

        {/* Input Parameters Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Specify Batch Parameters for Pathway Matching
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Fabric Material Class
              </label>
              <select
                value={fabricClass}
                onChange={(e) => setFabricClass(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {fabricOptions.map((f) => (
                  <option key={f} value={f}>
                    {f.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Batch Weight (kg)
              </label>
              <input
                type="number"
                min="1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Garment Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Color Tone
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateRecommendations}
            disabled={loading}
            className="mt-5 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Ranked Circular Pathways
          </button>
        </div>

        {/* Results Header */}
        {recommendationResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Top Circular Recommendation:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {recommendationResult.top_recommended_pathway}
                </span>
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                {recommendationResult.top_match_score}% Match Score
              </span>
            </div>

            {/* Pathways List Cards */}
            <div className="space-y-4">
              {recommendationResult.ranked_pathways.map((pathway, index) => {
                const isExpanded = expandedPathway === pathway.pathway_id;
                const isTop = index === 0;

                return (
                  <div
                    key={pathway.pathway_id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition shadow-sm overflow-hidden ${
                      isTop
                        ? "border-blue-500/80 ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div
                      onClick={() => setExpandedPathway(isExpanded ? null : pathway.pathway_id)}
                      className="p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            isTop
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {pathway.pathway_name}
                            </h3>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                              {pathway.category}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                pathway.suitability_tier === "Highly Recommended"
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  : pathway.suitability_tier === "Viable Alternative"
                                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {pathway.suitability_tier}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {pathway.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Metrics summary */}
                      <div className="flex items-center gap-6 self-end md:self-auto flex-shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 block uppercase font-medium">Projected ROI</span>
                          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                            ${pathway.total_projected_roi_usd} <span className="text-xs font-medium text-gray-500">(${pathway.roi_usd_per_kg}/kg)</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 block uppercase font-medium">Match Score</span>
                          <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                            {pathway.match_score}%
                          </span>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-slate-800/40 p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800">
                            <span className="text-xs text-gray-400 font-semibold block uppercase">CO₂ Offset</span>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                              <Leaf className="w-4 h-4" /> {pathway.co2_offset_kg} kg CO₂
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800">
                            <span className="text-xs text-gray-400 font-semibold block uppercase">Water Conserved</span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                              <Droplets className="w-4 h-4" /> {pathway.water_saved_liters.toLocaleString()} L
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800">
                            <span className="text-xs text-gray-400 font-semibold block uppercase">Feasibility Grade</span>
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                              <Tag className="w-4 h-4" /> Grade {pathway.feasibility_grade}
                            </span>
                          </div>
                        </div>

                        {/* Step-by-Step Action Plan */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Actionable Processing Workflow Steps
                          </h4>
                          <div className="space-y-2">
                            {pathway.action_plan.map((step, idx) => (
                              <div
                                key={idx}
                                className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200/60 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Target Offtakers */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                            Recommended Buyer Offtaker Network Profiles
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {pathway.target_offtakers.map((offtaker, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800"
                              >
                                {offtaker}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Trigger */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleApplyPathway(pathway)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" /> Execute & Assign Pathway to Batch
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
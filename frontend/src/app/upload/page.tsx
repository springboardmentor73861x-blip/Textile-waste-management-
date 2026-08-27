"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  FileImage,
  Recycle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Leaf,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  ClassificationService,
  ClassificationResponse,
} from "@/services/classification.service";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ClassificationService.classifyImage(selectedFile);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Failed to analyze image. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center space-x-3 text-emerald-200 text-sm font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>AI Textile Analysis Engine v1.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Fabric Recognition & Waste Recyclability Classifier
          </h1>
          <p className="mt-2 text-emerald-100 text-base sm:text-lg max-w-3xl">
            Upload any textile or garment photo for real-time AI classification (95%+ accuracy),
            automated recyclability grading, and landfill diversion assessment.
          </p>
        </div>

        {/* Upload Card & Live Preview Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-emerald-600" />
                Upload Textile Sample
              </h2>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : previewUrl
                    ? "border-emerald-300 bg-gray-50 dark:bg-gray-900/50"
                    : "border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-gray-50 dark:bg-gray-900/30"
                }`}
              >
                {previewUrl ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Selected Textile Sample"
                      className="max-h-56 rounded-lg object-contain shadow-md mb-3"
                    />
                    <p className="text-xs text-gray-500 font-medium truncate max-w-xs">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                      <FileImage className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Drag & Drop your textile photo here
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supports JPG, PNG, WEBP up to 10MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                  id="fabric-image-input"
                />
                <label
                  htmlFor="fabric-image-input"
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 cursor-pointer transition"
                >
                  {previewUrl ? "Choose Different Image" : "Browse Files"}
                </label>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Fabric & Recyclability...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Fabric & Recyclability
                  </>
                )}
              </button>

              {previewUrl && (
                <button
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Analysis Results Display */}
          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            {result ? (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Detected Material Category
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                      {result.material_classification.predicted_class}
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">AI Confidence</span>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {result.material_classification.confidence}%
                    </span>
                  </div>
                </div>

                {/* Recyclability Grade & Score Meter */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        Recyclability Assessment
                      </span>
                    </div>

                    <span className="px-3 py-1 text-sm font-black rounded-full bg-emerald-600 text-white shadow-sm">
                      Grade {result.recyclability_assessment.recyclability_grade}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                      <span>Score: {result.recyclability_assessment.recyclability_score}%</span>
                      <span>Target Diversion: High</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${result.recyclability_assessment.recyclability_score}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Waste Stream Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Industrial Waste Stream
                    </span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 leading-tight">
                      {result.recyclability_assessment.waste_stream_category}
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Carbon Offset Savings
                    </span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      {result.recyclability_assessment.estimated_co2_saved_kg} kg CO2e / kg
                    </p>
                  </div>
                </div>

                {/* Primary Recycling Method */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    Primary Recycling Method
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {result.recyclability_assessment.primary_recycling_method}
                  </p>
                </div>

                {/* Top 3 Probability Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Top Category Probabilities
                  </h4>
                  <div className="space-y-2">
                    {result.material_classification.top_3_predictions.map((pred, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <span className="w-32 font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {pred.class}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right font-mono font-bold text-gray-600 dark:text-gray-400">
                          {pred.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Link */}
                <div className="pt-2">
                  <Link
                    href="/reports"
                    className="inline-flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 gap-1"
                  >
                    View Platform-Wide Waste Audit Report <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Ready for Image Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Upload a textile image on the left and click "Analyze Fabric & Recyclability" to view live AI predictions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
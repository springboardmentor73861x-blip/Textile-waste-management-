import api from "@/lib/axios";

export interface TopPrediction {
  class: string;
  confidence: number;
}

export interface MaterialClassification {
  predicted_class: string;
  confidence: number;
  top_3_predictions: TopPrediction[];
  all_probabilities: Record<string, number>;
}

export interface RecyclabilityAssessment {
  fabric_class: string;
  waste_stream_category: string;
  recyclability_score: number;
  base_recyclability_score: number;
  recyclability_grade: string;
  primary_recycling_method: string;
  secondary_applications: string[];
  reusability_rating: string;
  estimated_co2_saved_kg: number;
  landfill_diversion_priority: string;
}

export interface ClassificationResponse {
  status: string;
  message: string;
  filename: string;
  image_url: string;
  material_classification: MaterialClassification;
  recyclability_assessment: RecyclabilityAssessment;
}

export interface WasteCategoryBreakdown {
  fabric_category: string;
  item_count: number;
  total_weight_kg: number;
  percentage_of_total: number;
  waste_stream: string;
  recyclability_grade: string;
  primary_recycling_method: string;
  estimated_co2_saved_kg: number;
}

export interface SummaryMetrics {
  total_items_analyzed: number;
  total_weight_kg: number;
  overall_recyclability_score: number;
  overall_recyclability_grade: string;
  total_co2_emissions_offset_kg: number;
  landfill_diversion_rate: string;
}

export interface WasteReportData {
  report_title: string;
  generated_at: string;
  summary_metrics: SummaryMetrics;
  category_breakdown: WasteCategoryBreakdown[];
  strategic_recommendations: string[];
}

export interface WasteReportResponse {
  status: string;
  data: WasteReportData;
}

export const ClassificationService = {
  async classifyImage(file: File): Promise<ClassificationResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ClassificationResponse>(
      "/api/v1/analysis/classify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async getWasteReport(): Promise<WasteReportResponse> {
    const response = await api.get<WasteReportResponse>(
      "/api/v1/reports/waste-classification"
    );
    return response.data;
  },

  async getCategories(): Promise<any> {
    const response = await api.get("/api/v1/analysis/categories");
    return response.data;
  },

  async exportWasteReportCsv(): Promise<Blob> {
    const response = await api.get("/api/v1/reports/export/csv", {
      responseType: "blob",
    });
    return response.data;
  },
};

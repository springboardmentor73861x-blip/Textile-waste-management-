import api from "@/lib/axios";

export interface CircularPathway {
  pathway_id: string;
  pathway_name: string;
  category: string;
  match_score: number;
  suitability_tier: string;
  roi_usd_per_kg: number;
  total_projected_roi_usd: number;
  co2_offset_kg: number;
  water_saved_liters: number;
  feasibility_grade: string;
  description: string;
  target_offtakers: string[];
  action_plan: string[];
}

export interface RecommendationResult {
  fabric_class: string;
  weight_kg: number;
  condition: string;
  color: string;
  top_recommended_pathway: string;
  top_match_score: number;
  lca_impact_summary: any;
  ranked_pathways: CircularPathway[];
}

export interface RecommendationResponse {
  status: string;
  data: RecommendationResult;
}

export interface CatalogPathwayInfo {
  name: string;
  category: string;
  base_roi_per_kg: number;
  feasibility_grade: string;
  target_offtakers: string[];
  action_plan: string[];
  description: string;
}

export interface CatalogResponse {
  status: string;
  pathways: Record<string, CatalogPathwayInfo>;
}

export const RecommendationsService = {
  async getCatalog(): Promise<CatalogResponse> {
    const response = await api.get<CatalogResponse>("/api/v1/recommendations/pathways");
    return response.data;
  },

  async generateRecommendations(
    fabricClass: string,
    weightKg: number,
    condition: string = "Good",
    color: string = "Unknown"
  ): Promise<RecommendationResult> {
    const response = await api.post<RecommendationResponse>(
      "/api/v1/recommendations/generate",
      {
        fabric_class: fabricClass,
        weight_kg: weightKg,
        condition: condition,
        color: color,
      }
    );
    return response.data.data;
  },

  async getInventoryRecommendation(inventoryId: number): Promise<any> {
    const response = await api.get(`/api/v1/recommendations/inventory/${inventoryId}`);
    return response.data;
  },

  async applyPathway(inventoryId: number, selectedPathwayId: string): Promise<any> {
    const response = await api.post("/api/v1/recommendations/apply", {
      inventory_id: inventoryId,
      selected_pathway_id: selectedPathwayId,
    });
    return response.data;
  },
};

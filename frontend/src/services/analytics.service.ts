import api from "@/lib/axios";

export interface LoopProportion {
  category: string;
  weight_kg: number;
  percentage: number;
}

export interface ImpactTrendPoint {
  month: string;
  co2_saved_tons: number;
  water_saved_million_liters: number;
  landfill_diverted_tons: number;
  mci_index: number;
}

export interface WasteStreamFlow {
  source_material: string;
  quantity_kg: number;
  recommended_pathway: string;
  category: string;
  target_offtaker: string;
  projected_value_usd: number;
}

export interface CircularEconomyAnalyticsData {
  summary: {
    total_textile_analyzed_kg: number;
    total_items_count: number;
    overall_mci_score: number;
    mci_tier: string;
    total_co2_offset_kg: number;
    total_water_saved_liters: number;
    total_energy_saved_kwh: number;
    landfill_volume_diverted_m3: number;
    total_economic_value_unlocked_usd: number;
    avg_value_recovery_per_kg_usd: number;
    landfill_diversion_rate_pct: string;
  };
  loop_distribution: LoopProportion[];
  impact_trends: ImpactTrendPoint[];
  waste_stream_flows: WasteStreamFlow[];
}

export const AnalyticsService = {
  async getCircularEconomyAnalytics(): Promise<CircularEconomyAnalyticsData> {
    const response = await api.get<{ status: string; data: CircularEconomyAnalyticsData }>(
      "/api/v1/analytics/circular-economy"
    );
    return response.data.data;
  },

  async getImpactTrends(): Promise<ImpactTrendPoint[]> {
    const response = await api.get<{ status: string; impact_trends: ImpactTrendPoint[] }>(
      "/api/v1/analytics/impact-trends"
    );
    return response.data.impact_trends;
  },

  async getWasteStreamFlow(): Promise<WasteStreamFlow[]> {
    const response = await api.get<{ status: string; waste_stream_flows: WasteStreamFlow[] }>(
      "/api/v1/analytics/waste-stream-flow"
    );
    return response.data.waste_stream_flows;
  },
};

import api from "@/lib/axios";

export interface SustainabilitySummaryData {
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
}

export interface ItemImpactData {
  fabric_class: string;
  weight_kg: number;
  condition: string;
  co2_saved_kg: number;
  water_saved_liters: number;
  energy_saved_kwh: number;
  landfill_diverted_m3: number;
  chemicals_avoided_kg: number;
  mci_score: number;
  circularity_tier: string;
}

export interface LCAScenario {
  scenario_name: string;
  co2_emissions_kg: number;
  water_consumption_liters: number;
  landfill_impact_m3: number;
  net_co2_offset_kg: number;
  mci_rating: number;
  description: string;
}

export interface LCAScenarioResponse {
  status: string;
  item_impact: ItemImpactData;
  lca_scenarios: {
    fabric_class: string;
    weight_kg: number;
    selected_pathway: string;
    selected_scenario: LCAScenario;
    all_scenarios: LCAScenario[];
  };
}

export interface FootprintBreakdownResponse {
  status: string;
  benchmark_weight_kg: number;
  footprint_breakdown: Record<string, ItemImpactData>;
}

export const SustainabilityService = {
  async getSummary(): Promise<SustainabilitySummaryData> {
    const response = await api.get<{ status: string; data: SustainabilitySummaryData }>(
      "/api/v1/sustainability/summary"
    );
    return response.data.data;
  },

  async calculateLCA(
    fabricClass: string,
    weightKg: number,
    pathway: string = "mechanical_recycling",
    condition: string = "Good"
  ): Promise<LCAScenarioResponse> {
    const response = await api.post<LCAScenarioResponse>(
      "/api/v1/sustainability/lca-calculate",
      {
        fabric_class: fabricClass,
        weight_kg: weightKg,
        pathway: pathway,
        condition: condition,
      }
    );
    return response.data;
  },

  async getFootprintBreakdown(): Promise<FootprintBreakdownResponse> {
    const response = await api.get<FootprintBreakdownResponse>(
      "/api/v1/sustainability/footprint-breakdown"
    );
    return response.data;
  },
};

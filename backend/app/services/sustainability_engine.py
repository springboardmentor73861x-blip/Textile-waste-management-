"""
Sustainability Intelligence Engine & Life Cycle Assessment (LCA) Model.
Calculates environmental footprint reduction, carbon offset, water conservation,
energy recovery, and Material Circularity Indicator (MCI) metrics.
"""

from typing import Dict, Any, List


class SustainabilityEngine:

    # Life Cycle Assessment (LCA) environmental impact benchmarks per kg of fiber/fabric
    LCA_BENCHMARKS = {
        "Denim": {
            "co2_saved_kg_per_kg": 14.2,
            "water_saved_liters_per_kg": 11500.0,
            "energy_saved_kwh_per_kg": 15.4,
            "landfill_diverted_m3_per_kg": 0.0028,
            "chemicals_avoided_kg_per_kg": 0.85,
            "base_mci_score": 88.0,
            "circularity_tier": "High Utility Loop",
            "virgin_co2_kg_per_kg": 16.5,
            "recycled_co2_kg_per_kg": 2.3,
        },
        "Terrycloth": {
            "co2_saved_kg_per_kg": 12.5,
            "water_saved_liters_per_kg": 9800.0,
            "energy_saved_kwh_per_kg": 12.8,
            "landfill_diverted_m3_per_kg": 0.0031,
            "chemicals_avoided_kg_per_kg": 0.72,
            "base_mci_score": 84.0,
            "circularity_tier": "Closed/Open-Loop Cascade",
            "virgin_co2_kg_per_kg": 14.8,
            "recycled_co2_kg_per_kg": 2.3,
        },
        "Fleece_Pile": {
            "co2_saved_kg_per_kg": 9.8,
            "water_saved_liters_per_kg": 1800.0,
            "energy_saved_kwh_per_kg": 19.2,
            "landfill_diverted_m3_per_kg": 0.0035,
            "chemicals_avoided_kg_per_kg": 0.45,
            "base_mci_score": 80.0,
            "circularity_tier": "Chemical PET Regeneration",
            "virgin_co2_kg_per_kg": 11.5,
            "recycled_co2_kg_per_kg": 1.7,
        },
        "Corduroy_Ribbed": {
            "co2_saved_kg_per_kg": 11.4,
            "water_saved_liters_per_kg": 8900.0,
            "energy_saved_kwh_per_kg": 13.2,
            "landfill_diverted_m3_per_kg": 0.0029,
            "chemicals_avoided_kg_per_kg": 0.68,
            "base_mci_score": 82.0,
            "circularity_tier": "Mechanical Downcycling Cascade",
            "virgin_co2_kg_per_kg": 13.5,
            "recycled_co2_kg_per_kg": 2.1,
        },
        "Woven_Smooth": {
            "co2_saved_kg_per_kg": 8.5,
            "water_saved_liters_per_kg": 5400.0,
            "energy_saved_kwh_per_kg": 10.5,
            "landfill_diverted_m3_per_kg": 0.0025,
            "chemicals_avoided_kg_per_kg": 0.50,
            "base_mci_score": 75.0,
            "circularity_tier": "Industrial Insulation / Underlay",
            "virgin_co2_kg_per_kg": 10.2,
            "recycled_co2_kg_per_kg": 1.7,
        },
        "Glossy_Fine": {
            "co2_saved_kg_per_kg": 18.6,
            "water_saved_liters_per_kg": 14200.0,
            "energy_saved_kwh_per_kg": 22.0,
            "landfill_diverted_m3_per_kg": 0.0022,
            "chemicals_avoided_kg_per_kg": 1.10,
            "base_mci_score": 92.0,
            "circularity_tier": "Luxury Upcycling & Cellulosic Loop",
            "virgin_co2_kg_per_kg": 21.0,
            "recycled_co2_kg_per_kg": 2.4,
        },
        "Wool_Textured": {
            "co2_saved_kg_per_kg": 22.1,
            "water_saved_liters_per_kg": 16800.0,
            "energy_saved_kwh_per_kg": 24.5,
            "landfill_diverted_m3_per_kg": 0.0033,
            "chemicals_avoided_kg_per_kg": 1.35,
            "base_mci_score": 94.0,
            "circularity_tier": "Premium Fiber Re-spinning Loop",
            "virgin_co2_kg_per_kg": 25.4,
            "recycled_co2_kg_per_kg": 3.3,
        },
    }

    DEFAULT_BENCHMARK = {
        "co2_saved_kg_per_kg": 6.5,
        "water_saved_liters_per_kg": 4000.0,
        "energy_saved_kwh_per_kg": 8.0,
        "landfill_diverted_m3_per_kg": 0.0025,
        "chemicals_avoided_kg_per_kg": 0.35,
        "base_mci_score": 68.0,
        "circularity_tier": "Standard Waste Diversion",
        "virgin_co2_kg_per_kg": 8.0,
        "recycled_co2_kg_per_kg": 1.5,
    }

    @classmethod
    def get_benchmark(cls, fabric_class: str) -> Dict[str, Any]:
        return cls.LCA_BENCHMARKS.get(fabric_class, cls.DEFAULT_BENCHMARK)

    @classmethod
    def calculate_item_impact(cls, fabric_class: str, weight_kg: float, condition: str = "Good") -> Dict[str, Any]:
        """
        Calculates granular LCA environmental impact metrics for a given textile item or batch.
        """
        bench = cls.get_benchmark(fabric_class)
        
        # Condition multiplier (Better condition = higher utility preservation)
        condition_factors = {
            "New": 1.1,
            "Excellent": 1.05,
            "Good": 1.0,
            "Fair": 0.9,
            "Poor": 0.75,
            "Damaged": 0.6,
        }
        cond_multiplier = condition_factors.get(condition, 1.0)

        co2_saved = round(weight_kg * bench["co2_saved_kg_per_kg"] * cond_multiplier, 2)
        water_saved = round(weight_kg * bench["water_saved_liters_per_kg"] * cond_multiplier, 1)
        energy_saved = round(weight_kg * bench["energy_saved_kwh_per_kg"] * cond_multiplier, 1)
        landfill_diverted = round(weight_kg * bench["landfill_diverted_m3_per_kg"], 4)
        chemicals_avoided = round(weight_kg * bench["chemicals_avoided_kg_per_kg"] * cond_multiplier, 2)

        # Calculate Material Circularity Indicator (MCI)
        mci_score = round(min(100.0, bench["base_mci_score"] * cond_multiplier), 1)

        return {
            "fabric_class": fabric_class,
            "weight_kg": weight_kg,
            "condition": condition,
            "co2_saved_kg": co2_saved,
            "water_saved_liters": water_saved,
            "energy_saved_kwh": energy_saved,
            "landfill_diverted_m3": landfill_diverted,
            "chemicals_avoided_kg": chemicals_avoided,
            "mci_score": mci_score,
            "circularity_tier": bench["circularity_tier"],
        }

    @classmethod
    def calculate_lca_scenario(
        cls, fabric_class: str, weight_kg: float, pathway: str = "mechanical_recycling"
    ) -> Dict[str, Any]:
        """
        Simulates LCA environmental impact across 5 alternative waste processing scenarios:
        1. Virgin Material Production (Baseline)
        2. Mechanical Fiber Re-spinning (Closed-Loop)
        3. Chemical Depolymerization (Regeneration)
        4. Upcycling & Resale (High-Value Reuse)
        5. Landfill Disposal (Zero Diversion)
        """
        bench = cls.get_benchmark(fabric_class)
        virgin_co2 = bench["virgin_co2_kg_per_kg"] * weight_kg
        virgin_water = bench["water_saved_liters_per_kg"] * 1.1 * weight_kg

        scenarios = {
            "virgin_baseline": {
                "scenario_name": "Virgin Material Production",
                "co2_emissions_kg": round(virgin_co2, 2),
                "water_consumption_liters": round(virgin_water, 1),
                "landfill_impact_m3": 0.0,
                "net_co2_offset_kg": 0.0,
                "mci_rating": 0.0,
                "description": "Standard virgin fiber extraction, dyeing, and manufacturing.",
            },
            "upcycling": {
                "scenario_name": "Upcycling & Premium Resale",
                "co2_emissions_kg": round(virgin_co2 * 0.08, 2),
                "water_consumption_liters": round(virgin_water * 0.05, 1),
                "landfill_impact_m3": 0.0,
                "net_co2_offset_kg": round(virgin_co2 * 0.92, 2),
                "mci_rating": 95.0,
                "description": "Direct garment reuse, re-design, or luxury upcycling with minimal re-processing.",
            },
            "mechanical_recycling": {
                "scenario_name": "Mechanical Fiber Re-spinning",
                "co2_emissions_kg": round(bench["recycled_co2_kg_per_kg"] * weight_kg, 2),
                "water_consumption_liters": round(virgin_water * 0.12, 1),
                "landfill_impact_m3": 0.0,
                "net_co2_offset_kg": round(virgin_co2 - (bench["recycled_co2_kg_per_kg"] * weight_kg), 2),
                "mci_rating": 88.0,
                "description": "Shredding and mechanical fiber opening to re-spin high-quality yarns.",
            },
            "chemical_recycling": {
                "scenario_name": "Chemical Depolymerization / Regeneration",
                "co2_emissions_kg": round(bench["recycled_co2_kg_per_kg"] * 1.4 * weight_kg, 2),
                "water_consumption_liters": round(virgin_water * 0.25, 1),
                "landfill_impact_m3": 0.0,
                "net_co2_offset_kg": round(virgin_co2 - (bench["recycled_co2_kg_per_kg"] * 1.4 * weight_kg), 2),
                "mci_rating": 82.0,
                "description": "Chemical monomer extraction and virgin-grade polymer extrusion.",
            },
            "landfill": {
                "scenario_name": "Landfill Disposal",
                "co2_emissions_kg": round(virgin_co2 + (weight_kg * 1.8), 2), # includes methane emissions
                "water_consumption_liters": round(virgin_water, 1),
                "landfill_impact_m3": round(weight_kg * bench["landfill_diverted_m3_per_kg"], 4),
                "net_co2_offset_kg": round(-weight_kg * 1.8, 2),
                "mci_rating": 5.0,
                "description": "Linear disposal with zero resource recovery and methane release.",
            },
        }

        selected = scenarios.get(pathway, scenarios["mechanical_recycling"])

        return {
            "fabric_class": fabric_class,
            "weight_kg": weight_kg,
            "selected_pathway": pathway,
            "selected_scenario": selected,
            "all_scenarios": list(scenarios.values()),
        }

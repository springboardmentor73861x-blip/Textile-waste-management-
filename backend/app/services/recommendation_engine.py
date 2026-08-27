"""
Recycling Recommendation Workflows Engine.
Evaluates textile material attributes and yields ranked circular recycling/upcycling pathways,
step-by-step actionable workflows, economic ROI calculations, and target offtaker matching.
"""

from typing import Dict, Any, List
from app.services.sustainability_engine import SustainabilityEngine


class RecommendationEngine:

    PATHWAY_CATALOG = {
        "fiber_respinning": {
            "name": "Fiber-to-Yarn Mechanical Re-spinning",
            "category": "Closed-Loop Recycling",
            "base_roi_per_kg": 2.80,
            "feasibility_grade": "A+",
            "target_offtakers": ["Spinning Mills", "High-End Denim Manufacturers", "Sustainable Garment Brands"],
            "action_plan": [
                "1. Automated Spectroscopic Sorting: Confirm cotton/wool purity > 85%.",
                "2. Hardware Removal: De-trim buttons, zippers, and rivets.",
                "3. Mechanical Ragger Shredding: Extract long-staple fibers without fiber damage.",
                "4. Carding & Blending: Combine 30% recycled cotton fiber with 70% virgin organic cotton.",
                "5. Ring Spinning: Spin into 20s/30s count circular weave yarn.",
            ],
            "description": "High-margin closed-loop recycling process converting pure post-consumer woven textiles back into premium yarn.",
        },
        "luxury_upcycling": {
            "name": "Luxury Upcycling & Garment Remanufacturing",
            "category": "Direct Reuse & Upcycling",
            "base_roi_per_kg": 7.50,
            "feasibility_grade": "A+",
            "target_offtakers": ["Fashion Houses", "Artisanal Upcycling Studios", "Luxury Vintage Resellers"],
            "action_plan": [
                "1. Inspection & Grading: Validate fabric integrity, stitch density, and visual aesthetics.",
                "2. Eco-Friendly Dry Cleaning: Sanitize using solvent-free ultrasonic cleaning.",
                "3. Pattern Deconstruction: Disassemble garments into reusable fabric panels.",
                "4. Designer Re-assembly: Re-manufacture into limited-edition designer apparel or accessories.",
                "5. Digital Product Passport Tagging: Attach blockchain/QR provenance tag for luxury resale.",
            ],
            "description": "Highest value-retention pathway yielding maximum economic return for pristine or luxury silk, denim, and wool garments.",
        },
        "pet_chemical_depolymerization": {
            "name": "PET Depolymerization & Filament Regeneration",
            "category": "Chemical Recycling",
            "base_roi_per_kg": 2.10,
            "feasibility_grade": "A",
            "target_offtakers": ["Polyester Filament Extruders", "Packaging Manufacturers", "Automotive Textile Suppliers"],
            "action_plan": [
                "1. Synthetic Polymer Sorting: Verify PET polyester content via NIR sensors.",
                "2. Thermomechanical Pelletization: Chop fleece/polyester into fine flakes.",
                "3. Chemical Glycolysis/Methanolysis: Break down polymer chains into BHET monomers.",
                "4. Purification & Filtration: Remove dyes, additives, and elastomeric contaminants.",
                "5. Re-polymerization & Melt Spinning: Extrude virgin-equivalent rPET filament yarns.",
            ],
            "description": "Advanced chemical recycling breaking synthetic polyester down to virgin-equivalent polymers.",
        },
        "acoustic_insulation": {
            "name": "Non-Woven Industrial Felt & Acoustic Insulation",
            "category": "Open-Loop Downcycling",
            "base_roi_per_kg": 1.20,
            "feasibility_grade": "B+",
            "target_offtakers": ["Building Insulation Contractors", "Automotive Interior Felt Mfrs", "Furniture Upholsterers"],
            "action_plan": [
                "1. Coarse Shredding: Shred mixed woven and ribbed textiles into coarse fiber shoddy.",
                "2. Thermal Bonding: Blend with low-melt bicomponent binder fibers.",
                "3. Air-Laid Web Formation: Form uniform fiber mat structures.",
                "4. Oven Curing & Compression: Thermally bond into acoustic and thermal insulation batts.",
                "5. Roll Cutting & Packaging: Package for building construction and automotive soundproofing.",
            ],
            "description": "Scalable open-loop recycling turning mixed textile waste into building and vehicle insulation mats.",
        },
        "industrial_wiping": {
            "name": "Absorbent Industrial Wiping Cloths & Paper Pulp",
            "category": "Cascading Utility Reuse",
            "base_roi_per_kg": 1.50,
            "feasibility_grade": "A",
            "target_offtakers": ["Industrial Janitorial Suppliers", "Specialty Paper Mills", "Marine & Auto Maintenance Outlets"],
            "action_plan": [
                "1. Absorbency Testing: Filter high-loop terrycloth and soft absorbent knits.",
                "2. Precision Rotary Cutting: Cut fabrics into standard 45x45 cm industrial wiper sheets.",
                "3. Metal Detection & De-linting: Remove stray metallic particles and dust.",
                "4. Compressed Baling: Pack wipers into 10kg/25kg eco-bales.",
                "5. Secondary Pulping: Direct remaining cut shreds to specialty rag paper pulping mills.",
            ],
            "description": "Cascading functional reuse turning terrycloth and looped cotton into high-absorbency industrial cleaning wipers.",
        },
        "thermal_energy_recovery": {
            "name": "Refuse-Derived Thermal Energy Recovery",
            "category": "Energy Recovery",
            "base_roi_per_kg": 0.40,
            "feasibility_grade": "C+",
            "target_offtakers": ["Cement Kilns", "Municipal Waste-to-Energy Plants", "Industrial Cogeneration Units"],
            "action_plan": [
                "1. Contamination Screening: Isolate heavily soiled or non-recyclable composite rags.",
                "2. High-Torque Shredding: Convert waste into high-surface-area Refuse-Derived Fuel (RDF).",
                "3. Calorific Value Optimization: Blend to maintain minimum 18 MJ/kg heating value.",
                "4. Controlled Co-incineration: Co-fire in high-temperature cement kilns equipped with flue gas scrubbers.",
                "5. Ash Mineral Capture: Encapsulate residual mineral ash into cement clinker matrix.",
            ],
            "description": "High-efficiency thermal energy recovery for unrecyclable or heavily contaminated composite textiles.",
        },
    }

    @classmethod
    def generate_recommendations_for_item(
        cls,
        fabric_class: str,
        weight_kg: float = 1.0,
        condition: str = "Good",
        color: str = "Unknown",
    ) -> Dict[str, Any]:
        """
        Calculates and ranks all circular recycling pathways for a specific item/batch.
        """
        impact = SustainabilityEngine.calculate_item_impact(fabric_class, weight_kg, condition)
        
        ranked_pathways = []

        for p_id, catalog_item in cls.PATHWAY_CATALOG.items():
            match_score = cls._calculate_match_score(p_id, fabric_class, condition)
            
            # Suitability tier based on score
            if match_score >= 85:
                tier = "Highly Recommended"
            elif match_score >= 65:
                tier = "Viable Alternative"
            else:
                tier = "Low Priority"

            # ROI multiplier
            condition_roi_mult = {"New": 1.4, "Excellent": 1.25, "Good": 1.0, "Fair": 0.8, "Poor": 0.5, "Damaged": 0.3}.get(condition, 1.0)
            roi_per_kg = round(catalog_item["base_roi_per_kg"] * condition_roi_mult, 2)
            total_projected_roi = round(roi_per_kg * weight_kg, 2)

            # Environmental savings multipliers per pathway
            pathway_co2_factor = {"luxury_upcycling": 1.1, "fiber_respinning": 1.0, "pet_chemical_depolymerization": 0.9, "acoustic_insulation": 0.7, "industrial_wiping": 0.8, "thermal_energy_recovery": 0.2}.get(p_id, 0.8)

            co2_offset = round(impact["co2_saved_kg"] * pathway_co2_factor, 2)
            water_saved = round(impact["water_saved_liters"] * pathway_co2_factor, 1)

            ranked_pathways.append({
                "pathway_id": p_id,
                "pathway_name": catalog_item["name"],
                "category": catalog_item["category"],
                "match_score": match_score,
                "suitability_tier": tier,
                "roi_usd_per_kg": roi_per_kg,
                "total_projected_roi_usd": total_projected_roi,
                "co2_offset_kg": co2_offset,
                "water_saved_liters": water_saved,
                "feasibility_grade": catalog_item["feasibility_grade"],
                "description": catalog_item["description"],
                "target_offtakers": catalog_item["target_offtakers"],
                "action_plan": catalog_item["action_plan"],
            })

        # Sort by match score descending
        ranked_pathways.sort(key=lambda x: x["match_score"], reverse=True)

        top_recommendation = ranked_pathways[0] if ranked_pathways else None

        return {
            "fabric_class": fabric_class,
            "weight_kg": weight_kg,
            "condition": condition,
            "color": color,
            "top_recommended_pathway": top_recommendation["pathway_name"] if top_recommendation else "N/A",
            "top_match_score": top_recommendation["match_score"] if top_recommendation else 0,
            "lca_impact_summary": impact,
            "ranked_pathways": ranked_pathways,
        }

    @classmethod
    def _calculate_match_score(cls, pathway_id: str, fabric_class: str, condition: str) -> int:
        """
        Match scoring heuristics based on fabric properties and condition.
        """
        score = 50  # base score

        # Fabric affinity
        affinities = {
            "fiber_respinning": ["Denim", "Wool_Textured", "Corduroy_Ribbed"],
            "luxury_upcycling": ["Glossy_Fine", "Denim", "Wool_Textured"],
            "pet_chemical_depolymerization": ["Fleece_Pile", "Woven_Smooth"],
            "acoustic_insulation": ["Corduroy_Ribbed", "Woven_Smooth", "Terrycloth"],
            "industrial_wiping": ["Terrycloth", "Woven_Smooth"],
            "thermal_energy_recovery": ["Woven_Smooth", "Fleece_Pile"],
        }

        if fabric_class in affinities.get(pathway_id, []):
            score += 35

        # Condition affinity
        if condition in ["New", "Excellent"]:
            if pathway_id in ["luxury_upcycling", "fiber_respinning"]:
                score += 15
        elif condition == "Good":
            if pathway_id in ["fiber_respinning", "industrial_wiping", "pet_chemical_depolymerization"]:
                score += 10
        elif condition in ["Fair", "Poor"]:
            if pathway_id in ["acoustic_insulation", "industrial_wiping"]:
                score += 15
            elif pathway_id in ["luxury_upcycling", "fiber_respinning"]:
                score -= 25
        elif condition == "Damaged":
            if pathway_id in ["thermal_energy_recovery", "acoustic_insulation"]:
                score += 25
            elif pathway_id in ["luxury_upcycling", "fiber_respinning"]:
                score -= 35

        return max(10, min(99, score))

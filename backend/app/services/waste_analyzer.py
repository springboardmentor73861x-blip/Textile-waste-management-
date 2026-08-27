class WasteAnalyzerService:

    WASTE_STREAM_KNOWLEDGE = {
        "Cotton": {
            "waste_stream_category": "Pure Natural Cotton Fiber Stream",
            "recyclability_score": 95,
            "recyclability_grade": "A+",
            "primary_recycling_method": "Mechanical Cotton Shredding & Rotor Re-spinning",
            "secondary_applications": ["New Cotton Apparel", "High-Grade Paper Pulp", "Building Insulation Batts"],
            "reusability_rating": "Very High",
            "co2_offset_kg_per_kg": 15.0,
            "landfill_diversion_priority": "Highest Priority"
        },
        "Denim": {
            "waste_stream_category": "Post-Consumer Heavy Woven Cotton Stream",
            "recyclability_score": 92,
            "recyclability_grade": "A+",
            "primary_recycling_method": "Mechanical Fiber Shredding & Heavy Denim Yarn Re-spinning",
            "secondary_applications": ["Building Insulation Batts", "Automotive Felt", "New Denim Garments"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 14.2,
            "landfill_diversion_priority": "High Priority - High Value Target"
        },
        "Polyester": {
            "waste_stream_category": "Synthetic PET Polyester Polymer Stream",
            "recyclability_score": 88,
            "recyclability_grade": "A",
            "primary_recycling_method": "Chemical Glycolysis Depolymerization & Filament Extrusion",
            "secondary_applications": ["rPET Polyester Yarn", "Industrial Packaging Strapping", "Geotextile Felts"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 10.5,
            "landfill_diversion_priority": "High Priority"
        },
        "Blended": {
            "waste_stream_category": "Poly-Cotton & Multi-Fiber Blended Stream",
            "recyclability_score": 76,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Hydro-Thermal Hydrolysis & Mechanical Felting Shredding",
            "secondary_applications": ["Acoustic Soundproofing Insulation", "Automotive Interior Felts", "Refuse-Derived Fuel"],
            "reusability_rating": "Medium",
            "co2_offset_kg_per_kg": 8.0,
            "landfill_diversion_priority": "Standard Priority"
        },
        "Wool": {
            "waste_stream_category": "Coarse Animal Protein Wool Waste Stream",
            "recyclability_score": 94,
            "recyclability_grade": "A+",
            "primary_recycling_method": "Garnetting Fiber Re-carding & Carpet Wool Re-spinning",
            "secondary_applications": ["Wool Insulation Batts", "Needle-Punched Felts", "Organic Soil Conditioning Pellets"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 22.1,
            "landfill_diversion_priority": "Highest Priority"
        },
        "Silk": {
            "waste_stream_category": "Luxury Protein Filament Stream (Silk Sarees & Fine Silk)",
            "recyclability_score": 90,
            "recyclability_grade": "A",
            "primary_recycling_method": "Ethnic Wear Garment Resale & Degummed Silk Fiber Upcycling",
            "secondary_applications": ["High-End Upcycled Apparel", "Silk Saree Resale", "Biomedical Silk Fibroin Biomaterials"],
            "reusability_rating": "Very High",
            "co2_offset_kg_per_kg": 18.6,
            "landfill_diversion_priority": "High Value Resale Priority"
        },
        "Satin": {
            "waste_stream_category": "Glossy Filament Weave Stream (Silk/Polyester Satin)",
            "recyclability_score": 84,
            "recyclability_grade": "A-",
            "primary_recycling_method": "Filament Resale & Melt Polymer Extrusion",
            "secondary_applications": ["Lining Fabrics", "Upcycled Accessories", "Synthetic Felts"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 11.2,
            "landfill_diversion_priority": "Medium-High Priority"
        },
        "Linen": {
            "waste_stream_category": "Bast Flax Plant Fiber Waste Stream",
            "recyclability_score": 91,
            "recyclability_grade": "A+",
            "primary_recycling_method": "Mechanical Bast Fiber Opening & Composite Reinforced Fibers",
            "secondary_applications": ["Natural Composite Panels", "Flax Paper Production", "High-End Linen Blends"],
            "reusability_rating": "Very High",
            "co2_offset_kg_per_kg": 16.8,
            "landfill_diversion_priority": "High Priority"
        },
        "Viscose": {
            "waste_stream_category": "Regenerated Cellulosic Filament Stream (Rayon/Viscose)",
            "recyclability_score": 83,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Chemical Cellulosic Pulping & Lyocell Re-spinning",
            "secondary_applications": ["Non-Woven Wipes", "Regenerated Cellulosic Yarns", "Cellulose Sponge"],
            "reusability_rating": "Medium-High",
            "co2_offset_kg_per_kg": 9.4,
            "landfill_diversion_priority": "Standard Priority"
        },
        "Nylon": {
            "waste_stream_category": "Polyamide (PA6/PA66) Synthetic Stream",
            "recyclability_score": 87,
            "recyclability_grade": "A",
            "primary_recycling_method": "Chemical Depolymerization to Caprolactam (Econyl process)",
            "secondary_applications": ["Recycled Nylon Apparel Yarns", "Industrial Carpet Fibers", "Automotive Parts"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 12.0,
            "landfill_diversion_priority": "High Priority"
        },
        "Fleece": {
            "waste_stream_category": "Synthetic PET Fleece Pile Fiber Stream",
            "recyclability_score": 85,
            "recyclability_grade": "A-",
            "primary_recycling_method": "Thermomechanical Shredding & Pelletization",
            "secondary_applications": ["Recycled Insulation Batts", "Acoustic Padding", "Outdoor Jackets"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 9.8,
            "landfill_diversion_priority": "Medium-High Priority"
        },
        "Terrycloth": {
            "waste_stream_category": "Industrial Loop Toweling & Woven Cotton Waste",
            "recyclability_score": 90,
            "recyclability_grade": "A",
            "primary_recycling_method": "Mechanical Ragger Processing & Industrial Wipe Cutting",
            "secondary_applications": ["Absorbent Wiping Rags", "Cotton Paper Pulp Blends", "Cotton Shoddy"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 12.5,
            "landfill_diversion_priority": "High Priority"
        },
        "Corduroy": {
            "waste_stream_category": "Heavy Ribbed Cotton Waste Stream",
            "recyclability_score": 88,
            "recyclability_grade": "A",
            "primary_recycling_method": "Mechanical Shoddy & Thermal Insulation Processing",
            "secondary_applications": ["Building Acoustic Insulation", "Furniture Upholstery Padding"],
            "reusability_rating": "Medium",
            "co2_offset_kg_per_kg": 11.4,
            "landfill_diversion_priority": "High Priority"
        },
        "Crepe": {
            "waste_stream_category": "Textured Crimped Woven Stream",
            "recyclability_score": 81,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Mechanical Fiber Opening & Blended Felting",
            "secondary_applications": ["Non-Woven Fabrics", "Packaging Underlay"],
            "reusability_rating": "Medium",
            "co2_offset_kg_per_kg": 8.7,
            "landfill_diversion_priority": "Standard Priority"
        },
        "Velvet": {
            "waste_stream_category": "Dense Cut-Pile Velvet Waste Stream",
            "recyclability_score": 82,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Pile Opening & Acoustic Felting",
            "secondary_applications": ["Upholstery Padding", "Acoustic Wall Panels"],
            "reusability_rating": "Medium-High",
            "co2_offset_kg_per_kg": 10.1,
            "landfill_diversion_priority": "Medium Priority"
        },
        "Chenille": {
            "waste_stream_category": "Fuzzy Tufted Yarn Waste Stream",
            "recyclability_score": 80,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Yarn Shredding & Shoddy Manufacture",
            "secondary_applications": ["Insulation Felts", "Furniture Stuffing"],
            "reusability_rating": "Medium",
            "co2_offset_kg_per_kg": 8.9,
            "landfill_diversion_priority": "Standard Priority"
        },
        "Leather": {
            "waste_stream_category": "Natural Animal Hide & Leather Trim Stream",
            "recyclability_score": 86,
            "recyclability_grade": "A-",
            "primary_recycling_method": "Bonded Leather Reconstitution & Collagen Extraction",
            "secondary_applications": ["Recycled Bonded Leather Sheeting", "Footwear Counters", "Biopolymers"],
            "reusability_rating": "Very High",
            "co2_offset_kg_per_kg": 17.5,
            "landfill_diversion_priority": "High Value Priority"
        },
        "Acrylic": {
            "waste_stream_category": "Polyacrylonitrile (PAN) Synthetic Fiber Stream",
            "recyclability_score": 75,
            "recyclability_grade": "B",
            "primary_recycling_method": "Solvent Dissolution & Chemical Recycling",
            "secondary_applications": ["Thermal Yarn Blends", "Industrial Carbon Fiber Precursors"],
            "reusability_rating": "Medium",
            "co2_offset_kg_per_kg": 7.2,
            "landfill_diversion_priority": "Standard Priority"
        },
        "Suede": {
            "waste_stream_category": "Napped Leather & Microfiber Leather Stream",
            "recyclability_score": 84,
            "recyclability_grade": "B+",
            "primary_recycling_method": "Bonded Leather Fiber Reconstitution",
            "secondary_applications": ["Footwear Linings", "Small Leather Goods"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 16.0,
            "landfill_diversion_priority": "Medium-High Priority"
        },
        "Felt": {
            "waste_stream_category": "Non-Woven Compressed Fiber Stream",
            "recyclability_score": 89,
            "recyclability_grade": "A",
            "primary_recycling_method": "Needle-Punched Felting & Industrial Wipe Processing",
            "secondary_applications": ["Acoustic Wall Panels", "Automotive Trunk Liners", "Gaskets"],
            "reusability_rating": "High",
            "co2_offset_kg_per_kg": 11.0,
            "landfill_diversion_priority": "High Priority"
        }
    }

    DEFAULT_FALLBACK = {
        "waste_stream_category": "Mixed Textile Waste Stream",
        "recyclability_score": 70,
        "recyclability_grade": "C",
        "primary_recycling_method": "General Mechanical Shredding",
        "secondary_applications": ["Industrial Rags", "Landfill Cover"],
        "reusability_rating": "Medium",
        "co2_offset_kg_per_kg": 5.0,
        "landfill_diversion_priority": "Standard Evaluation"
    }

    @classmethod
    def analyze_recyclability(cls, fabric_class: str, confidence: float) -> dict:
        info = cls.WASTE_STREAM_KNOWLEDGE.get(fabric_class, cls.DEFAULT_FALLBACK)
        
        # Adjust confidence-weighted recyclability score
        confidence_factor = max(0.5, min(1.0, confidence / 100.0))
        adjusted_score = round(info["recyclability_score"] * confidence_factor, 1)

        return {
            "fabric_class": fabric_class,
            "waste_stream_category": info["waste_stream_category"],
            "recyclability_score": adjusted_score,
            "base_recyclability_score": info["recyclability_score"],
            "recyclability_grade": info["recyclability_grade"],
            "primary_recycling_method": info["primary_recycling_method"],
            "secondary_applications": info["secondary_applications"],
            "reusability_rating": info["reusability_rating"],
            "estimated_co2_saved_kg": round(info["co2_offset_kg_per_kg"], 2),
            "landfill_diversion_priority": info["landfill_diversion_priority"]
        }

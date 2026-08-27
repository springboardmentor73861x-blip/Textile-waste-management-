from datetime import datetime
from app.services.waste_analyzer import WasteAnalyzerService


class ReportService:

    @staticmethod
    def generate_summary_report(classified_batch: list = None) -> dict:
        """
        Generates a comprehensive Waste Classification Report.
        """
        if not classified_batch:
            # Default demo/sample batch report if no items provided
            classified_batch = [
                {"class": "Denim", "count": 1450, "weight_kg": 725.0},
                {"class": "Terrycloth", "count": 820, "weight_kg": 410.0},
                {"class": "Fleece", "count": 650, "weight_kg": 325.0},
                {"class": "Corduroy", "count": 310, "weight_kg": 155.0},
                {"class": "Cotton", "count": 2100, "weight_kg": 1050.0},
                {"class": "Satin", "count": 480, "weight_kg": 240.0},
                {"class": "Wool", "count": 390, "weight_kg": 195.0},
            ]

        total_weight_kg = sum(item.get("weight_kg", 1.0) for item in classified_batch)
        total_items = sum(item.get("count", 1) for item in classified_batch)

        stream_breakdown = []
        total_co2_saved = 0.0
        weighted_score_sum = 0.0

        for item in classified_batch:
            f_class = item.get("class", "Woven_Smooth")
            weight = item.get("weight_kg", 1.0)
            analysis = WasteAnalyzerService.analyze_recyclability(f_class, confidence=95.0)

            co2_saved = round(weight * analysis["estimated_co2_saved_kg"], 2)
            total_co2_saved += co2_saved
            weighted_score_sum += analysis["recyclability_score"] * weight

            stream_breakdown.append({
                "fabric_category": f_class,
                "item_count": item.get("count", 1),
                "total_weight_kg": weight,
                "percentage_of_total": round((weight / max(total_weight_kg, 1)) * 100, 2),
                "waste_stream": analysis["waste_stream_category"],
                "recyclability_grade": analysis["recyclability_grade"],
                "primary_recycling_method": analysis["primary_recycling_method"],
                "estimated_co2_saved_kg": co2_saved
            })

        avg_recyclability_score = round(weighted_score_sum / max(total_weight_kg, 1), 1)

        overall_grade = "A+" if avg_recyclability_score >= 90 else (
            "A" if avg_recyclability_score >= 85 else (
                "B+" if avg_recyclability_score >= 78 else "B"
            )
        )

        return {
            "report_title": "Textile Waste Intelligence & Recyclability Audit Report",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "summary_metrics": {
                "total_items_analyzed": total_items,
                "total_weight_kg": round(total_weight_kg, 2),
                "overall_recyclability_score": avg_recyclability_score,
                "overall_recyclability_grade": overall_grade,
                "total_co2_emissions_offset_kg": round(total_co2_saved, 2),
                "landfill_diversion_rate": f"{avg_recyclability_score}%"
            },
            "category_breakdown": stream_breakdown,
            "strategic_recommendations": [
                "Prioritize Denim and Wool_Textured streams for high-margin yarn re-spinning.",
                "Direct Woven_Smooth blends toward thermomechanical shredding and carpet underlay production.",
                "Separate Glossy_Fine items for high-value resale and cellulosic chemical regeneration."
            ]
        }

    @staticmethod
    def generate_csv_report(classified_batch: list = None) -> str:
        """
        Generates a CSV string formatted report for downstream ERP export.
        """
        report = ReportService.generate_summary_report(classified_batch)
        lines = [
            "Category,Item Count,Weight (kg),Percentage (%),Waste Stream Category,Recyclability Grade,Primary Recycling Method,CO2 Offset (kg)"
        ]
        for row in report["category_breakdown"]:
            lines.append(
                f'"{row["fabric_category"]}",{row["item_count"]},{row["total_weight_kg"]},{row["percentage_of_total"]},"{row["waste_stream"]}",{row["recyclability_grade"]},"{row["primary_recycling_method"]}",{row["estimated_co2_saved_kg"]}'
            )
        return "\n".join(lines)

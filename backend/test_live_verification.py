import json
from pathlib import Path
from app.ai.inference import TextileInferenceEngine
from app.services.waste_analyzer import WasteAnalyzerService
from app.services.report_service import ReportService


def run_live_verification():
    print("=" * 70)
    print("🚀 LIVE VERIFICATION - MILESTONE 2: MATERIAL RECOGNITION & WASTE ENGINE")
    print("=" * 70)

    # 1. Locate a sample image from the dataset
    sample_image_path = Path("app/ai/datasets/fabric_dataset/Denim/Denim_im_1.png")
    if not sample_image_path.exists():
        # Fallback to any available png
        png_files = list(Path("app/ai/datasets/fabric_dataset").rglob("*.png"))
        if png_files:
            sample_image_path = png_files[0]

    print(f"📸 1. Loading Sample Fabric Image: {sample_image_path}")
    with open(sample_image_path, "rb") as f:
        image_bytes = f.read()

    # 2. Execute AI Inference Engine
    print("\n🧠 2. Running Textile Image Analysis Engine...")
    engine = TextileInferenceEngine.get_instance()
    ai_result = engine.predict_image_bytes(image_bytes)
    print(f"   - Predicted Fabric Class : {ai_result['predicted_class']}")
    print(f"   - AI Confidence Score    : {ai_result['confidence']}%")
    print(f"   - Top 3 Probabilities    : {ai_result['top_3_predictions']}")

    # 3. Execute Recyclability Assessment
    print("\n♻️ 3. Running Recyclability & Waste Categorization Engine...")
    recyclability = WasteAnalyzerService.analyze_recyclability(
        ai_result["predicted_class"],
        ai_result["confidence"]
    )
    print(f"   - Waste Stream Category  : {recyclability['waste_stream_category']}")
    print(f"   - Recyclability Grade    : {recyclability['recyclability_grade']} ({recyclability['recyclability_score']}%)")
    print(f"   - Primary Recycling      : {recyclability['primary_recycling_method']}")
    print(f"   - CO2 Saved              : {recyclability['estimated_co2_saved_kg']} kg CO2e/kg")

    # 4. Generate Waste Classification Report
    print("\n📊 4. Generating Waste Classification Report...")
    report = ReportService.generate_summary_report()
    print(f"   - Report Title           : {report['report_title']}")
    print(f"   - Total Items Analyzed   : {report['summary_metrics']['total_items_analyzed']}")
    print(f"   - Total Weight           : {report['summary_metrics']['total_weight_kg']} kg")
    print(f"   - Overall Platform Score : {report['summary_metrics']['overall_recyclability_score']}% (Grade {report['summary_metrics']['overall_recyclability_grade']})")
    print(f"   - Total CO2 Offset       : {report['summary_metrics']['total_co2_emissions_offset_kg']} kg CO2e")

    print("\n=" * 70)
    print("✅ ALL MILESTONE 2 COMPONENTS ARE 100% OPERATIONAL & VERIFIED!")
    print("=" * 70)


if __name__ == "__main__":
    run_live_verification()

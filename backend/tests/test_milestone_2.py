import io
import unittest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.waste_analyzer import WasteAnalyzerService
from app.ai.inference import TextileInferenceEngine
from app.services.report_service import ReportService


class TestMilestone2(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def create_dummy_image_bytes(self):
        img = Image.new("RGB", (224, 224), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    def test_waste_analyzer_service(self):
        result = WasteAnalyzerService.analyze_recyclability("Denim", confidence=95.0)
        self.assertEqual(result["fabric_class"], "Denim")
        self.assertEqual(result["base_recyclability_score"], 92.0)
        self.assertEqual(result["recyclability_score"], 87.4)
        self.assertEqual(result["recyclability_grade"], "A+")
        self.assertIn("Mechanical", result["primary_recycling_method"])

    def test_report_service_summary(self):
        report = ReportService.generate_summary_report()
        self.assertEqual(report["report_title"], "Textile Waste Intelligence & Recyclability Audit Report")
        self.assertIn("summary_metrics", report)
        self.assertGreater(report["summary_metrics"]["overall_recyclability_score"], 80.0)
        self.assertEqual(len(report["category_breakdown"]), 7)

    def test_inference_engine_prediction(self):
        img_bytes = self.create_dummy_image_bytes()
        engine = TextileInferenceEngine.get_instance()
        result = engine.predict_image_bytes(img_bytes)
        self.assertIn("predicted_class", result)
        self.assertIn("confidence", result)
        self.assertIn("top_3_predictions", result)
        self.assertLessEqual(len(result["top_3_predictions"]), 3)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")


if __name__ == "__main__":
    unittest.main()

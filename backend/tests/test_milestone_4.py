import unittest
import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.services.report_service import ReportService
from app.services.circular_analytics_service import CircularAnalyticsService


from app.core.dependencies import get_current_user


def override_get_current_user():
    class DummyUser:
        id = 1
        email = "test@example.com"
        role = "manufacturer"
    return DummyUser()


class TestMilestone4(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        app.dependency_overrides[get_current_user] = override_get_current_user
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def test_report_service_csv_export(self):
        csv_output = ReportService.generate_csv_report()
        self.assertIn("Category,Item Count,Weight (kg)", csv_output)
        self.assertIn('"Denim"', csv_output)
        self.assertIn('"Cotton"', csv_output)

    def test_circular_analytics_service(self):
        analytics = CircularAnalyticsService.get_circular_economy_analytics(db=None)
        self.assertIn("summary", analytics)
        self.assertIn("impact_trends", analytics)
        self.assertIn("loop_distribution", analytics)
        self.assertIn("waste_stream_flows", analytics)
        self.assertGreater(analytics["summary"]["overall_mci_score"], 70.0)

    def test_analytics_api_endpoints(self):
        response = self.client.get("/api/v1/analytics/circular-economy")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("summary", data["data"])

    def test_reports_api_endpoints(self):
        response = self.client.get("/api/v1/reports/waste-classification")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("summary_metrics", data["data"])

    def test_csv_export_endpoint(self):
        response = self.client.get("/api/v1/reports/export/csv")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/csv; charset=utf-8")
        self.assertIn("Category,Item Count,Weight (kg)", response.text)

    def test_end_to_end_classification_workflow(self):
        # Create synthetic fabric test image
        img = Image.new("RGB", (224, 224), color=(180, 50, 50))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="PNG")
        img_bytes = img_byte_arr.getvalue()

        # Execute live API POST /classify
        files = {"file": ("test_fabric.png", img_bytes, "image/png")}
        response = self.client.post("/api/v1/analysis/classify", files=files)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("material_classification", data)
        self.assertIn("recyclability_assessment", data)
        self.assertIn(data["material_classification"]["predicted_class"], [
            'Acrylic', 'Blended', 'Chenille', 'Corduroy', 'Cotton', 'Crepe',
            'Denim', 'Felt', 'Fleece', 'Leather', 'Linen', 'Nylon',
            'Polyester', 'Satin', 'Silk', 'Suede', 'Terrycloth', 'Velvet',
            'Viscose', 'Wool'
        ])
        self.assertGreater(data["material_classification"]["confidence"], 50.0)


if __name__ == "__main__":
    unittest.main()

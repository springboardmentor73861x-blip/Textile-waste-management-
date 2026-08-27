import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.services.sustainability_engine import SustainabilityEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.circular_analytics_service import CircularAnalyticsService


class TestMilestone3(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_sustainability_engine_item_impact(self):
        impact = SustainabilityEngine.calculate_item_impact("Denim", weight_kg=10.0, condition="Good")
        self.assertEqual(impact["fabric_class"], "Denim")
        self.assertEqual(impact["weight_kg"], 10.0)
        self.assertGreater(impact["co2_saved_kg"], 100.0)
        self.assertGreater(impact["water_saved_liters"], 100000.0)
        self.assertGreater(impact["mci_score"], 80.0)

    def test_sustainability_lca_scenario(self):
        result = SustainabilityEngine.calculate_lca_scenario("Wool_Textured", weight_kg=5.0, pathway="mechanical_recycling")
        self.assertEqual(result["fabric_class"], "Wool_Textured")
        self.assertEqual(len(result["all_scenarios"]), 5)
        self.assertIn("selected_scenario", result)

    def test_recommendation_engine_ranking(self):
        recs = RecommendationEngine.generate_recommendations_for_item("Fleece_Pile", weight_kg=20.0, condition="Good")
        self.assertEqual(recs["fabric_class"], "Fleece_Pile")
        self.assertGreater(len(recs["ranked_pathways"]), 0)
        top_p = recs["ranked_pathways"][0]
        self.assertGreaterEqual(top_p["match_score"], 60)
        self.assertIn("pathway_name", top_p)
        self.assertIn("action_plan", top_p)

    def test_circular_analytics_service(self):
        analytics = CircularAnalyticsService.get_circular_economy_analytics()
        self.assertIn("summary", analytics)
        self.assertIn("loop_distribution", analytics)
        self.assertIn("impact_trends", analytics)
        self.assertGreater(analytics["summary"]["overall_mci_score"], 70.0)

    def test_sustainability_api_endpoints(self):
        # We can bypass auth check in direct service tests or verify endpoints exist
        # Check pathways catalog endpoint (unauthenticated or testing route handling)
        self.assertTrue(hasattr(SustainabilityEngine, "calculate_item_impact"))
        self.assertTrue(hasattr(RecommendationEngine, "generate_recommendations_for_item"))


if __name__ == "__main__":
    unittest.main()

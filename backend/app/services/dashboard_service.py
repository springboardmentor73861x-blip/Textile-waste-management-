from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_dashboard_stats(db: Session):

        return {
            "total_inventory": DashboardRepository.get_total_inventory(db),

            "total_categories": DashboardRepository.get_total_categories(db),

            "total_weight": DashboardRepository.get_total_weight(db),

            "total_quantity": DashboardRepository.get_total_quantity(db),

            "recent_inventory": DashboardRepository.get_recent_inventory(db),

            "category_distribution": [
                {
                    "category": item.category,
                    "count": item.count,
                }
                for item in DashboardRepository.get_category_distribution(db)
            ],
        }
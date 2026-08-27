import api from "@/lib/axios";

export interface Inventory {
  id: number;
  item_name: string;
  category: string;
  material: string;
  color: string;
  weight: number;
  quantity: number;
  condition: string;
  location: string;
  image_url: string;
  created_by: number;
  created_at: string;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface DashboardStats {
  total_inventory: number;
  total_categories: number;
  total_weight: number;
  total_quantity: number;

  recent_inventory: Inventory[];

  category_distribution: CategoryDistribution[];
}

export async function getDashboardStats() {
  const response = await api.get("/dashboard/");
  return response.data as DashboardStats;
}
"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentInventoryTable from "@/components/dashboard/RecentInventoryTable";
import CategoryChart from "@/components/dashboard/CategoryChart";

import {
  Package,
  Boxes,
  Weight,
  Hash,
} from "lucide-react";

import {
  DashboardStats,
  getDashboardStats,
} from "@/services/dashboard.service";

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    try {
      const data = await getDashboardStats();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDashboard();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Welcome to the Textile Waste Intelligence Platform.
            </p>
          </div>

          {loading ? (
            <p className="py-20 text-center">
              Loading Dashboard...
            </p>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Inventory"
                  value={dashboard?.total_inventory ?? 0}
                  icon={<Package size={28} />}
                  color="bg-blue-600"
                />

                <StatCard
                  title="Categories"
                  value={dashboard?.total_categories ?? 0}
                  icon={<Boxes size={28} />}
                  color="bg-green-600"
                />

                <StatCard
                  title="Total Weight"
                  value={`${dashboard?.total_weight ?? 0} kg`}
                  icon={<Weight size={28} />}
                  color="bg-purple-600"
                />

                <StatCard
                  title="Total Quantity"
                  value={dashboard?.total_quantity ?? 0}
                  icon={<Hash size={28} />}
                  color="bg-emerald-600"
                />
              </div>

              {/* Recent Inventory */}
              <RecentInventoryTable
                inventory={dashboard?.recent_inventory ?? []}
              />

              {/* Category Chart */}
              <CategoryChart
                data={dashboard?.category_distribution ?? []}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Admin
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          This module is under development.
        </p>
      </div>
    </DashboardLayout>
  );
}
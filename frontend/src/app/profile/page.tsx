import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          My Profile
        </h1>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            User Information
          </h2>

          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Name:</strong> Brajnandan Prasad
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> brajnandan@gmail.com
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              <strong>Role:</strong> Manufacturer
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
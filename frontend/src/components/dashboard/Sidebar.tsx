"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Inventory", href: "/inventory" },
  { name: "Upload", href: "/upload" },
  { name: "Classification", href: "/classification" },
  { name: "Recommendations", href: "/recommendations" },
  { name: "Analytics", href: "/analytics" },
  { name: "Reports", href: "/reports" },
  { name: "Sustainability", href: "/sustainability" },
  { name: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">
          Textile Waste
        </h1>

        <p className="text-sm text-gray-400">
          Intelligence Platform
        </p>
      </div>

      <nav className="px-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block rounded-lg px-4 py-3 mb-2 transition ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
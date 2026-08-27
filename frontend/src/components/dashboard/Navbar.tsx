"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 dark:border-gray-700 dark:bg-slate-900">
      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome to Textile Waste Intelligence Platform
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <ThemeToggle />

        <div className="text-right">
          <p className="font-semibold text-gray-800 dark:text-white">
            Brajnandan Prasad
          </p>

          <p className="text-sm text-gray-500">Administrator</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>

        <Image
          src="https://ui-avatars.com/api/?name=Brajnandan+Prasad"
          alt="User"
          width={40}
          height={40}
          unoptimized
          className="h-10 w-10 rounded-full border object-cover"
        />
      </div>
    </header>
  );
}

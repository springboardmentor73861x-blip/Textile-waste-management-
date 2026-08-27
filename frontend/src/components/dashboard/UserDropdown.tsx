"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface UserData {
  full_name: string;
  email: string;
  role: string;
}

export default function UserDropdown() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read user from localStorage (no setState)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
  logout();
  router.push("/login");
}

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <div className="text-right">
          <p className="font-semibold text-gray-800 dark:text-white">
            {user?.full_name ?? "Guest"}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.role ?? "User"}
          </p>
        </div>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-gray-200 p-4 dark:border-slate-700">
            <p className="font-semibold text-gray-800 dark:text-white">
              {user?.full_name ?? "Guest"}
            </p>

            <p className="text-sm text-gray-500">
              {user?.email ?? ""}
            </p>
          </div>

          <button className="flex w-full items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-slate-800">
            <User size={18} />
            My Profile
          </button>

          <button className="flex w-full items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-slate-800">
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
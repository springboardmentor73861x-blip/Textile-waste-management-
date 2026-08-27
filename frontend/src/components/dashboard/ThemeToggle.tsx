"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="rounded-lg border border-gray-300 p-2"
        aria-label="Theme Toggle"
      >
        <Moon size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        setTheme(
          resolvedTheme === "dark" ? "light" : "dark"
        )
      }
      className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      aria-label="Theme Toggle"
    >
      {resolvedTheme === "dark" ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
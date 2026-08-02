import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
}

export default function Button({
  children,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      className="
        w-full
        rounded-lg
        bg-blue-600
        py-3
        text-lg
        font-semibold
        text-white
        transition
        hover:bg-blue-700
      "
    >
      {children}
    </button>
  );
}
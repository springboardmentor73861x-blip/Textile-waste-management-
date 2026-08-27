import React from "react";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-center text-5xl font-bold">
        {title}
      </h1>

      <p className="mb-8 text-center text-gray-500">
        {subtitle}
      </p>

      {children}
    </div>
  );
}
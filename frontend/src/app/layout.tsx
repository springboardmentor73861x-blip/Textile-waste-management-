import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Textile Waste Intelligence Platform",
  description: "AI Powered Textile Waste Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
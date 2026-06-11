import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dreamweaver — Bedtime Story Generator",
  description:
    "Turn your child's day into a magical bedtime story, written just for them.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

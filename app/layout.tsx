import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taas — Marriage & Call Break Score Tracker",
  description: "A simple, family-friendly score tracker for Marriage and Call Break.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

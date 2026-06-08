import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAMPAM Uzbekistan - Xo'roz vitaminlari",
  description: "Thailand №1 xo'roz vitaminlari brendining O'zbekistondagi rasmiy importchisi. Butun O'zbekiston bo'ylab BEPUL yetkazib berish.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}

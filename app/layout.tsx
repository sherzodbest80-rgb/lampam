import type { Metadata } from "next";
import "./globals.css";
import MetaPixel from "../components/MetaPixel";

export const metadata: Metadata = {
  title: "ROOST Uzbekistan - Xo'roz vitaminlari",
  description: "№1 xo'roz vitaminlari brendining O'zbekistondagi rasmiy importchisi. Butun O'zbekiston bo'ylab BEPUL yetkazib berish.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}

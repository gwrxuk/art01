import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "書法 · Calligraphy",
  description: "Interactive Chinese calligraphy art experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-stone-950">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "GadgetGlimpse - Smart Product Review Analysis",
  description: "Analyze product reviews across multiple shopping sites instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gradient-to-b from-purple-950 to-black overflow-x-hidden">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TechBuddy — Your AI Helper for Any App",
  description:
    "Upload a screenshot of any app and get simple, clear step-by-step instructions. Designed for seniors and anyone who needs a helping hand with technology.",
  keywords:
    "senior tech help, AI screenshot assistant, app helper, technology for seniors, scam detection",
  openGraph: {
    title: "TechBuddy — Your AI Helper for Any App",
    description:
      "Upload a screenshot and get simple, clear instructions. Powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}

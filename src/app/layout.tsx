import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MMA Business Prosperity Weapon | AI-Powered Business Development",
  description: "AI-powered platform that discovers global opportunities, analyzes leads, and generates winning proposals automatically.",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#07080F" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#07080F] text-foreground overflow-x-hidden`}>
        <div
          aria-hidden
          className="fixed inset-0 -z-10 pointer-events-none opacity-[0.06] bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/logo.jpg')", backgroundSize: "40%" }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

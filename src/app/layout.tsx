import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/seo/StructuredData";
import { AnalyticsContextProvider } from "@/lib/analytics/AnalyticsContext";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "High Roller Club - Premium AI-Powered Discord Casino Experience",
    template: "%s | High Roller Club"
  },
  description: "Step into the most exclusive virtual casino experience. Join High Roller Club on Discord for AI-powered games, realistic 3D environments, and VIP treatment. Play Blackjack, Roulette, Poker, Slots, Craps, and more with cutting-edge technology.",
  keywords: [
    "discord casino", "AI casino", "virtual casino", "discord bot", "casino games",
    "blackjack", "roulette", "poker", "slots", "craps", "horse racing",
    "3D casino", "immersive gaming", "VIP casino", "high roller", "premium gaming",
    "discord gambling", "casino simulation", "realistic casino", "exclusive club"
  ],
  authors: [{ name: "High Roller Club", url: "https://highrollerclub.com" }],
  creator: "High Roller Club",
  publisher: "High Roller Club",
  category: "Gaming",
  classification: "Entertainment",
  openGraph: {
    title: "High Roller Club - Premium AI-Powered Discord Casino Experience",
    description: "Experience the ultimate virtual casino with AI-powered games, 3D environments, and exclusive VIP treatment. Join the most innovative Discord casino today.",
    type: "website",
    locale: "en_US",
    url: "https://highrollerclub.com",
    siteName: "High Roller Club",
    images: [
      {
        url: "/images/og-casino-main.jpg",
        width: 1200,
        height: 630,
        alt: "High Roller Club - Premium Discord Casino Experience",
        type: "image/jpeg"
      },
      {
        url: "/images/og-casino-tables.jpg", 
        width: 1200,
        height: 630,
        alt: "Immersive 3D Casino Tables - High Roller Club",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@HighRollerClub",
    creator: "@HighRollerClub",
    title: "High Roller Club - Premium AI-Powered Discord Casino",
    description: "Experience the ultimate virtual casino with AI-powered games, 3D environments, and exclusive VIP treatment.",
    images: ["/images/twitter-casino-card.jpg"]
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code"
  },
  alternates: {
    canonical: "https://highrollerclub.com"
  },
  other: {
    "theme-color": "#1a1a1a",
    "color-scheme": "dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-casino-black text-casino-white min-h-screen`}
      >
        <AnalyticsContextProvider>
          <StructuredData type="website" />
          <StructuredData type="organization" />
          {children}
          <AnalyticsDashboard />
        </AnalyticsContextProvider>
      </body>
    </html>
  );
}

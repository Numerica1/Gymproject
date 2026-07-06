import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import FloatingWidgets from "../components/FloatingWidgets";

export const metadata: Metadata = {
  title: {
    default: "Fitness Bhaktapur | Premier Gym & Fitness Center",
    template: "%s | Fitness Bhaktapur",
  },
  description:
    "Fitness Bhaktapur - professional gym memberships, expert personal trainers, and results-driven fitness programs in Bhaktapur, Nepal.",
  keywords: ["gym", "fitness", "Bhaktapur", "Nepal", "personal training", "membership", "workout"],
  authors: [{ name: "Fitness Bhaktapur" }],
  creator: "Fitness Bhaktapur",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fitnessbhaktapur.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Fitness Bhaktapur",
    title: "Fitness Bhaktapur | Premier Gym & Fitness Center",
    description:
      "Professional gym memberships, expert trainers, and results-driven programs in Bhaktapur, Nepal.",
    images: [
      {
        url: "/images/hero-gym.jpg",
        width: 1200,
        height: 630,
        alt: "Fitness Bhaktapur Gym",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness Bhaktapur | Premier Gym & Fitness Center",
    description: "Professional gym memberships, expert trainers, and fitness programs in Bhaktapur, Nepal.",
    images: ["/images/hero-gym.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071421",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingWidgets />
      </body>
    </html>
  );
}

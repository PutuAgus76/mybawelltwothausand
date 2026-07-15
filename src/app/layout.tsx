import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'Our Love Story 💕',
    template: '%s | Our Love Story',
  },
  description: 'Sebuah perjalanan cinta yang indah',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("h-full scroll-smooth", "font-sans", geist.variable)}>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}

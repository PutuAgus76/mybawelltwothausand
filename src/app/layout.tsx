import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="id" className="h-full scroll-smooth">
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

import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'KartMaint Enterprise | Go-Kart Fleet & Maintenance Platform',
  description:
    'Enterprise-ready Go-Kart fleet maintenance, parts inventory, security audit logs, and operational telemetry platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full bg-[#090d16] text-slate-100 antialiased">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  );
}

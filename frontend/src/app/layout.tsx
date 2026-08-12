import "./globals.css";

export const metadata = {
  title: "KartMaint",
  description: "Karting fleet maintenance management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
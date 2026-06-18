import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIC Photobooth",
  description: "Photobooth interactiva para TIC Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

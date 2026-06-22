import type { Metadata } from "next";
import { Raleway, Roboto_Mono } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-raleway",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

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
    <html lang="es" className={`${raleway.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

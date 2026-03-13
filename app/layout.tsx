import type { Metadata, Viewport } from "next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-title",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Guinguette des Marmouz - Programmation",
  description: "Gestion des dates ouvertes et candidatures artistes.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FFF7E8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className={`${inter.variable} ${pacifico.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

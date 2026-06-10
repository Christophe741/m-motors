import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Toaster } from "sonner";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "M-Motors - Vente et Location de Véhicules d'Occasion",
  description:
    "Spécialiste en vente et location longue durée de véhicules d'occasion depuis 1987. Large choix de véhicules de qualité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <DemoBanner />
          {children}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-slate-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                Trouvez votre véhicule idéal
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Spécialiste en vente et location longue durée de véhicules
                d'occasion depuis 1987. Plus de 1 million de clients nous font
                confiance.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" asChild>
                  <Link href="/search">
                    <Car className="mr-2 h-5 w-5" />
                    Rechercher un véhicule
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">Créer un compte</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

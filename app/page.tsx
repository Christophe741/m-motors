import Link from "next/link";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Shield, Smartphone, CheckCircle, Award } from "lucide-react";
import { verifyToken } from "@/lib/jwt";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mmotors_token")?.value;
  const user = token ? await verifyToken(token) : null;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center py-10 md:py-20">
          <div aria-hidden="true" className="absolute inset-0 bg-slate-900/70" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Trouvez votre véhicule idéal
              </h1>
              <p className="text-lg md:text-xl text-slate-200 mb-8">
                Spécialiste en vente et location longue durée de véhicules
                d'occasion depuis 1987. Plus de 1 million de clients nous font
                confiance.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/search">
                    <Car className="mr-2 h-5 w-5" />
                    Rechercher un véhicule
                  </Link>
                </Button>
                {!user && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/register">Créer un compte</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Pourquoi choisir M-Motors ?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Large Choix</CardTitle>
                  <CardDescription>
                    Plus de 20 véhicules disponibles à la vente ou à la location
                    avec des options variées
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Qualité Garantie</CardTitle>
                  <CardDescription>
                    Tous nos véhicules sont contrôlés, entretenus et garantis
                    pour votre sécurité
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>100% Digital</CardTitle>
                  <CardDescription>
                    Dossiers dématérialisés et suivi en temps réel de votre
                    demande en ligne
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section className="py-8 md:py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
                Nos Services
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                Un accompagnement complet pour votre projet automobile
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Vente de véhicules d'occasion
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Large gamme de marques et modèles, tous contrôlés et
                      garantis
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Location longue durée avec option d'achat
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Flexibilité et sérénité avec nos formules tout compris
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Service après-vente</h3>
                    <p className="text-sm text-muted-foreground">
                      Entretien, réparations et assistance pour votre véhicule
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Solutions de financement
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Partenariats avec organismes financiers pour faciliter
                      votre achat
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Reprise de votre ancien véhicule
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estimation gratuite et reprise au meilleur prix
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Essai routier</h3>
                    <p className="text-sm text-muted-foreground">
                      Testez le véhicule avant de vous décider
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Stats Section */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <div className="text-4xl font-bold mb-2">30+ ans</div>
                <div className="text-muted-foreground">d'expérience</div>
              </div>
              <div>
                <div className="flex justify-center mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <div className="text-4xl font-bold mb-2">800</div>
                <div className="text-muted-foreground">employés</div>
              </div>
              <div>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <div className="text-4xl font-bold mb-2">1M+</div>
                <div className="text-muted-foreground">clients satisfaits</div>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-8 md:py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à trouver votre véhicule ?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Parcourez notre catalogue en ligne et déposez votre dossier en
              quelques clics
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/search">Voir nos véhicules disponibles</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

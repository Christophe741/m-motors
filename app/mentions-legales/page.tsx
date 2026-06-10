import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Mentions légales - M-Motors",
  description:
    "Mentions légales du site de démonstration M-Motors, projet réalisé dans le cadre d'une formation.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            Mentions légales
          </h1>

          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 p-4 mb-10 text-sm leading-relaxed">
            <strong>Site de démonstration.</strong> Ce site est réalisé dans le
            cadre d&apos;une formation et n&apos;a aucune vocation commerciale.
            La société « M-Motors » ainsi que l&apos;ensemble des informations
            présentées (véhicules, prix, coordonnées, statistiques) sont
            fictifs ou utilisés à titre purement illustratif. Aucune
            transaction réelle n&apos;y est effectuée.
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Éditeur du site
              </h2>
              <p>
                Ce site est édité par un étudiant dans le cadre d&apos;un projet
                pédagogique, à des fins de démonstration et d&apos;apprentissage,
                sans but lucratif.
              </p>
              <p className="mt-2">
                Contact :{" "}
                <a
                  href="mailto:c.winkel.pro@gmail.com"
                  className="text-primary hover:underline"
                >
                  c.winkel.pro@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Hébergement
              </h2>
              <p>
                Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133,
                Walnut, CA 91789, États-Unis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Propriété intellectuelle
              </h2>
              <p>
                Les marques, logos et visuels pouvant apparaître sur ce site
                restent la propriété de leurs détenteurs respectifs. Ils sont,
                le cas échéant, utilisés uniquement à titre illustratif dans un
                cadre pédagogique et non commercial.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Données personnelles
              </h2>
              <p>
                Ce site étant une démonstration, aucune donnée réelle ne doit y
                être saisie. Les comptes et formulaires sont destinés à des
                tests : n&apos;y renseignez pas de données personnelles ou
                bancaires réelles. Les éventuelles données enregistrées le sont
                à des fins de test et peuvent être supprimées à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Responsabilité
              </h2>
              <p>
                Les informations diffusées sur ce site étant fictives, elles ne
                sauraient engager une quelconque responsabilité contractuelle ou
                commerciale. Aucune offre de vente, de location ou de
                financement présentée ici n&apos;a de valeur réelle.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

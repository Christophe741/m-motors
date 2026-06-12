import VehicleSearchClient from "@/components/client/VehicleSearchClient";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getVehicles, getAllMarques } from "@/server/database";
import { VEHICLES_PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  // Le catalogue public n'affiche que les véhicules disponibles
  const [{ vehicles, total }, marques] = await Promise.all([
    getVehicles({ statut: "disponible" }, { page: 1, limit: VEHICLES_PAGE_SIZE }),
    getAllMarques(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-slate-50">
        <VehicleSearchClient
          initialVehicles={vehicles}
          initialTotal={total}
          marques={marques}
        />
      </main>
      <Footer />
    </div>
  );
}

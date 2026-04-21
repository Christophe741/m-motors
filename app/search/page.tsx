import VehicleSearchClient from "@/components/client/VehicleSearchClient";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getVehicles, getAllMarques } from "@/server/database";

export default async function SearchPage() {
  const [initialVehicles, marques] = await Promise.all([
    getVehicles(),
    getAllMarques(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-slate-50">
        <VehicleSearchClient
          initialVehicles={initialVehicles}
          marques={marques}
        />
      </main>
      <Footer />
    </div>
  );
}

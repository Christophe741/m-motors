import VehicleSearchClient from "@/components/client/VehicleSearchClient";
import { getVehicles, getAllMarques } from "@/server/database";

export default async function SearchPage() {
  const [initialVehicles, marques] = await Promise.all([
    getVehicles(),
    getAllMarques(),
  ]);

  return (
    <main className="flex-1 bg-slate-50">
      <VehicleSearchClient
        initialVehicles={initialVehicles}
        marques={marques}
      />
    </main>
  );
}

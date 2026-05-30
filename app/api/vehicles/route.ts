import { NextRequest, NextResponse } from "next/server";
import { getVehicles } from "@/server/database";
import { VehicleFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: VehicleFilters = {};

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const type_offre = searchParams.get("type_offre");
    if (type_offre === "vente" || type_offre === "location") {
      filters.type_offre = type_offre;
    }

    const marque = searchParams.get("marque");
    if (marque) filters.marque = marque;

    const prix_min = searchParams.get("prix_min");
    if (prix_min) filters.prix_min = parseInt(prix_min, 10);

    const prix_max = searchParams.get("prix_max");
    if (prix_max) filters.prix_max = parseInt(prix_max, 10);

    const annee_min = searchParams.get("annee_min");
    if (annee_min) filters.annee_min = parseInt(annee_min, 10);

    const annee_max = searchParams.get("annee_max");
    if (annee_max) filters.annee_max = parseInt(annee_max, 10);

    const kilometrage_max = searchParams.get("kilometrage_max");
    if (kilometrage_max) filters.kilometrage_max = parseInt(kilometrage_max, 10);

    const carburant = searchParams.get("carburant");
    if (carburant) filters.carburant = carburant;

    const transmission = searchParams.get("transmission");
    if (transmission) filters.transmission = transmission;

    const vehicles = await getVehicles(filters);

    return NextResponse.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

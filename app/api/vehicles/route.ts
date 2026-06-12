import { NextRequest, NextResponse } from "next/server";
import { getVehicles, createVehicle } from "@/server/database";
import { StatutVehicule, VehicleFilters } from "@/lib/types";
import { getAuthUser } from "@/lib/jwt";
import { withErrorHandler } from "@/lib/api-handler";
import { VEHICLES_PAGE_SIZE, VEHICLES_MAX_PAGE_SIZE } from "@/lib/constants";

const STATUTS_VALIDES: StatutVehicule[] = [
  "disponible",
  "reserve",
  "vendu",
  "loue",
  "maintenance",
];

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const vehicle = await createVehicle(body);
  return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
});

export const GET = withErrorHandler(async (request: NextRequest) => {
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

  const statut = searchParams.get("statut") as StatutVehicule | null;
  if (statut && STATUTS_VALIDES.includes(statut)) filters.statut = statut;

  const page = parsePositiveInt(searchParams.get("page")) ?? 1;
  const limit = Math.min(
    parsePositiveInt(searchParams.get("limit")) ?? VEHICLES_PAGE_SIZE,
    VEHICLES_MAX_PAGE_SIZE
  );

  const { vehicles, total } = await getVehicles(filters, { page, limit });

  return NextResponse.json({
    success: true,
    data: vehicles,
    count: vehicles.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

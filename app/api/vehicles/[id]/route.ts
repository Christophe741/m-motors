import { NextRequest, NextResponse } from "next/server";
import { getVehicleById } from "@/server/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

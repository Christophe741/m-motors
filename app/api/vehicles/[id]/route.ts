import { NextRequest, NextResponse } from "next/server";
import { getVehicleById } from "@/server/database";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return NextResponse.json(
      { success: false, error: "Véhicule non trouvé" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: vehicle });
});

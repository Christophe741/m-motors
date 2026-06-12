import { NextResponse } from "next/server";
import { getAllMarques } from "@/server/database";
import { withErrorHandler } from "@/lib/api-handler";

export const GET = withErrorHandler(async () => {
  const marques = await getAllMarques();
  return NextResponse.json({ success: true, data: marques });
});

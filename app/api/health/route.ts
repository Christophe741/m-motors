import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { withErrorHandler } from "@/lib/api-handler";

/**
 * Health check — vérifie que l'application répond et que la base de données
 * est joignable. Utilisé pour le monitoring (Docker healthcheck, sondes externes).
 *
 * 200 -> tout est opérationnel ; 503 -> la base de données est injoignable.
 */
export const GET = withErrorHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json(
      { status: "error", database: "down", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    database: "up",
    timestamp: new Date().toISOString(),
  });
});

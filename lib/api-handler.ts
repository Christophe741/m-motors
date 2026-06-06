/**
 * Gestion d'erreur centralisée pour les routes API
 *
 * `withErrorHandler` enrobe un Route Handler Next.js et prend en charge :
 *  - le log structuré de chaque requête (méthode, chemin, statut, durée) ;
 *  - la distinction entre erreurs « attendues » (ApiError -> 4xx, juste loguées
 *    en warn) et erreurs serveur non gérées (-> 500, loguées en error) ;
 *  - le déclenchement d'une alerte sur toute erreur 500.
 *
 * Les routes n'ont plus besoin de répéter leur propre try/catch : il suffit de
 * lever une ApiError pour les erreurs métier, ou de laisser remonter toute autre
 * exception qui sera traitée comme une erreur serveur.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { sendAlert } from "@/lib/alerting";

/** Erreur métier « attendue » : produit une réponse 4xx propre, sans alerte. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RouteHandler<TArgs extends unknown[]> = (
  request: NextRequest,
  ...args: TArgs
) => Promise<NextResponse>;

export function withErrorHandler<TArgs extends unknown[]>(
  handler: RouteHandler<TArgs>
): RouteHandler<TArgs> {
  return async (request: NextRequest, ...args: TArgs): Promise<NextResponse> => {
    const start = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    try {
      const response = await handler(request, ...args);

      logger.info("requête traitée", {
        method,
        path,
        status: response.status,
        durationMs: Date.now() - start,
      });

      return response;
    } catch (error) {
      const durationMs = Date.now() - start;

      // Erreur métier attendue -> 4xx, simple warning, pas d'alerte.
      if (error instanceof ApiError) {
        logger.warn("erreur métier", {
          method,
          path,
          status: error.status,
          message: error.message,
          durationMs,
        });
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.status }
        );
      }

      // Erreur serveur non gérée -> 500, log + alerte.
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      logger.error("erreur serveur non gérée", {
        method,
        path,
        durationMs,
        error: message,
        stack,
      });

      await sendAlert({
        title: `Erreur 500 sur ${method} ${path}`,
        message,
        context: {
          method,
          path,
          stack: stack ?? "(pas de stack)",
        },
      });

      return NextResponse.json(
        { success: false, error: "Erreur serveur" },
        { status: 500 }
      );
    }
  };
}

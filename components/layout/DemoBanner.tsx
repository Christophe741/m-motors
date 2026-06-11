"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const STORAGE_KEY = "demo-banner-dismissed";

export function DemoBanner() {
  // On part de `false` pour éviter un mismatch d'hydratation SSR/client :
  // le bandeau n'apparaît qu'après lecture du localStorage côté client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-300 text-amber-900"
    >
      <div className="container mx-auto px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed flex-1">
          <strong>Site de démonstration — Projet étudiant.</strong>{" "}
          <span className="md:hidden">
            Ne saisissez aucune donnée personnelle ou bancaire réelle.
          </span>
          <span className="hidden md:inline">
            Ce site est réalisé dans le cadre d&apos;une formation et n&apos;est
            pas un service commercial réel. Aucun véhicule n&apos;est réellement
            proposé à la vente ou à la location, aucune transaction n&apos;est
            traitée.{" "}
            <strong>
              Ne saisissez aucune donnée personnelle ou bancaire réelle.
            </strong>{" "}
            Les marques, prix et contenus sont fictifs ou utilisés à titre
            illustratif.
          </span>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 p-2 -m-1 rounded-md hover:bg-amber-100 transition"
          aria-label="Fermer le bandeau"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

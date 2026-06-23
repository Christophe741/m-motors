import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StatutVehicule } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Libellé client pour un véhicule indisponible. `maintenance` est un état
// purement interne : on l'expose au client comme un simple « Indisponible ».
export function getStatutIndisponibleLabel(statut: StatutVehicule): string {
  switch (statut) {
    case "reserve":
      return "Réservé";
    case "vendu":
      return "Vendu";
    case "loue":
      return "Loué";
    default:
      return "Indisponible";
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatKilometrage(km: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(km)} km`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

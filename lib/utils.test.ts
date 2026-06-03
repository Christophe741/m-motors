import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatKilometrage, formatDate } from "@/lib/utils";

// Les espaces insécables utilisés par Intl en fr-FR ne sont pas de simples espaces.
// On normalise pour comparer le contenu sans dépendre du type d'espace.
const normalize = (s: string) => s.replace(/ | /g, " ");

describe("cn", () => {
  it("fusionne plusieurs classes", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("résout les conflits Tailwind (la dernière gagne)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignore les valeurs conditionnelles fausses", () => {
    expect(cn("base", false && "caché", undefined, "visible")).toBe("base visible");
  });
});

describe("formatPrice", () => {
  it("formate un prix en euros sans décimales", () => {
    expect(normalize(formatPrice(15000))).toBe("15 000 €");
  });

  it("formate zéro", () => {
    expect(normalize(formatPrice(0))).toBe("0 €");
  });

  it("arrondit les décimales", () => {
    expect(normalize(formatPrice(1999.99))).toBe("2 000 €");
  });
});

describe("formatKilometrage", () => {
  it("ajoute le suffixe km avec séparateur de milliers", () => {
    expect(normalize(formatKilometrage(120000))).toBe("120 000 km");
  });

  it("gère zéro kilomètre", () => {
    expect(normalize(formatKilometrage(0))).toBe("0 km");
  });
});

describe("formatDate", () => {
  it("formate une date ISO en français", () => {
    expect(formatDate("2026-06-03")).toBe("3 juin 2026");
  });
});

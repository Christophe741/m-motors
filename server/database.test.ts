import { describe, it, expect, vi, beforeEach } from "vitest";

// ----------------------------------------------------------------------------
// MOCKS : on remplace la vraie base Prisma et bcrypt par de fausses versions.
// Aucun appel réseau, aucune vraie base de données n'est touchée.
// ----------------------------------------------------------------------------
// vi.mock est hoisté en haut du fichier : on déclare le mock via vi.hoisted
// pour qu'il existe au moment où la factory du mock est exécutée.
const prismaMock = vi.hoisted(() => ({
  utilisateur: { findUnique: vi.fn(), create: vi.fn() },
  vehicule: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    create: vi.fn(),
  },
  dossier: { findUnique: vi.fn(), findMany: vi.fn() },
  option: { findMany: vi.fn() },
  // $transaction reçoit un tableau de promesses (les appels Prisma sont
  // déjà déclenchés par les mocks ci-dessus) : on les résout simplement
  $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
}));

vi.mock("@/server/prisma", () => ({ prisma: prismaMock }));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hash-bidon"),
    compare: vi.fn(async (plain: string) => plain === "bon-mot-de-passe"),
  },
}));

// On importe APRÈS avoir déclaré les mocks
import {
  getUserByEmail,
  createUser,
  verifyPassword,
  getVehicles,
  createVehicle,
  getVehicleById,
  getAllMarques,
  getAllOptions,
  getDossierById,
  getDossiersByClientId,
  getAllDossiers,
} from "@/server/database";

const DATE = new Date("2026-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
});

// ----------------------------------------------------------------------------
// UTILISATEURS
// ----------------------------------------------------------------------------
describe("getUserByEmail", () => {
  it("retourne l'utilisateur avec created_at en ISO string", async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      created_at: DATE,
    });

    const user = await getUserByEmail("a@b.com");

    expect(prismaMock.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { email: "a@b.com" },
    });
    expect(user?.created_at).toBe(DATE.toISOString());
  });

  it("retourne null si aucun utilisateur trouvé", async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);
    expect(await getUserByEmail("inconnu@b.com")).toBeNull();
  });
});

describe("createUser", () => {
  it("hashe le mot de passe avant de créer l'utilisateur", async () => {
    prismaMock.utilisateur.create.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      mot_de_passe: "hash-bidon",
      created_at: DATE,
    });

    const user = await createUser({
      email: "a@b.com",
      mot_de_passe: "clair",
      nom: "Doe",
      prenom: "John",
      telephone: "0600000000",
      adresse: "1 rue X",
      role: "client",
    });

    // Le mot de passe stocké est le hash, jamais le mot de passe en clair
    const createArg = prismaMock.utilisateur.create.mock.calls[0][0];
    expect(createArg.data.mot_de_passe).toBe("hash-bidon");
    expect(user.created_at).toBe(DATE.toISOString());
  });
});

describe("verifyPassword", () => {
  it("retourne true pour le bon mot de passe", async () => {
    expect(await verifyPassword("bon-mot-de-passe", "hash")).toBe(true);
  });

  it("retourne false pour un mauvais mot de passe", async () => {
    expect(await verifyPassword("mauvais", "hash")).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// VEHICULES
// ----------------------------------------------------------------------------
describe("getVehicles", () => {
  beforeEach(() => {
    prismaMock.vehicule.findMany.mockResolvedValue([
      {
        id: "v1",
        marque: "Peugeot",
        prix_vente: 15000,
        prix_location_mensuel: null,
        created_at: DATE,
      },
    ]);
    prismaMock.vehicule.count.mockResolvedValue(1);
  });

  it("sans filtre : where vide, pagination par défaut et conversion des prix/dates", async () => {
    const result = await getVehicles();
    expect(prismaMock.vehicule.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      select: expect.any(Object),
      skip: 0,
      take: 12,
    });
    expect(result.total).toBe(1);
    expect(result.vehicles[0].prix_vente).toBe(15000);
    expect(result.vehicles[0].prix_location_mensuel).toBeNull();
    expect(result.vehicles[0].created_at).toBe(DATE.toISOString());
  });

  it("applique page et limit (skip/take)", async () => {
    await getVehicles(undefined, { page: 3, limit: 10 });
    const arg = prismaMock.vehicule.findMany.mock.calls[0][0];
    expect(arg.skip).toBe(20);
    expect(arg.take).toBe(10);
  });

  it("plafonne limit à 100", async () => {
    await getVehicles(undefined, { limit: 5000 });
    expect(prismaMock.vehicule.findMany.mock.calls[0][0].take).toBe(100);
  });

  it("ne sélectionne pas la description dans les listes", async () => {
    await getVehicles();
    const select = prismaMock.vehicule.findMany.mock.calls[0][0].select;
    expect(select.description).toBeUndefined();
    expect(select.marque).toBe(true);
  });

  it("construit les conditions AND à partir de tous les filtres", async () => {
    await getVehicles({
      search: "208",
      type_offre: "vente",
      marque: "Peugeot",
      prix_min: 5000,
      prix_max: 20000,
      annee_min: 2018,
      annee_max: 2024,
      kilometrage_max: 100000,
      carburant: "essence",
      transmission: "auto",
      statut: "disponible",
    });

    const where = prismaMock.vehicule.findMany.mock.calls[0][0].where;
    // 9 conditions : prix (min+max) et année (min+max) sont chacun regroupés
    // en une seule condition, d'où 11 filtres -> 9 entrées dans AND.
    expect(where.AND).toBeInstanceOf(Array);
    expect(where.AND.length).toBe(9);
  });

  it("gère prix_min seul (sans prix_max)", async () => {
    await getVehicles({ prix_min: 5000 });
    const where = prismaMock.vehicule.findMany.mock.calls[0][0].where;
    expect(where.AND[0]).toEqual({ prix_vente: { gte: 5000 } });
  });

  it("filtre le prix sur prix_vente par défaut, sans toucher au loyer", async () => {
    await getVehicles({ prix_max: 10000 });
    const where = prismaMock.vehicule.findMany.mock.calls[0][0].where;
    expect(where.AND[0]).toEqual({ prix_vente: { lte: 10000 } });
  });

  it("filtre le prix sur le loyer mensuel quand type_offre est location", async () => {
    await getVehicles({ type_offre: "location", prix_max: 500 });
    const where = prismaMock.vehicule.findMany.mock.calls[0][0].where;
    expect(where.AND).toContainEqual({ prix_location_mensuel: { lte: 500 } });
  });
});

describe("createVehicle", () => {
  it("crée un véhicule et convertit les prix null", async () => {
    prismaMock.vehicule.create.mockResolvedValue({
      id: "v1",
      marque: "Renault",
      prix_vente: null,
      prix_location_mensuel: 300,
      created_at: DATE,
    });

    const vehicle = await createVehicle({
      marque: "Renault",
      modele: "Clio",
      motorisation: "1.5 dCi",
      kilometrage: 50000,
      annee: 2022,
      type_offre: "location",
      statut: "disponible",
      photos: [],
      description: "",
    } as Parameters<typeof createVehicle>[0]);

    // Valeurs par défaut appliquées : prix_vente -> null, options -> []
    const arg = prismaMock.vehicule.create.mock.calls[0][0];
    expect(arg.data.prix_vente).toBeNull();
    expect(arg.data.options).toEqual([]);
    expect(vehicle.prix_location_mensuel).toBe(300);
  });
});

describe("getVehicleById", () => {
  it("retourne le véhicule trouvé", async () => {
    prismaMock.vehicule.findUnique.mockResolvedValue({
      id: "v1",
      prix_vente: 9000,
      prix_location_mensuel: null,
      created_at: DATE,
    });
    const v = await getVehicleById("v1");
    expect(v?.id).toBe("v1");
  });

  it("retourne null si introuvable", async () => {
    prismaMock.vehicule.findUnique.mockResolvedValue(null);
    expect(await getVehicleById("xxx")).toBeNull();
  });
});

describe("getAllMarques", () => {
  it("retourne la liste des marques distinctes", async () => {
    prismaMock.vehicule.groupBy.mockResolvedValue([
      { marque: "Audi" },
      { marque: "BMW" },
    ]);
    expect(await getAllMarques()).toEqual(["Audi", "BMW"]);
  });
});

// ----------------------------------------------------------------------------
// DOSSIERS
// ----------------------------------------------------------------------------
// Un dossier renvoyé par Prisma, avec les relations imbriquées
const dossierBrut = (overrides = {}) => ({
  id: "d1",
  client_id: "u1",
  date_creation: DATE,
  date_modification: DATE,
  documents: [{ id: "doc1", date_upload: DATE }],
  contrat_location: {
    id: "c1",
    prix_rachat: 5000,
    created_at: DATE,
  },
  ...overrides,
});

describe("getDossierById", () => {
  it("convertit les dates et le contrat quand il existe", async () => {
    prismaMock.dossier.findUnique.mockResolvedValue(dossierBrut());
    const d = await getDossierById("d1");
    expect(d?.date_creation).toBe(DATE.toISOString());
    expect(d?.documents[0].date_upload).toBe(DATE.toISOString());
    expect(d?.contrat_location?.prix_rachat).toBe(5000);
    expect(d?.contrat_location?.created_at).toBe(DATE.toISOString());
  });

  it("gère un dossier sans contrat de location", async () => {
    prismaMock.dossier.findUnique.mockResolvedValue(
      dossierBrut({ contrat_location: null })
    );
    const d = await getDossierById("d1");
    expect(d?.contrat_location).toBeUndefined();
  });

  it("retourne null si introuvable", async () => {
    prismaMock.dossier.findUnique.mockResolvedValue(null);
    expect(await getDossierById("xxx")).toBeNull();
  });
});

describe("getDossiersByClientId", () => {
  it("retourne les dossiers du client avec dates converties", async () => {
    prismaMock.dossier.findMany.mockResolvedValue([dossierBrut()]);
    const list = await getDossiersByClientId("u1");
    expect(prismaMock.dossier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { client_id: "u1" } })
    );
    expect(list[0].date_creation).toBe(DATE.toISOString());
  });

  it("gère un dossier sans contrat", async () => {
    prismaMock.dossier.findMany.mockResolvedValue([
      dossierBrut({ contrat_location: null }),
    ]);
    const list = await getDossiersByClientId("u1");
    expect(list[0].contrat_location).toBeUndefined();
  });
});

describe("getAllDossiers", () => {
  it("retourne tous les dossiers avec conversions", async () => {
    prismaMock.dossier.findMany.mockResolvedValue([dossierBrut()]);
    const list = await getAllDossiers();
    expect(list[0].contrat_location?.prix_rachat).toBe(5000);
  });
});

// ----------------------------------------------------------------------------
// OPTIONS
// ----------------------------------------------------------------------------
describe("getAllOptions", () => {
  it("convertit prix_mensuel et created_at", async () => {
    prismaMock.option.findMany.mockResolvedValue([
      { id: "o1", nom: "GPS", prix_mensuel: 10, created_at: DATE },
    ]);
    const options = await getAllOptions();
    expect(options[0].prix_mensuel).toBe(10);
    expect(options[0].created_at).toBe(DATE.toISOString());
  });
});

/**
 * Couche d'accès aux données avec Prisma ORM
 *
 * Cette couche fournit une abstraction pour toutes les opérations de base de données.
 */

import { Dossier, Option, Utilisateur, Vehicule, VehiculeListItem, VehicleFilters } from '@/lib/types';
import { VEHICLES_PAGE_SIZE, VEHICLES_MAX_PAGE_SIZE } from '@/lib/constants';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import type { Decimal } from '@prisma/client/runtime/client';

function toNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

const BCRYPT_ROUNDS = 10;

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Récupère un utilisateur par email
 */
export async function getUserByEmail(email: string): Promise<Utilisateur | null> {
  const user = await prisma.utilisateur.findUnique({
    where: { email },
  });

  if (!user) return null;

  return {
    ...user,
    created_at: user.created_at.toISOString(),
  } as Utilisateur;
}

/**
 * Crée un nouvel utilisateur avec mot de passe hashé
 */
export async function createUser(
  userData: Omit<Utilisateur, 'id' | 'created_at'>
): Promise<Utilisateur> {
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.mot_de_passe, BCRYPT_ROUNDS);

  const user = await prisma.utilisateur.create({
    data: {
      ...userData,
      mot_de_passe: hashedPassword,
    },
  });

  return {
    ...user,
    created_at: user.created_at.toISOString(),
  } as Utilisateur;
}

/**
 * Vérifie le mot de passe d'un utilisateur
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// ============================================
// VEHICLE OPERATIONS
// ============================================

// Champs nécessaires aux cartes/listes : la description et les options
// ne sont chargées que sur la page détail (getVehicleById)
const vehicleListSelect = {
  id: true,
  marque: true,
  modele: true,
  motorisation: true,
  kilometrage: true,
  annee: true,
  prix_vente: true,
  prix_location_mensuel: true,
  type_offre: true,
  statut: true,
  photos: true,
  carburant: true,
  transmission: true,
  puissance: true,
  couleur: true,
  created_at: true,
} as const;

export interface VehiclesPage {
  vehicles: VehiculeListItem[];
  total: number;
}

export interface VehiclesPagination {
  page?: number;
  limit?: number;
}

export async function getVehicles(
  filters?: VehicleFilters,
  pagination?: VehiclesPagination
): Promise<VehiclesPage> {
  const andConditions: Record<string, unknown>[] = [];

  if (filters) {
    if (filters.search) {
      andConditions.push({
        OR: [
          { marque: { contains: filters.search, mode: 'insensitive' } },
          { modele: { contains: filters.search, mode: 'insensitive' } },
          { motorisation: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    if (filters.type_offre) {
      andConditions.push({ type_offre: { in: [filters.type_offre, 'vente_location'] } });
    }

    if (filters.marque) {
      andConditions.push({ marque: filters.marque });
    }

    if (filters.prix_min !== undefined || filters.prix_max !== undefined) {
      const priceFilter: Record<string, unknown> = {};
      if (filters.prix_min !== undefined) priceFilter.gte = filters.prix_min;
      if (filters.prix_max !== undefined) priceFilter.lte = filters.prix_max;
      // Le prix de vente et le loyer mensuel n'ont pas la même échelle :
      // le filtre ne s'applique qu'au prix correspondant au type d'offre
      // (prix de vente par défaut quand aucun type n'est choisi).
      const priceField = filters.type_offre === 'location'
        ? 'prix_location_mensuel'
        : 'prix_vente';
      andConditions.push({ [priceField]: priceFilter });
    }

    if (filters.annee_min !== undefined || filters.annee_max !== undefined) {
      const anneeFilter: Record<string, unknown> = {};
      if (filters.annee_min !== undefined) anneeFilter.gte = filters.annee_min;
      if (filters.annee_max !== undefined) anneeFilter.lte = filters.annee_max;
      andConditions.push({ annee: anneeFilter });
    }

    if (filters.kilometrage_max !== undefined) {
      andConditions.push({ kilometrage: { lte: filters.kilometrage_max } });
    }

    if (filters.carburant) {
      andConditions.push({ carburant: filters.carburant });
    }

    if (filters.transmission) {
      andConditions.push({ transmission: filters.transmission });
    }

    if (filters.statut) {
      andConditions.push({ statut: filters.statut });
    }
  }

  const where: Record<string, unknown> = andConditions.length > 0
    ? { AND: andConditions }
    : {};

  const page = Math.max(1, pagination?.page ?? 1);
  const limit = Math.min(
    Math.max(1, pagination?.limit ?? VEHICLES_PAGE_SIZE),
    VEHICLES_MAX_PAGE_SIZE
  );

  // Le tri secondaire sur id rend la pagination déterministe
  // quand plusieurs véhicules partagent le même created_at
  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicule.findMany({
      where,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: vehicleListSelect,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicule.count({ where }),
  ]);

  return {
    vehicles: vehicles.map((v) => ({
      ...v,
      prix_vente: toNumber(v.prix_vente),
      prix_location_mensuel: toNumber(v.prix_location_mensuel),
      created_at: v.created_at.toISOString(),
    })) as VehiculeListItem[],
    total,
  };
}

export async function getAllMarques(): Promise<string[]> {
  // groupBy est exécuté nativement par PostgreSQL, contrairement à
  // l'option distinct de findMany qui déduplique en mémoire
  const groups = await prisma.vehicule.groupBy({
    by: ['marque'],
    orderBy: { marque: 'asc' },
  });
  return groups.map((g) => g.marque);
}

export async function createVehicle(
  data: Omit<Vehicule, 'id' | 'created_at'>
): Promise<Vehicule> {
  const vehicle = await prisma.vehicule.create({
    data: {
      marque: data.marque,
      modele: data.modele,
      motorisation: data.motorisation,
      kilometrage: data.kilometrage,
      annee: data.annee,
      prix_vente: data.prix_vente ?? null,
      prix_location_mensuel: data.prix_location_mensuel ?? null,
      type_offre: data.type_offre,
      statut: data.statut,
      photos: data.photos,
      description: data.description,
      options: data.options ?? [],
      carburant: data.carburant,
      transmission: data.transmission,
      puissance: data.puissance,
      couleur: data.couleur,
    },
  });

  return {
    ...vehicle,
    prix_vente: toNumber(vehicle.prix_vente),
    prix_location_mensuel: toNumber(vehicle.prix_location_mensuel),
    created_at: vehicle.created_at.toISOString(),
  } as Vehicule;
}

export async function getVehicleById(id: string): Promise<Vehicule | null> {
  const vehicle = await prisma.vehicule.findUnique({ where: { id } });

  if (!vehicle) return null;

  return {
    ...vehicle,
    prix_vente: toNumber(vehicle.prix_vente),
    prix_location_mensuel: toNumber(vehicle.prix_location_mensuel),
    created_at: vehicle.created_at.toISOString(),
  } as Vehicule;
}

// ============================================
// DOSSIER OPERATIONS
// ============================================

export async function getDossierById(id: string): Promise<Dossier | null> {
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      documents: true,
      contrat_location: true,
      client: { select: { id: true, email: true, nom: true, prenom: true, telephone: true, adresse: true, role: true, created_at: true } },
      vehicule: true,
    },
  });

  if (!dossier) return null;

  return {
    ...dossier,
    date_creation: dossier.date_creation.toISOString(),
    date_modification: dossier.date_modification.toISOString(),
    prix_vente: toNumber(dossier.prix_vente),
    documents: dossier.documents.map((doc) => ({
      ...doc,
      date_upload: doc.date_upload.toISOString(),
    })),
    contrat_location: dossier.contrat_location ? {
      ...dossier.contrat_location,
      prix_mensuel: toNumber(dossier.contrat_location.prix_mensuel),
      prix_rachat: toNumber(dossier.contrat_location.prix_rachat),
      created_at: dossier.contrat_location.created_at.toISOString(),
    } : undefined,
  } as unknown as Dossier;
}

export async function getDossiersByClientId(clientId: string): Promise<Dossier[]> {
  const dossiers = await prisma.dossier.findMany({
    where: { client_id: clientId },
    include: {
      documents: true,
      contrat_location: true,
      vehicule: { select: { id: true, marque: true, modele: true } },
    },
    orderBy: { date_creation: 'desc' },
  });

  return dossiers.map((d) => ({
    ...d,
    date_creation: d.date_creation.toISOString(),
    date_modification: d.date_modification.toISOString(),
    prix_vente: toNumber(d.prix_vente),
    documents: d.documents.map((doc) => ({
      ...doc,
      date_upload: doc.date_upload.toISOString(),
    })),
    contrat_location: d.contrat_location ? {
      ...d.contrat_location,
      prix_mensuel: toNumber(d.contrat_location.prix_mensuel),
      prix_rachat: toNumber(d.contrat_location.prix_rachat),
      created_at: d.contrat_location.created_at.toISOString(),
    } : undefined,
  })) as unknown as Dossier[];
}

export async function getAllDossiers(): Promise<Dossier[]> {
  const dossiers = await prisma.dossier.findMany({
    include: {
      documents: true,
      contrat_location: true,
      client: { select: { id: true, email: true, nom: true, prenom: true, telephone: true, adresse: true, role: true, created_at: true } },
      vehicule: { select: { id: true, marque: true, modele: true } },
    },
    orderBy: { date_creation: 'desc' },
  });

  return dossiers.map((d) => ({
    ...d,
    date_creation: d.date_creation.toISOString(),
    date_modification: d.date_modification.toISOString(),
    prix_vente: toNumber(d.prix_vente),
    documents: d.documents.map((doc) => ({
      ...doc,
      date_upload: doc.date_upload.toISOString(),
    })),
    contrat_location: d.contrat_location ? {
      ...d.contrat_location,
      prix_mensuel: toNumber(d.contrat_location.prix_mensuel),
      prix_rachat: toNumber(d.contrat_location.prix_rachat),
      created_at: d.contrat_location.created_at.toISOString(),
    } : undefined,
  })) as unknown as Dossier[];
}

// ============================================
// OPTION OPERATIONS
// ============================================

export async function getAllOptions(): Promise<Option[]> {
  const options = await prisma.option.findMany({
    orderBy: { nom: 'asc' },
  });

  return options.map((o) => ({
    ...o,
    prix_mensuel: toNumber(o.prix_mensuel) as number,
    created_at: o.created_at.toISOString(),
  }));
}

/**
 * Couche d'accès aux données avec Prisma ORM
 *
 * Cette couche fournit une abstraction pour toutes les opérations de base de données.
 */

import { Utilisateur, Vehicule, VehicleFilters } from '@/lib/types';
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

export async function getVehicles(filters?: VehicleFilters): Promise<Vehicule[]> {
  const where: Record<string, unknown> = {};

  if (filters) {
    if (filters.search) {
      where.OR = [
        { marque: { contains: filters.search, mode: 'insensitive' } },
        { modele: { contains: filters.search, mode: 'insensitive' } },
        { motorisation: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.type_offre) {
      where.type_offre = { in: [filters.type_offre, 'vente_location'] };
    }

    if (filters.marque) {
      where.marque = filters.marque;
    }

    if (filters.prix_max) {
      where.OR = [
        { prix_vente: { lte: filters.prix_max } },
        { prix_location_mensuel: { lte: filters.prix_max } },
      ];
    }

    if (filters.annee_min) {
      where.annee = { gte: filters.annee_min };
    }

    if (filters.kilometrage_max) {
      where.kilometrage = { lte: filters.kilometrage_max };
    }

    if (filters.carburant) {
      where.carburant = filters.carburant;
    }

    if (filters.transmission) {
      where.transmission = filters.transmission;
    }

    if (filters.statut) {
      where.statut = filters.statut;
    }
  }

  const vehicles = await prisma.vehicule.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });

  return vehicles.map((v) => ({
    ...v,
    prix_vente: toNumber(v.prix_vente),
    prix_location_mensuel: toNumber(v.prix_location_mensuel),
    created_at: v.created_at.toISOString(),
  })) as Vehicule[];
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

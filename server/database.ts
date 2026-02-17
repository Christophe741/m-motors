/**
 * Couche d'accès aux données avec Prisma ORM
 *
 * Cette couche fournit une abstraction pour toutes les opérations de base de données.
 */

import { Utilisateur } from '@/lib/types';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

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

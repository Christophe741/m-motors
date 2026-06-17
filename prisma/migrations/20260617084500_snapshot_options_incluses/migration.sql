-- Snapshot des options souscrites dans un contrat de location.
-- La colonne passe d'un tableau d'IDs (TEXT[]) à un snapshot JSONB figé
-- [{ "nom": string, "prix_mensuel": number }]. La conversion n'est pas
-- castable automatiquement : on supprime et recrée la colonne (les contrats
-- existants en dev seront repeuplés par le seed).

-- AlterTable
ALTER TABLE "contrats_location" DROP COLUMN "options_incluses",
ADD COLUMN "options_incluses" JSONB NOT NULL DEFAULT '[]';

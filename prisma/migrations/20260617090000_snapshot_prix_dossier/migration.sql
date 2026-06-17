-- Snapshot des prix figés à la soumission d'un dossier.
-- prix_vente : prix de vente du véhicule figé sur le dossier (achat).
-- prix_mensuel : loyer de base figé sur le contrat de location.
-- Colonnes nullables et additives : aucune perte de données.

-- AlterTable
ALTER TABLE "dossiers" ADD COLUMN "prix_vente" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "contrats_location" ADD COLUMN "prix_mensuel" DECIMAL(10,2);

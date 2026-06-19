-- Rend obligatoires les caractéristiques que tout véhicule possède.
-- Ces champs étaient nullables « par confort » de saisie ; on impose désormais
-- des fiches complètes. Le formulaire de création les demande déjà, et le seed
-- les renseigne pour les 20 véhicules → aucune ligne existante en NULL.

-- AlterTable
ALTER TABLE "vehicules" ALTER COLUMN "carburant" SET NOT NULL,
ALTER COLUMN "transmission" SET NOT NULL,
ALTER COLUMN "puissance" SET NOT NULL,
ALTER COLUMN "couleur" SET NOT NULL;
